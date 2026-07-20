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
    path: '/calendar',
  },
  {
    title: 'Workout Library',
    icon: BookOpen,
    path: '/workout-library',
  },
  {
    title: 'Training Plans',
    icon: Layers,
    path: '/training-plans',
  },
  {
    title: 'Goals',
    icon: Target,
    path: '/goals',
  },
  {
    title: 'Events',
    icon: Trophy,
    path: '/events',
  },
];

export const MENU_SIDEBAR_CUSTOM: MenuConfig = MENU_SIDEBAR;
export const MENU_SIDEBAR_COMPACT: MenuConfig = MENU_SIDEBAR;
export const MENU_MEGA: MenuConfig = [
  { title: 'Dashboard', path: '/dashboard' },
  { title: 'Calendar', path: '/calendar' },
  { title: 'Library', path: '/workout-library' },
  { title: 'Training Plans', path: '/training-plans' },
  { title: 'Goals', path: '/goals' },
  { title: 'Events', path: '/events' },
];
export const MENU_MEGA_MOBILE: MenuConfig = MENU_MEGA;
