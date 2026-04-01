import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReferralsStore } from '@features/dashboard/shared/store/referrals.store';
import { AuthStore } from '@core/auth/auth.store';
import { ReferralBadgesService, BadgeLevel } from '@features/dashboard/shared/services/referral-badges.service';
import { IUser } from '@shared/models/entities.models';
import { REFERRAL_CONFIG } from '@features/dashboard/shared/config/referral.constants';
import { ReferralCtaCard } from '../../../components/referral-cta-card/referral-cta-card';
import {
  Award,
  CalendarCheck,
  CalendarX,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  Crown,
  History,
  LucideAngularModule,
  LucideIconData,
  Mail,
  Share2,
  Sparkles,
  Trophy,
  TrendingUp,
  User,
  UserPlus,
  Users
} from 'lucide-angular';

interface TimelineEvent {
  id: string;
  type: 'invitation' | 'badge_unlocked';
  date: Date;
  title: string;
  description: string;
  icon: string;
  color: string;
  user?: IUser;
  badge?: BadgeLevel;
}

@Component({
  selector: 'app-referral-activity',
  imports: [CommonModule, RouterModule, ReferralCtaCard, LucideAngularModule],
  templateUrl: './activity.html'
})
export class ReferralActivity implements OnInit {
  referralsStore = inject(ReferralsStore);
  authStore = inject(AuthStore);
  badgesService = inject(ReferralBadgesService);

  maxEventsToShow = REFERRAL_CONFIG.MAX_TIMELINE_EVENTS;

  readonly icons = {
    award: Award,
    badgeUnlocked: Trophy,
    calendarCheck: CalendarCheck,
    calendarX: CalendarX,
    expandMore: ChevronDown,
    history: History,
    mail: Mail,
    person: User,
    personAdd: UserPlus,
    share: Share2,
    timeline: ChartNoAxesColumnIncreasing,
    users: Users
  };

  private readonly badgeIconMap: Record<string, LucideIconData> = {
    award: Award,
    'trending-up': TrendingUp,
    crown: Crown,
    sparkles: Sparkles,
    trophy: Trophy,
    person_add: UserPlus
  };

  timelineEvents = computed<TimelineEvent[]>(() => {
    const events: TimelineEvent[] = [];
    const users = this.referralsStore.referredUsers();

    users.forEach((user) => {
      events.push({
        id: `invitation-${user.id}`,
        type: 'invitation',
        date: new Date(user.created_at),
        title: 'Nouvelle inscription',
        description: `${user.name} s'est inscrit via ton lien de parrainage`,
        icon: 'person_add',
        color: 'primary',
        user
      });
    });

    const allBadges = this.badgesService.getAllBadges();
    const currentCount = users.length;

    allBadges.forEach((badge) => {
      if (currentCount >= badge.minReferrals) {
        const triggerUser = users[badge.minReferrals - 1];
        if (triggerUser) {
          events.push({
            id: `badge-${badge.level}`,
            type: 'badge_unlocked',
            date: new Date(triggerUser.created_at),
            title: `Badge débloqué : ${badge.name}`,
            description: `Tu as atteint ${badge.minReferrals} inscriptions et débloqué le badge ${badge.name}`,
            icon: badge.icon,
            color: badge.color,
            badge
          });
        }
      }
    });

    return events.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, this.maxEventsToShow);
  });

  totalEvents = computed(() => this.timelineEvents().length);
  referralEvents = computed(() => this.timelineEvents().filter((e) => e.type === 'invitation').length);
  badgeEvents = computed(() => this.timelineEvents().filter((e) => e.type === 'badge_unlocked').length);

  ngOnInit() {
    if (this.referralsStore.referredUsers().length === 0) {
      this.referralsStore.loadReferredUsers({ page: 1 });
    }
  }

  formatTime(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "À l'instant";
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return `Il y a ${Math.floor(diffDays / 365)} ans`;
  }

  getColorClasses(color: string) {
    const colorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      primary: {
        bg: 'bg-primary-50',
        border: 'border-primary-200',
        text: 'text-primary-700',
        icon: 'bg-linear-to-br from-primary-400 to-primary-600'
      },
      emerald: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        icon: 'bg-linear-to-br from-emerald-400 to-emerald-600'
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: 'bg-linear-to-br from-blue-400 to-blue-600'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        icon: 'bg-linear-to-br from-purple-400 to-purple-600'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        icon: 'bg-linear-to-br from-orange-400 to-orange-600'
      },
      amber: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        icon: 'bg-linear-to-br from-amber-400 to-amber-600'
      }
    };
    return colorMap[color] || colorMap['primary'];
  }

  resolveEventIcon(icon: string): LucideIconData {
    return this.badgeIconMap[icon] ?? Award;
  }
}
