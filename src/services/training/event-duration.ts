/**
 * Format event duration based on days until event
 * - Less than 1 week: display in days
 * - Between 1 week and 1 month: display in weeks and days
 * - 1 month or more: display in months, weeks, and days
 */
export function formatEventDuration(daysUntil: number): string {
  if (daysUntil === 0) return 'Today';
  if (daysUntil === 1) return 'Tomorrow';
  
  // Less than 1 week (7 days)
  if (daysUntil < 7) {
    return `${daysUntil} days`;
  }
  
  // Between 1 week and 1 month (30 days)
  if (daysUntil < 30) {
    const weeks = Math.floor(daysUntil / 7);
    const days = daysUntil % 7;
    
    if (days === 0) {
      return weeks === 1 ? '1 week' : `${weeks} weeks`;
    }
    
    return weeks === 1 
      ? `1 week, ${days} day${days > 1 ? 's' : ''}`
      : `${weeks} weeks, ${days} day${days > 1 ? 's' : ''}`;
  }
  
  // 1 month or more
  const months = Math.floor(daysUntil / 30);
  const remainingDays = daysUntil % 30;
  const weeks = Math.floor(remainingDays / 7);
  const days = remainingDays % 7;
  
  const parts: string[] = [];
  
  if (months > 0) {
    parts.push(months === 1 ? '1 month' : `${months} months`);
  }
  
  if (weeks > 0) {
    parts.push(weeks === 1 ? '1 week' : `${weeks} weeks`);
  }
  
  if (days > 0) {
    parts.push(days === 1 ? '1 day' : `${days} days`);
  }
  
  return parts.join(', ');
}
