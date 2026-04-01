import {
  Component,
  input,
  output,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
  OnDestroy,
  HostListener
} from '@angular/core';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { RightsService } from '@core/auth/rights.service';
import { ApiImgPipe } from '@shared/pipes';
import { environment } from '@environments/environment';
import {
  LucideAngularModule,
  Menu,
  Clock3,
  ShieldCheck,
  KeyRound,
  CircleQuestionMark,
  ChevronDown,
  BadgeCheck,
  CircleUser,
  Shield,
  UserRoundPlus,
  LogOut
} from 'lucide-angular';

@Component({
  selector: 'app-user-dashboard-header',
  imports: [NgClass, NgOptimizedImage, ApiImgPipe, RouterLink, LucideAngularModule],
  templateUrl: './user-dashboard-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDashboardHeader implements OnDestroy {
  private authStore = inject(AuthStore);
  private rightsService = inject(RightsService);

  readonly icons = {
    menu: Menu,
    clock: Clock3,
    adminPanel: ShieldCheck,
    key: KeyRound,
    help: CircleQuestionMark,
    chevronDown: ChevronDown,
    verified: BadgeCheck,
    accountCircle: CircleUser,
    security: Shield,
    groupAdd: UserRoundPlus,
    logout: LogOut
  };

  isMobile = input<boolean>(false);

  toggleSidebar = output<void>();

  showUserMenu = signal(false);
  private clockTimer?: number;
  currentTime = signal(new Date());

  user = computed(() => this.authStore.user());
  referralCode = computed(() => this.authStore.user()?.referral_code || 'N/A');
  venturesCount = computed(() => {
    const u = this.authStore.user();
    if (u && 'venturesCount' in u) {
      return (u as unknown as { venturesCount?: number }).venturesCount ?? 0;
    }
    return 0;
  });

  readonly adminDashboardUrl = environment.onestopUrl;
  showAdminLink = computed(() => this.rightsService.isAdminOrStaff(this.user()));

  formattedTime = computed(() =>
    this.currentTime().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  dateLabel = computed(() =>
    this.currentTime().toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  );

  shortTime = computed(() => this.currentTime().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));

  displayTime = computed(() => (this.isMobile && this.isMobile() ? this.shortTime() : this.formattedTime()));

  constructor() {
    if (typeof window !== 'undefined') {
      this.clockTimer = window.setInterval(() => this.currentTime.set(new Date()), 1000);
    }
  }

  getRoleLabel(): string {
    return this.rightsService.getRoleLabel(this.user());
  }

  getUserInitials(): string {
    const name = this.user()?.name || 'U';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  onUserMenuClick(event: MouseEvent): void {
    event.stopPropagation();
    this.showUserMenu.update((v) => !v);
  }

  closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  signOut(): void {
    this.closeUserMenu();
    this.authStore.signOut();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const menuButton = target.closest('.user-menu-button');
    const menuDropdown = target.closest('.user-menu-dropdown');

    if (!menuButton && !menuDropdown && this.showUserMenu()) {
      this.closeUserMenu();
    }
  }

  ngOnDestroy(): void {
    if (this.clockTimer !== undefined) {
      clearInterval(this.clockTimer);
      this.clockTimer = undefined;
    }
  }
}
