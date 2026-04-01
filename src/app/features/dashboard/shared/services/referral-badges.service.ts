import { Injectable } from '@angular/core';

export interface BadgeLevel {
  level: number;
  name: string; 
  secondaryLevel: string;
  icon: string;
  color: string;
  gradient: string;
  minReferrals: number;
  maxReferrals: number | null;
  description: string;
}

export interface BadgeProgress {
  currentBadge: BadgeLevel;
  nextBadge: BadgeLevel | null;
  progress: number;
  referralsCount: number;
  referralsToNext: number;
  isMaxLevel: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ReferralBadgesService {
  private readonly badges: BadgeLevel[] = [
    {
      level: 1,
      name: 'Ambassadeur',
      secondaryLevel: 'Bronze',
      icon: 'verified',
      color: 'orange',
      gradient: 'from-orange-600 to-orange-800',
      minReferrals: 1,
      maxReferrals: 4,
      description: "Niveau Bronze - Tes premiers pas en tant qu'Ambassadeur"
    },
    {
      level: 2,
      name: 'Ambassadeur',
      secondaryLevel: 'Argent',
      icon: 'verified',
      color: 'slate',
      gradient: 'from-slate-400 to-slate-600',
      minReferrals: 5,
      maxReferrals: 14,
      description: 'Niveau Argent - Ta progression se confirme'
    },
    {
      level: 3,
      name: 'Ambassadeur',
      secondaryLevel: 'Or',
      icon: 'verified',
      color: 'amber',
      gradient: 'from-amber-400 to-amber-600',
      minReferrals: 15,
      maxReferrals: 29,
      description: 'Niveau Or - Un impact significatif sur la communauté'
    },
    {
      level: 4,
      name: 'Ambassadeur',
      secondaryLevel: 'Diamant',
      icon: 'verified',
      color: 'blue',
      gradient: 'from-blue-400 to-blue-600',
      minReferrals: 30,
      maxReferrals: 49,
      description: 'Niveau Diamant - Excellence reconnue'
    },
    {
      level: 5,
      name: 'Ambassadeur',
      secondaryLevel: 'Légende',
      icon: 'verified',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-700',
      minReferrals: 50,
      maxReferrals: null,
      description: 'Niveau Légende - Statut légendaire atteint'
    }
  ];

  getAllBadges(): BadgeLevel[] {
    return this.badges;
  }

  getBadgeByReferrals(referralsCount: number): BadgeLevel {
    for (let i = this.badges.length - 1; i >= 0; i--) {
      const badge = this.badges[i];
      if (referralsCount >= badge.minReferrals) {
        return badge;
      }
    }
    return {
      level: 0,
      name: 'Ambassadeur',
      secondaryLevel: 'Aucun niveau',
      icon: 'verified',
      color: 'slate',
      gradient: 'from-slate-300 to-slate-500',
      minReferrals: 0,
      maxReferrals: 0,
      description: 'Invite ton premier membre pour débloquer le niveau Bronze'
    };
  }

  getNextBadge(currentReferrals: number): BadgeLevel | null {
    if (currentReferrals === 0) {
      return this.badges[0];
    }

    const currentBadge = this.getBadgeByReferrals(currentReferrals);
    const currentIndex = this.badges.findIndex((b) => b.level === currentBadge.level);

    if (currentIndex === -1 || currentIndex === this.badges.length - 1) {
      return null;
    }

    return this.badges[currentIndex + 1];
  }

  calculateProgress(referralsCount: number): BadgeProgress {
    const currentBadge = this.getBadgeByReferrals(referralsCount);
    const nextBadge = this.getNextBadge(referralsCount);

    if (referralsCount === 0 && nextBadge) {
      return {
        currentBadge,
        nextBadge,
        progress: 0,
        referralsCount,
        referralsToNext: nextBadge.minReferrals,
        isMaxLevel: false
      };
    }

    if (!nextBadge) {
      return {
        currentBadge,
        nextBadge: null,
        progress: 100,
        referralsCount,
        referralsToNext: 0,
        isMaxLevel: true
      };
    }

    const rangeStart = currentBadge.minReferrals;
    const rangeEnd = nextBadge.minReferrals;
    const progress = Math.min(100, ((referralsCount - rangeStart) / (rangeEnd - rangeStart)) * 100);
    const referralsToNext = nextBadge.minReferrals - referralsCount;

    return {
      currentBadge,
      nextBadge,
      progress,
      referralsCount,
      referralsToNext,
      isMaxLevel: false
    };
  }

  getUnlockedBadges(referralsCount: number): BadgeLevel[] {
    return this.badges.filter((badge) => referralsCount >= badge.minReferrals);
  }

  getLockedBadges(referralsCount: number): BadgeLevel[] {
    return this.badges.filter((badge) => referralsCount < badge.minReferrals);
  }
}
