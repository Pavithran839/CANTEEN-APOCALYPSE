
export function calculateChaosScore(
  peopleCount: number,
  queueLength: number,
  waitTimeMinutes: number,
  capacity: number
): number {
  if (
    !Number.isFinite(peopleCount) ||
    !Number.isFinite(queueLength) ||
    !Number.isFinite(waitTimeMinutes) ||
    !Number.isFinite(capacity) ||
    peopleCount < 0 ||
    queueLength < 0 ||
    waitTimeMinutes < 0 ||
    capacity <= 0
  ) {
    throw new Error("Invalid crowd data. Capacity must be greater than zero.");
  }

  // Normalize each factor to a maximum of 100
  const capacityScore = Math.min((peopleCount / capacity) * 100, 100);
  const queueScore = Math.min((queueLength / capacity) * 100, 100);
  const waitingScore = Math.min((waitTimeMinutes / 60) * 100, 100);

  // Apply weights
  const chaosScore =
    capacityScore * 0.4 +
    queueScore * 0.3 +
    waitingScore * 0.3;

  return Number(Math.min(chaosScore, 100).toFixed(2));
}

/*
 * CHAOS SCORE CALCULATION
 *
 * Purpose:
 * Measures the crowd congestion level in a canteen
 * using a score ranging from 0 to 100.
 *
 * Factors and weights:
 * 1. Capacity Utilization - 40%
 *    (people_count / capacity) * 100
 *
 * 2. Queue Congestion - 30%
 *    (queue_length / capacity) * 100
 *
 * 3. Waiting Time - 30%
 *    (wait_time_minutes / 60) * 100
 *
 * Final Formula:
 * Chaos Score = (Capacity Score * 0.40)
 *             + (Queue Score * 0.30)
 *             + (Waiting Score * 0.30)
 *
 * Each factor is capped at 100.
 * Final score is rounded to 2 decimal places.
 *
 * Score Classification:
 * 0-25   : Low
 * 26-50  : Moderate
 * 51-75  : High
 * 76-100 : Critical
 */
