import {
  BookOpen,
  Calendar,
  CalendarCheck,
  LayoutGrid,
  Target,
} from 'lucide-react';
import { type MenuConfig } from './types';

export const MENU_SIDEBAR: MenuConfig = [
  {
    title: 'Dashboard',
    icon: LayoutGrid,
    path: '/dashboard',
  },
  {
    title: 'Calendar',
    icon: CalendarCheck,
    path: '/training/calendar',
  },
  {
    title: 'Calendar (New)',
    icon: Calendar,
    path: '/training/calendar-new',
  },
  {
    title: 'Calendar (Kit)',
    icon: Calendar,
    path: '/training/calendar-kit',
  },
  {
    title: 'Calendar (Month)',
    icon: Calendar,
    path: '/training/calendar-month',
  },
  {
    title: 'Workout Library',
    icon: BookOpen,
    path: '/training/library',
  },
  {
    title: 'Events',
    icon: Target,
    path: '/training/events',
  },
];

export const MENU_SIDEBAR_CUSTOM: MenuConfig = MENU_SIDEBAR;
export const MENU_SIDEBAR_COMPACT: MenuConfig = MENU_SIDEBAR;
export const MENU_MEGA: MenuConfig = [
  { title: 'Dashboard', path: '/dashboard' },
  { title: 'Calendar', path: '/training/calendar' },
  { title: 'Library', path: '/training/library' },
  { title: 'Events', path: '/training/events' },
];
export const MENU_MEGA_MOBILE: MenuConfig = MENU_MEGA;
