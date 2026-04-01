import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReferralsStore } from '@features/dashboard/shared/store/referrals.store';
import { AuthStore } from '@core/auth/auth.store';
import { ReferralBadgesService, BadgeLevel } from '@features/dashboard/shared/services/referral-badges.service';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Check,
  Crown,
  Flag,
  Info,
  Link,
  LockKeyhole,
  LucideAngularModule,
  LucideIconData,
  Share2,
  Sparkles,
  TrendingUp,
  Trophy
} from 'lucide-angular';

@Component({
  selector: 'app-referral-badges',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './badges.html'
})
export class ReferralBadges implements OnInit {
  referralsStore = inject(ReferralsStore);
  authStore = inject(AuthStore);
  badgesService = inject(ReferralBadgesService);

  readonly icons = {
    arrowRight: ArrowRight,
    award: Award,
    check: Check,
    crown: Crown,
    flag: Flag,
    info: Info,
    link: Link,
    lock: LockKeyhole,
    share: Share2,
    sparkles: Sparkles,
    trendingUp: TrendingUp,
    trophy: Trophy,
    verified: BadgeCheck
  };

  private readonly badgeIconMap: Record<string, LucideIconData> = {
    award: Award,
    'trending-up': TrendingUp,
    crown: Crown,
    sparkles: Sparkles,
    trophy: Trophy
  };

  referralsCount = computed(() => {
    return this.authStore.user()?.referralsCount || this.referralsStore.referredUsers().length || 0;
  });

  badgeProgress = computed(() => {
    return this.badgesService.calculateProgress(this.referralsCount());
  });

  allBadges = computed(() => {
    return this.badgesService.getAllBadges();
  });

  unlockedBadges = computed(() => {
    return this.badgesService.getUnlockedBadges(this.referralsCount());
  });

  lockedBadges = computed(() => {
    return this.badgesService.getLockedBadges(this.referralsCount());
  });

  ngOnInit() {
    if (this.referralsStore.referredUsers().length === 0) {
      this.referralsStore.loadReferredUsers({ page: 1 });
    }
  }

  getBadgeGradientClass(color: string): string {
    const gradientMap: Record<string, string> = {
      emerald: 'from-emerald-400 to-emerald-600',
      blue: 'from-blue-400 to-blue-600',
      purple: 'from-purple-400 to-purple-600',
      orange: 'from-orange-400 to-orange-600',
      amber: 'from-amber-400 to-amber-600',
      slate: 'from-slate-300 to-slate-500'
    };
    return gradientMap[color] || 'from-slate-300 to-slate-500';
  }

  getBadgeShadowClass(color: string): string {
    const shadowMap: Record<string, string> = {
      emerald: 'shadow-emerald-500/40',
      blue: 'shadow-blue-500/40',
      purple: 'shadow-purple-500/40',
      orange: 'shadow-orange-500/40',
      amber: 'shadow-amber-500/40',
      slate: 'shadow-slate-300/20'
    };
    return shadowMap[color] || 'shadow-slate-300/20';
  }

  isBadgeUnlocked(badge: BadgeLevel): boolean {
    return this.referralsCount() >= badge.minReferrals;
  }

  resolveBadgeIcon(icon: string): LucideIconData {
    return this.badgeIconMap[icon] ?? Award;
  }
}
