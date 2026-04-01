import {
  LayoutDashboard,
  BriefcaseBusiness,
  GraduationCap,
  Compass,
  FolderOpen,
  CircleCheckBig,
  Gift,
  Link,
  Users,
  Award,
  History,
  CircleUser,
  User,
  Shield
} from 'lucide-angular';
import type { MenuItem, MenuSection } from '@features/dashboard/shared/config/menu.config';

const USER_BASE = '/dashboard/user';

export const USER_MENU_CONFIG: MenuSection[] = [
  {
    title: "Vue d'ensemble",
    items: [
      {
        id: 'overview',
        label: 'Accueil',
        icon: LayoutDashboard,
        path: `${USER_BASE}/overview`,
        tooltip: 'Tableau de bord principal'
      }
    ]
  },
  {
    title: 'Mes Projets',
    items: [
      {
        id: 'entreprises',
        label: 'Mes Projets',
        icon: BriefcaseBusiness,
        path: `${USER_BASE}/ventures`,
        tooltip: 'Accéder à Mes Projets et Produits'
      }
    ]
  },
  {
    title: 'Programmes',
    items: [
      {
        id: 'programs',
        label: 'Programmes',
        icon: GraduationCap,
        children: [
          {
            id: 'programs-discover',
            label: 'Découvrir',
            icon: Compass,
            path: `${USER_BASE}/programs/discover`,
            tooltip: 'Explorer les programmes disponibles'
          },
          {
            id: 'programs-applications',
            label: 'Mes participations',
            icon: FolderOpen,
            path: `${USER_BASE}/programs/my-applications`,
            tooltip: 'Suivre mes candidatures et leurs statuts'
          },
          {
            id: 'programs-accepted',
            label: 'Mes parcours',
            icon: CircleCheckBig,
            path: `${USER_BASE}/programs/accepted`,
            tooltip: 'Accéder à mes programmes qualifiés et actifs'
          }
        ]
      }
    ]
  },
  {
    title: 'Communauté',
    items: [
      {
        id: 'referral',
        label: 'Parrainage',
        icon: Gift,
        children: [
          {
            id: 'referral-link',
            label: 'Mon lien de parrainage',
            icon: Link,
            path: `${USER_BASE}/referral/link`,
            tooltip: 'Générer et partager mon lien'
          },
          {
            id: 'referral-referred-users',
            label: 'Mes filleuls',
            icon: Users,
            path: `${USER_BASE}/referral/referred-users`,
            tooltip: 'Voir mes utilisateurs référés'
          },
          {
            id: 'referral-badges',
            label: 'Badges & progression',
            icon: Award,
            path: `${USER_BASE}/referral/badges`,
            tooltip: 'Mes badges et niveaux'
          },
          {
            id: 'referral-activity',
            label: 'Activité récente',
            icon: History,
            path: `${USER_BASE}/referral/activity`,
            tooltip: 'Timeline de mes parrainages'
          }
        ]
      }
    ]
  },
  {
    title: 'Mon Compte',
    items: [
      {
        id: 'profile',
        label: 'Mon Profil',
        icon: CircleUser,
        children: [
          {
            id: 'profile-info',
            label: 'Informations',
            icon: User,
            path: `${USER_BASE}/profile`,
            tooltip: 'Gérer mes informations personnelles'
          },
          {
            id: 'profile-security',
            label: 'Sécurité',
            icon: Shield,
            path: `${USER_BASE}/profile/security`,
            tooltip: 'Mot de passe et sécurité'
          },
          {
            id: 'profile-mentorship',
            label: 'Mentorat',
            icon: GraduationCap,
            path: `${USER_BASE}/mentor/apply`,
            tooltip: 'Devenir mentor ou gérer ma candidature'
          }
        ]
      }
    ]
  }
];

export function isUserMenuActive(item: MenuItem, currentPath: string): boolean {
  if (item.path && currentPath === item.path) return true;
  if (item.id === 'entreprises') {
    return currentPath.startsWith(`${USER_BASE}/ventures`) || currentPath.startsWith(`${USER_BASE}/products`);
  }
  if (item.children) {
    return item.children.some((child) => isUserMenuActive(child, currentPath));
  }
  return false;
}
