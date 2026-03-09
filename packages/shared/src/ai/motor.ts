/**
 * Motor assessment analysis using position trace data.
 * Ported from V2 motor.ts — no changes needed (already pure algorithms).
 */

export interface MotorAnalysisResult {
  stability: number   // 0-1 (1 = very stable)
  symmetry: number    // 0-1 (1 = symmetric movement)
  avgSpeed: number    // pixels/second
  tremor: number      // 0-1 (proportion of direction reversals)
}

/**
 * Analyze motor performance from a series of position traces.
 * Works with touch/pointer tracking data (x, y, timestamp).
 *
 * @param positions - Array of {x, y, time} samples (minimum 10 needed)
 */
export function analyzeMotorPerformance(
  positions: Array<{ x: number; y: number; time: number }>
): MotorAnalysisResult {
  if (positions.length < 10) {
    return { stability: 0.5, symmetry: 0.5, avgSpeed: 0, tremor: 0 }
  }

  const speeds: number[] = []

  for (let i = 1; i < positions.length; i++) {
    const dx = positions[i].x - positions[i - 1].x
    const dy = positions[i].y - positions[i - 1].y
    const dt = (positions[i].time - positions[i - 1].time) / 1000
    if (dt > 0) {
      const speed = Math.sqrt(dx * dx + dy * dy) / dt
      speeds.push(speed)
    }
  }

  if (speeds.length === 0) {
    return { stability: 0.5, symmetry: 0.5, avgSpeed: 0, tremor: 0 }
  }

  const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length
  const speedVariance = speeds.reduce((a, b) => a + (b - avgSpeed) ** 2, 0) / speeds.length
  const stability = Math.max(0, 1 - speedVariance / 10000)

  // Tremor detection: count direction reversals in speed
  let tremor = 0
  for (let i = 2; i < speeds.length; i++) {
    if (Math.sign(speeds[i] - speeds[i - 1]) !== Math.sign(speeds[i - 1] - speeds[i - 2])) {
      tremor++
    }
  }
  tremor = tremor / speeds.length

  const symmetry = Math.max(0, Math.min(1, 0.9 - tremor * 0.5))

  return { stability, symmetry, avgSpeed, tremor }
}
