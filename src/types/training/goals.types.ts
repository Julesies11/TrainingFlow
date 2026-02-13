export interface EventGoal {
  id: string;
  date: string;
  type: 'Race' | 'Goal' | 'Test';
  title: string;
  priority: 'A' | 'B' | 'C';
  description?: string;
}
