import { parseISO } from 'date-fns';
import { GoalMetric, TrainingGoal } from '@/types/training';

/**
 * Finds the applicable training goal for a given sport, metric, and date bucket.
 */
export function findActiveGoal(
  goals: TrainingGoal[],
  sportTypeId: string | undefined,
  metric: GoalMetric,
  bucketStart: Date,
  bucketEnd: Date,
): TrainingGoal | undefined {
  if (!sportTypeId) return undefined;

  return goals.find((g) => {
    const gStart = parseISO(g.startDate);
    const gEnd = parseISO(g.endDate);

    // Check if the goal range overlaps with the bucket range
    return (
      g.sportTypeId === sportTypeId &&
      g.metric === metric &&
      gStart < bucketEnd &&
      gEnd > bucketStart
    );
  });
}

/**
 * Calculates the target value for a bucket, adjusting for duration (convert to hours).
 */
export function getTargetValueForBucket(
  goal: TrainingGoal | undefined,
  metric: GoalMetric,
): number | null {
  if (!goal) return null;

  let targetVal = Number(goal.targetValue);
  if (metric === 'duration') {
    targetVal = targetVal / 60; // Convert minutes to hours for chart
  }
  return Number(targetVal.toFixed(2));
}
