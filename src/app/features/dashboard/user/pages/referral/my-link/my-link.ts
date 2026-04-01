import { Component, inject, OnInit, computed, signal, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ReferralsStore } from '@features/dashboard/shared/store/referrals.store';
import { AuthStore } from '@core/auth/auth.store';
import { ToastrService } from '@core/services/toast/toastr.service';
import { environment } from '@environments/environment';
import { REFERRAL_CONFIG, QRCodeCache } from '@features/dashboard/shared/config/referral.constants';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  ChartColumnBig,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Crown,
  Download,
  Info,
  Link,
  Link2,
  LucideAngularModule,
  Megaphone,
  MessageSquare,
  Podcast,
  QrCode,
  ScanQrCode,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Building
} from 'lucide-angular';
import {
  shareToLinkedIn,
  shareToFacebook,
  shareToWhatsAppWithMessage,
  shareToTwitterWithMessage
} from '@shared/helpers/social-share.helper';

@Component({
  selector: 'app-my-referral-link',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './my-link.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyReferralLink implements OnInit {
  referralsStore = inject(ReferralsStore);
  authStore = inject(AuthStore);
  toast = inject(ToastrService);
  sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);

  qrCodeDataUrl = signal<string | null>(null);
  isGeneratingQR = signal(false);
  showAllBenefits = signal(false);

  readonly icons = {
    addLink: Link2,
    arrowRight: ArrowRight,
    award: Award,
    business: Building,
    campaign: Megaphone,
    copy: ClipboardCopy,
    crown: Crown,
    download: Download,
    expandLess: ChevronUp,
    expandMore: ChevronDown,
    info: Info,
    insights: ChartColumnBig,
    link: Link,
    podcasts: Podcast,
    qrCode: QrCode,
    qrScanner: ScanQrCode,
    security: Shield,
    sparkles: Sparkles,
    trendingUp: TrendingUp,
    users: Users,
    message: MessageSquare,
    verified: BadgeCheck
  };

  referralLink = computed(() => {
    const code = this.referralsStore.referralCode() || this.authStore.user()?.referral_code;
    if (!code) return null;
    return `${environment.appUrl}sign-up?ref=${code}`;
  });

  ngOnInit() {
    const code = this.authStore.user()?.referral_code;
    if (code) {
      this.referralsStore.setReferralCode(code);
      this.loadQRCodeFromCache(code);
    }
  }

  private loadQRCodeFromCache(code: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const cacheKey = REFERRAL_CONFIG.QR_CODE_CACHE_KEY;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const cache: QRCodeCache = JSON.parse(cached);
        const now = Date.now();

        if (cache.referralCode === code && now - cache.timestamp < REFERRAL_CONFIG.QR_CODE_CACHE_TTL) {
          this.qrCodeDataUrl.set(cache.dataUrl);
          return;
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du cache QR Code:', error);
    }

    this.generateQRCode();
  }

  onGenerateCode() {
    this.referralsStore.generateReferralCode();
    const unsubscribe = setInterval(() => {
      if (this.referralLink()) {
        this.generateQRCode();
        clearInterval(unsubscribe);
      }
    }, 100);
    setTimeout(() => clearInterval(unsubscribe), 5000);
  }

  async onCopyLink() {
    const link = this.referralLink();
    if (!link) {
      this.toast.showError('Aucun lien de parrainage disponible');
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      this.toast.showSuccess('Lien copié dans le presse-papier !');
    } catch {
      this.toast.showError('Erreur lors de la copie');
    }
  }

  shareOnWhatsApp() {
    const link = this.referralLink();
    if (!link) return;
    shareToWhatsAppWithMessage(link, REFERRAL_CONFIG.SOCIAL_MESSAGES.WHATSAPP);
  }

  shareOnLinkedIn() {
    const link = this.referralLink();
    if (!link) return;
    shareToLinkedIn(link);
  }

  shareOnFacebook() {
    const link = this.referralLink();
    if (!link) return;
    shareToFacebook(link);
  }

  shareOnTwitter() {
    const link = this.referralLink();
    if (!link) return;
    shareToTwitterWithMessage(link, REFERRAL_CONFIG.SOCIAL_MESSAGES.TWITTER);
  }

  private async generateQRCode() {
    const link = this.referralLink();
    const code = this.referralsStore.referralCode() || this.authStore.user()?.referral_code;
    if (!link || !code) return;

    this.isGeneratingQR.set(true);
    try {
      const size = REFERRAL_CONFIG.QR_CODE_SIZE;
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(link)}`;
      this.qrCodeDataUrl.set(qrApiUrl);

      const cache: QRCodeCache = {
        dataUrl: qrApiUrl,
        referralCode: code,
        timestamp: Date.now()
      };
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(REFERRAL_CONFIG.QR_CODE_CACHE_KEY, JSON.stringify(cache));
      }
    } catch (error) {
      console.error('Erreur génération QR code:', error);
      this.toast.showError('Erreur lors de la génération du QR code');
    } finally {
      this.isGeneratingQR.set(false);
    }
  }

  async downloadQRCode() {
    const qrUrl = this.qrCodeDataUrl();
    if (!qrUrl) return;
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const code = this.referralsStore.referralCode() || this.authStore.user()?.referral_code || 'code';
      a.download = `cinolu-referral-qr-${code}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      this.toast.showSuccess('QR Code téléchargé !');
    } catch {
      this.toast.showError('Erreur lors du téléchargement');
    }
  }
}
