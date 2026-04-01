import { LayoutDashboard, Badge, GraduationCap } from 'lucide-angular';
import type { MenuItem, MenuSection } from '@features/dashboard/shared/config/menu.config';

const MENTOR_BASE = '/dashboard/mentor';

export const MENTOR_MENU_CONFIG: MenuSection[] = [
  {
    title: 'Espace Mentor',
    items: [
      {
        id: 'mentor-dashboard',
        label: 'Accueil',
        icon: LayoutDashboard,
        path: MENTOR_BASE,
        tooltip: 'Tableau de bord mentor'
      },
      {
        id: 'mentor-profile',
        label: 'Profil Mentor',
        icon: Badge,
        path: MENTOR_BASE + '/profile',
        tooltip: 'Gérer mon profil de mentor'
      },
      {
        id: 'mentor-mentored-projects',
        label: 'Projets mentorés',
        icon: GraduationCap,
        path: MENTOR_BASE + '/mentored-projects',
        tooltip: 'Voir les projets dont je suis mentor'
      }
    ]
  }
];

export function isMentorMenuActive(item: MenuItem, currentPath: string): boolean {
  if (item.path && currentPath === item.path) return true;
  if (item.children) {
    return item.children.some((child) => isMentorMenuActive(child, currentPath));
  }
  return false;
}
