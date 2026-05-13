import {
  BookOpen,
  CalendarCheck,
  Layers,
  LayoutGrid,
  Target,
  Trophy,
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
    title: 'Workout Library',
    icon: BookOpen,
    path: '/training/library',
  },
  {
    title: 'Training Plans',
    icon: Layers,
    path: '/account/templates',
  },
  {
    title: 'Goals',
    icon: Target,
    path: '/training/goals',
  },
  {
    title: 'Events',
    icon: Trophy,
    path: '/training/events',
  },
];

export const MENU_SIDEBAR_CUSTOM: MenuConfig = MENU_SIDEBAR;
export const MENU_SIDEBAR_COMPACT: MenuConfig = MENU_SIDEBAR;
export const MENU_MEGA: MenuConfig = [
  { title: 'Dashboard', path: '/dashboard' },
  { title: 'Calendar', path: '/training/calendar' },
  { title: 'Library', path: '/training/library' },
  { title: 'Training Plans', path: '/account/templates' },
  { title: 'Goals', path: '/training/goals' },
  { title: 'Events', path: '/training/events' },
];
export const MENU_MEGA_MOBILE: MenuConfig = MENU_MEGA;
