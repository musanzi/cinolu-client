import { Routes } from '@angular/router';
import { dashboardLandingGuard } from '@core/guards/dashboard-landing.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    canActivate: [dashboardLandingGuard],
    loadComponent: () =>
      import('./shared/components/dashboard-landing/dashboard-landing').then((c) => c.DashboardLanding)
  },
  {
    path: 'user',
    loadChildren: () => import('./user/dashboard-user.routes').then((m) => m.dashboardUserRoutes)
  },
  {
    path: 'mentor',
    loadChildren: () => import('./mentor/dashboard-mentor.routes').then((m) => m.dashboardMentorRoutes)
  }
];
