import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReferralsStore } from '@features/dashboard/shared/store/referrals.store';
import { Award, LucideAngularModule, LucideIconData, UserPlus } from 'lucide-angular';

interface ReferralActivity {
  id: string;
  type: 'signup' | 'badge_unlocked';
  message: string;
  date: Date;
  icon: LucideIconData;
  iconColor: string;
}

@Component({
  selector: 'app-referral-activity-timeline',

  imports: [DatePipe, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './referral-activity-timeline.html'
})
export class ReferralActivityTimelineComponent {
  private referralsStore = inject(ReferralsStore);

  icons = {
    userPlus: UserPlus,
    award: Award
  };

  activities = computed<ReferralActivity[]>(() => {
    const referredUsers = this.referralsStore.referredUsers();

    const signupActivities: ReferralActivity[] = referredUsers.slice(0, 5).map((user) => ({
      id: `signup-${user.id}`,
      type: 'signup' as const,
      message: `${user.name || 'Un utilisateur'} a rejoint Cinolu via ton lien`,
      date: new Date(user.created_at),
      icon: this.icons.userPlus,
      iconColor: 'bg-blue-100 text-blue-600'
    }));

    return signupActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
  });
}
