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
        loadComponent: () =>
          import('../dashboard/pages/mentor/dashboard/mentor-dashboard').then((c) => c.MentorDashboard)
      },
      {
        path: 'profile',
        title: 'Profil Mentor',
        loadComponent: () =>
          import('../dashboard/pages/mentor/profile/mentor-profile').then((c) => c.MentorProfile)
      },
      {
        path: 'mentored-projects',
        title: 'Projets mentorés',
        loadComponent: () =>
          import('../dashboard/pages/mentor/mentored-projects/mentored-projects').then(
            (c) => c.MentoredProjects
          )
      },
      {
        path: 'mentored-projects/:projectId',
        title: 'Candidatures du projet',
        loadComponent: () =>
          import('../dashboard/pages/mentor/mentored-project-detail/mentored-project-detail').then(
            (c) => c.MentoredProjectDetail
          )
      },
      {
        path: 'mentored-projects/:projectId/participations/:participationId',
        title: 'Détail candidature',
        loadComponent: () =>
          import(
            '../dashboard/pages/mentor/mentored-participation-detail/mentored-participation-detail'
          ).then((c) => c.MentoredParticipationDetail)
      },
      {
        path: 'resources',
        title: 'Ressources',
        loadComponent: () =>
          import('../dashboard/pages/mentor/resources/resources-list/resources-list').then(
            (c) => c.ResourcesList
          )
      },
      {
        path: 'resources/:id',
        title: 'Détail ressource',
        loadComponent: () =>
          import('../dashboard/pages/mentor/resources/resource-detail/resource-detail').then(
            (c) => c.ResourceDetail
          )
      }
    ]
  }
];
