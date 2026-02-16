import { differenceInDays } from 'date-fns';
import { Flag, Target, Trophy } from 'lucide-react';

/**
 * Get priority color classes for event/goal priority badges
 */
export function getPriorityColor(priority: 'A' | 'B' | 'C'): string {
  switch (priority) {
    case 'A':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'B':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'C':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  }
}

/**
 * Get icon component for event/goal type
 */
export function getTypeIcon(type: 'Race' | 'Goal' | 'Test') {
  switch (type) {
    case 'Race':
      return Flag;
    case 'Goal':
      return Target;
    case 'Test':
      return Trophy;
  }
}

/**
 * Calculate and format days until/since a date
 */
export function getDaysUntil(dateStr: string, today: Date): string {
  const targetDate = new Date(dateStr);
  const days = differenceInDays(targetDate, today);
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return `${Math.abs(days)} days ago`;
  return `${days} days`;
}
