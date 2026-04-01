import { Component, inject, signal, OnInit, ChangeDetectionStrategy, HostListener, effect } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { BackButton } from '@shared/components';
import { UserDashboardSidebar } from '../user-dashboard-sidebar/user-dashboard-sidebar';
import { UserDashboardHeader } from '../user-dashboard-header/user-dashboard-header';

@Component({
  selector: 'app-user-dashboard-layout',
  imports: [RouterModule, BackButton, UserDashboardSidebar, UserDashboardHeader],
  templateUrl: './user-dashboard-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDashboardLayout implements OnInit {
  private router = inject(Router);

  isSidebarCollapsed = signal(false);
  isMobileSidebarOpen = signal(false);
  isMobile = signal(false);

  constructor() {
    effect(() => {
      const open = this.isMobileSidebarOpen();
      document.body.style.overflow = open ? 'hidden' : '';
      return () => {
        document.body.style.overflow = '';
      };
    });
  }

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobile.set(window.innerWidth < 1024);
  }

  toggleSidebar(): void {
    if (this.isMobile()) {
      this.isMobileSidebarOpen.update((v) => !v);
    } else {
      this.isSidebarCollapsed.update((v) => !v);
    }
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  navigateTo(path: string): void {
    this.router.navigateByUrl(path);
  }
}
