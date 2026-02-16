import {
  CalendarCheck,
  LayoutGrid,
  UserCircle,
} from 'lucide-react';
import { type MenuConfig } from './types';

export const MENU_SIDEBAR: MenuConfig = [
  {
    title: 'Training',
    icon: CalendarCheck,
    children: [
      { title: 'Calendar', path: '/training/calendar' },
      { title: 'Workout Library', path: '/training/library' },
      { title: 'Events', path: '/training/events' },
    ],
  },
  {
    title: 'Dashboard',
    icon: LayoutGrid,
    path: '/dashboard',
  },
  { heading: 'Account' },
  {
    title: 'My Account',
    icon: UserCircle,
    children: [
      { title: 'Profile', path: '/account/profile' },
      { title: 'Sport Types', path: '/account/sport-types' },
      { title: 'Settings', path: '/account/settings' },
    ],
  },
];

export const MENU_SIDEBAR_CUSTOM: MenuConfig = MENU_SIDEBAR;
export const MENU_SIDEBAR_COMPACT: MenuConfig = MENU_SIDEBAR;
export const MENU_MEGA: MenuConfig = [
  { title: 'Calendar', path: '/training/calendar' },
  { title: 'Library', path: '/training/library' },
  { title: 'Events', path: '/training/events' },
  { title: 'Dashboard', path: '/dashboard' },
];
export const MENU_MEGA_MOBILE: MenuConfig = MENU_MEGA;
