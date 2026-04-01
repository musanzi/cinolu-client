import { Component, inject, computed, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { ReferralsStore } from '@features/dashboard/shared/store/referrals.store';
import { calculateBadgeInfo } from '@shared/helpers/badges.helper';
import { BadgeProgressBarComponent } from '@shared/components/badge-progress-bar/badge-progress-bar';
import { ShareModalComponent } from '@shared/components/share-modal/share-modal';
import { ToastrService } from '@core/services/toast/toastr.service';
import {
  LucideAngularModule,
  Award,
  TrendingUp,
  Crown,
  Sparkles,
  Trophy,
  Share2,
  Copy,
  Target,
  UserRoundPlus,
  Link
} from 'lucide-angular';

@Component({
  selector: 'app-referral-badge-card',

  imports: [NgClass, BadgeProgressBarComponent, ShareModalComponent, LucideAngularModule],
  templateUrl: './referral-badge-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReferralBadgeCardComponent {
  private referralsStore = inject(ReferralsStore);
  private toast = inject(ToastrService);

  showShareModal = signal(false);

  share = output<string>();
  copyLink = output<string>();

  icons = {
    award: Award,
    trendingUp: TrendingUp,
    crown: Crown,
    sparkles: Sparkles,
    trophy: Trophy,
    share: Share2,
    copy: Copy,
    target: Target,
    groupAdd: UserRoundPlus,
    link: Link
  };

  badgeInfo = computed(() => {
    const totalCount = this.referralsStore.referredUsersTotalCount();
    return calculateBadgeInfo(totalCount);
  });

  referralLink = computed(() => {
    const code = this.referralsStore.referralCode();
    return code ? `${window.location.origin}/sign-up?ref=${code}` : '';
  });

  getBadgeIcon() {
    const iconName = this.badgeInfo().currentBadge.icon;
    const iconMap: Record<string, typeof Award> = {
      award: Award,
      'trending-up': TrendingUp,
      crown: Crown,
      sparkles: Sparkles,
      trophy: Trophy
    };
    return iconMap[iconName] || Award;
  }

  onShareClick() {
    this.showShareModal.set(true);
  }

  onCopyClick() {
    const link = this.referralLink();
    if (link) {
      navigator.clipboard
        .writeText(link)
        .then(() => {
          this.toast.showSuccess('Lien de parrainage copié !');
          this.copyLink.emit(link);
        })
        .catch(() => {
          this.toast.showError('Erreur lors de la copie du lien');
        });
    }
  }

  onCopySuccess() {
    this.toast.showSuccess('Lien copié !');
  }
}
