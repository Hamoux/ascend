import { BarChart3, CalendarDays, Gift, LayoutDashboard, Settings, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AppView } from '@/types';
import type { TKey } from '@/i18n';

export interface NavItem {
  view: AppView;
  labelKey: TKey;
  icon: LucideIcon;
  /** Shown in the mobile bottom bar. */
  primary: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { view: 'dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, primary: true },
  { view: 'habits', labelKey: 'nav.habits', icon: Target, primary: true },
  { view: 'rewards', labelKey: 'nav.rewards', icon: Gift, primary: true },
  { view: 'analytics', labelKey: 'nav.analytics', icon: BarChart3, primary: true },
  { view: 'calendar', labelKey: 'nav.calendar', icon: CalendarDays, primary: true },
  { view: 'settings', labelKey: 'nav.settings', icon: Settings, primary: false },
];
