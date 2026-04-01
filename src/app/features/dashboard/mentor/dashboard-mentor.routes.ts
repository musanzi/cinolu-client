import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { mentorGuard } from '@core/guards/mentor.guard';

export const dashboardMentorRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard, mentorGuard],
    loadComponent: () =>
      import('./components/mentor-dashboard-layout/mentor-dashboard-layout').then((c) => c.MentorDashboardLayout),
    children: [
      {
        path: '',
        title: 'Dashboard Mentor',
        loadComponent: () => import('./pages/mentor-dashboard').then((c) => c.MentorDashboard)
      },
      {
        path: 'profile',
        title: 'Profil Mentor',
        loadComponent: () => import('./pages/profile/mentor-profile').then((c) => c.MentorProfile)
      },
      {
        path: 'mentored-projects',
        title: 'Projets mentorés',
        loadComponent: () => import('./pages/mentored-projects/mentored-projects').then((c) => c.MentoredProjects)
      },
      {
        path: 'mentored-projects/:projectId',
        title: 'Candidatures du projet',
        loadComponent: () => import('./pages/mentored-project-detail/mentored-project-detail').then((c) => c.MentoredProjectDetail)
      },
      {
        path: 'mentored-projects/participations/:participationId',
        title: 'Détail candidature',
        loadComponent: () =>
          import('./pages/mentored-participation-detail/mentored-participation-detail').then(
            (c) => c.MentoredParticipationDetail
          )
      }
      // Routes "resources" removed - resources are now managed within mentored projects
    ]
  }
];
