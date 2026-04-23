import {
  Bell,
  Zap as Bolt,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Cloud,
  Coffee,
  Crown,
  Dumbbell,
  Eye,
  Flag,
  Flame,
  Gift,
  Globe,
  GraduationCap,
  Heart,
  Home,
  Image as ImageIcon,
  Info,
  Key,
  Layers,
  Lightbulb,
  Link,
  List,
  Lock,
  LucideIcon,
  Mail,
  Map,
  MapPin,
  MessageSquare,
  Mic,
  Moon,
  Music,
  Navigation,
  Phone,
  Play,
  Rocket,
  Search,
  Settings,
  Shield,
  Smile,
  Star,
  Sun,
  Tag,
  Target,
  ThumbsUp,
  Timer,
  Trash2,
  Trophy,
  User,
  Users,
  Video,
  Volume2,
  Watch,
  XCircle,
  Zap,
} from 'lucide-react';

export const EVENT_ICONS: Record<string, LucideIcon> = {
  Flag,
  Target,
  Trophy,
  Info,
  Star,
  Zap,
  Flame,
  Heart,
  Bolt,
  Clock,
  Shield,
  Bell,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Cloud,
  Coffee,
  Crown,
  Dumbbell,
  Eye,
  Gift,
  Globe,
  GraduationCap,
  Home,
  ImageIcon,
  Key,
  Layers,
  Lightbulb,
  Link,
  List,
  Lock,
  Mail,
  Map,
  MapPin,
  MessageSquare,
  Mic,
  Moon,
  Music,
  Navigation,
  Phone,
  Play,
  Rocket,
  Search,
  Settings,
  Smile,
  Sun,
  Tag,
  ThumbsUp,
  Timer,
  Trash2,
  User,
  Users,
  Video,
  Volume2,
  Watch,
  XCircle,
};

export const EVENT_THEMES = [
  { id: 'morning', label: 'Amber', hex: '#f59e0b' },
  { id: 'day', label: 'Sky', hex: '#0ea5e9' },
  { id: 'afternoon', label: 'Orange', hex: '#f97316' },
  { id: 'night', label: 'Indigo', hex: '#6366f1' },
  { id: 'community', label: 'Emerald', hex: '#10b981' },
  { id: 'other', label: 'Gray', hex: '#6b7280' },
];

export interface EventTheme {
  bg: string;
  text: string;
  border: string;
  dot: string;
  hex: string;
  icon: LucideIcon;
}

export function getEventTypeTheme(
  colorTheme: string = 'other',
  iconName: string = 'Info',
): EventTheme {
  const icon = EVENT_ICONS[iconName] || Info;

  let theme = {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-500',
    hex: '#6b7280',
  };

  switch (colorTheme) {
    case 'morning':
    case 'amber':
      theme = {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        hex: '#f59e0b',
      };
      break;
    case 'day':
    case 'sky':
      theme = {
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
        dot: 'bg-sky-500',
        hex: '#0ea5e9',
      };
      break;
    case 'afternoon':
    case 'orange':
      theme = {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        dot: 'bg-orange-500',
        hex: '#f97316',
      };
      break;
    case 'night':
    case 'indigo':
      theme = {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        dot: 'bg-indigo-500',
        hex: '#6366f1',
      };
      break;
    case 'community':
    case 'emerald':
      theme = {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        hex: '#10b981',
      };
      break;
  }

  return { ...theme, icon };
}
