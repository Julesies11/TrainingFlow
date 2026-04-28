export type GoalMetric = 'duration' | 'distance';
export type GoalPeriod = 'weekly' | 'monthly';

export interface TrainingGoal {
  id: string;
  userId: string;
  sportTypeId: string;
  eventId?: string;
  metric: GoalMetric;
  targetValue: number;
  period: GoalPeriod;
  startDate: string;
  endDate: string;
  createdAt?: string;
}

export interface TrainingGoalRecord {
  id: string;
  user_id: string;
  sport_type_id: string;
  event_id?: string;
  metric: GoalMetric;
  target_value: number;
  period: GoalPeriod;
  start_date: string;
  end_date: string;
  created_at?: string;
}
