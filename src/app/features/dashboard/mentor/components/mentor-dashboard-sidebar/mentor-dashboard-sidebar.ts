import { Component, input, output, signal, ChangeDetectionStrategy, inject, effect, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';
import { filter } from 'rxjs';
import { AuthStore } from '@core/auth/auth.store';
import { LucideAngularModule, BadgeCheck, X, User, LogOut } from 'lucide-angular';
import { MENTOR_MENU_CONFIG, isMentorMenuActive } from '../../config/mentor-menu.config';
import type { MenuItem } from '@features/dashboard/shared/config/menu.config';

@Component({
  selector: 'app-mentor-dashboard-sidebar',
  imports: [NgClass, RouterModule, LucideAngularModule],
  templateUrl: './mentor-dashboard-sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MentorDashboardSidebar {
  private router = inject(Router);
  private authStore = inject(AuthStore);
  private destroyRef = inject(DestroyRef);

  isCollapsed = input<boolean>(false);
  isMobile = input<boolean>(false);

  closeSidebar = output<void>();
  navigate = output<string>();

  currentPath = signal<string>(this.router.url);
  expandedMenus = signal<Set<string>>(new Set());

  readonly menuConfig = MENTOR_MENU_CONFIG;

  readonly icons = {
    verified: BadgeCheck,
    close: X,
    person: User,
    logout: LogOut
  };

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currentPath.set(event.url);
          this.autoExpandActiveMenus();
        }
      });

    effect(() => {
      this.autoExpandActiveMenus();
    });
  }

  private autoExpandActiveMenus(): void {
    const currentPath = this.currentPath();
    const expanded = new Set<string>();

    this.menuConfig.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children && isMentorMenuActive(item, currentPath)) {
          expanded.add(item.id);
        }
      });
    });

    this.expandedMenus.set(expanded);
  }

  toggleMenu(menuId: string): void {
    const expanded = new Set(this.expandedMenus());
    if (expanded.has(menuId)) {
      expanded.delete(menuId);
    } else {
      expanded.add(menuId);
    }
    this.expandedMenus.set(expanded);
  }

  isMenuExpanded(menuId: string): boolean {
    return this.expandedMenus().has(menuId);
  }

  isActive(item: MenuItem): boolean {
    return isMentorMenuActive(item, this.currentPath());
  }

  isChildActive(child: MenuItem): boolean {
    return child.path ? this.currentPath() === child.path : false;
  }

  onMenuClick(item: MenuItem, event?: MouseEvent): void {
    if (item.disabled) {
      event?.preventDefault();
      return;
    }

    if (item.children && item.children.length > 0) {
      event?.preventDefault();
      this.toggleMenu(item.id);
      return;
    }

    if (item.path) {
      this.navigate.emit(item.path);
      if (this.isMobile()) {
        this.closeSidebar.emit();
      }
    }
  }

  onChildClick(child: MenuItem): void {
    if (child.disabled) return;

    if (child.path) {
      this.navigate.emit(child.path);
      if (this.isMobile()) {
        this.closeSidebar.emit();
      }
    }
  }

  onKeyDown(event: KeyboardEvent, item: MenuItem): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onMenuClick(item);
    }

    if (item.children && item.children.length > 0) {
      if (event.key === 'ArrowRight' && !this.isMenuExpanded(item.id)) {
        event.preventDefault();
        this.toggleMenu(item.id);
      }
      if (event.key === 'ArrowLeft' && this.isMenuExpanded(item.id)) {
        event.preventDefault();
        this.toggleMenu(item.id);
      }
    }
  }

  signOut(): void {
    this.authStore.signOut();
  }

  navigateToUserDashboard(): void {
    this.navigate.emit('/dashboard/user');
  }
}
