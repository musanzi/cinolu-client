import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReferralsStore } from '@features/dashboard/shared/store/referrals.store';
import { AuthStore } from '@core/auth/auth.store';
import { IUser } from '@shared/models/entities.models';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import { ReferralCtaCard } from '../../../components/referral-cta-card/referral-cta-card';
import {
  Award,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LucideAngularModule,
  Share2,
  UserX,
  Users
} from 'lucide-angular';

@Component({
  selector: 'app-my-referrals',
  imports: [CommonModule, RouterModule, ApiImgPipe, ReferralCtaCard, LucideAngularModule],
  templateUrl: './my-referrals.html',
  standalone: true
})
export class MyReferrals implements OnInit {
  referralsStore = inject(ReferralsStore);
  authStore = inject(AuthStore);

  readonly icons = {
    award: Award,
    calendar: CalendarDays,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    share: Share2,
    userOff: UserX,
    users: Users
  };

  currentPage = signal(1);
  itemsPerPage = 12;

  invitedUsers = computed(() => this.referralsStore.referredUsers());

  paginatedUsers = computed(() => {
    const users = this.invitedUsers();
    const page = this.currentPage();
    const start = (page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return users.slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.invitedUsers().length / this.itemsPerPage);
  });

  totalInvitations = computed(() => this.referralsStore.referredUsers().length);

  ngOnInit() {
    this.referralsStore.loadReferredUsers({ page: 1 });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage() {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  formatDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  getUserInitials(user: IUser): string {
    if (!user.name) return '?';
    const parts = user.name.split(' ');
    if (parts.length >= 2) {
      return parts[0].charAt(0) + parts[1].charAt(0);
    }
    return parts[0].charAt(0);
  }
}
