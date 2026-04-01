import { Component, inject, OnInit, ChangeDetectionStrategy, effect } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { MentorDashboardStore } from '@features/dashboard/shared/store/mentor-dashboard.store';
import { MentorProfileStore } from '@features/dashboard/shared/store/mentor-profile.store';
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Calendar,
  ChartColumnBig,
  CheckCheck,
  Clock3,
  GraduationCap,
  History,
  Inbox,
  LucideAngularModule,
  Mail,
  RefreshCw,
  Star,
  TrendingUp,
  User,
  Users
} from 'lucide-angular';

@Component({
  selector: 'app-mentor-dashboard',
  imports: [RouterModule, LucideAngularModule],
  templateUrl: './mentor-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MentorDashboard implements OnInit {
  authStore = inject(AuthStore);
  profileStore = inject(MentorProfileStore);
  dashboardStore = inject(MentorDashboardStore);

  readonly icons = {
    arrowRight: ArrowRight,
    checkedAll: CheckCheck,
    clock: Clock3,
    inbox: Inbox,
    insights: ChartColumnBig,
    mail: Mail,
    mentees: Users,
    notifications: BellRing,
    profile: User,
    rating: Star,
    school: GraduationCap,
    sessions: Calendar,
    statusApproved: BadgeCheck,
    trendingUp: TrendingUp,
    update: RefreshCw,
    history: History
  };

  constructor() {
    // Charger le profil mentor quand l'utilisateur change
    effect(() => {
      const user = this.authStore.user();
      if (user?.mentor_profile) {
        this.profileStore.loadProfileFromAuth();
      }
    });
  }

  ngOnInit(): void {
    this.dashboardStore.loadStats();
  }
}
