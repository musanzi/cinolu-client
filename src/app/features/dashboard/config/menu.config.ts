import { LucideIconData } from 'lucide-angular';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIconData;
  path?: string;
  badge?: {
    count: number;
    color: 'primary' | 'success' | 'warning' | 'danger';
  };
  children?: MenuItem[];
  roles?: string[];
  isExternal?: boolean;
  disabled?: boolean;
  tooltip?: string;
}

export interface MenuSection {
  title?: string;
  items: MenuItem[];
}
