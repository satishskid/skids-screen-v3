/**
 * Pure-Tone Audiometry scoring, WHO hearing loss classification, and chip suggestions.
 * Ported from V2 audiometry.ts — pure algorithms only (no Web Audio API).
 */

export const TEST_FREQUENCIES = [1000, 500, 2000, 4000] as const

export type Ear = 'left' | 'right'

export interface HearingThresholds {
  left: Record<number, number>   // frequency → dB threshold
  right: Record<number, number>
}

export interface AudiometryResult {
  leftPTA: number
  rightPTA: number
  betterEarPTA: number
  leftClassification: string
  rightClassification: string
  overallClassification: string
  asymmetry: boolean
  frequencyPattern: 'flat' | 'sloping' | 'rising' | 'notch' | 'normal'
}

/** WHO classification of hearing loss by PTA (dB) */
export function classifyHearingLoss(ptaDB: number): string {
  if (ptaDB <= 15) return 'Normal'
  if (ptaDB <= 25) return 'Slight'
  if (ptaDB <= 40) return 'Mild'
  if (ptaDB <= 55) return 'Moderate'
  if (ptaDB <= 70) return 'Moderately severe'
  if (ptaDB <= 90) return 'Severe'
  return 'Profound'
}

/** Get Tailwind color class for hearing loss severity */
export function getHearingColor(ptaDB: number): string {
  if (ptaDB <= 15) return 'text-green-600'
  if (ptaDB <= 25) return 'text-lime-600'
  if (ptaDB <= 40) return 'text-yellow-600'
  if (ptaDB <= 55) return 'text-orange-600'
  if (ptaDB <= 70) return 'text-red-500'
  if (ptaDB <= 90) return 'text-red-700'
  return 'text-purple-700'
}

/** Calculate Pure-Tone Average from thresholds for a single ear */
export function calculatePTA(thresholds: Record<number, number>): number {
  const freqs = [500, 1000, 2000, 4000]
  const values = freqs.map(f => thresholds[f]).filter(v => v !== undefined)
  if (values.length === 0) return 0
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

/** Generate full audiometry result from thresholds */
export function generateAudiometryResult(thresholds: HearingThresholds): AudiometryResult {
  const leftPTA = calculatePTA(thresholds.left)
  const rightPTA = calculatePTA(thresholds.right)
  const betterEarPTA = Math.min(leftPTA, rightPTA)
  const asymmetry = Math.abs(leftPTA - rightPTA) > 15

  // Detect frequency pattern from better ear
  const betterThresholds = leftPTA <= rightPTA ? thresholds.left : thresholds.right
  const frequencyPattern = detectPattern(betterThresholds)

  return {
    leftPTA,
    rightPTA,
    betterEarPTA,
    leftClassification: classifyHearingLoss(leftPTA),
    rightClassification: classifyHearingLoss(rightPTA),
    overallClassification: classifyHearingLoss(betterEarPTA),
    asymmetry,
    frequencyPattern,
  }
}

function detectPattern(thresholds: Record<number, number>): AudiometryResult['frequencyPattern'] {
  const t500 = thresholds[500] ?? 0
  const t1000 = thresholds[1000] ?? 0
  const t2000 = thresholds[2000] ?? 0
  const t4000 = thresholds[4000] ?? 0

  if (Math.max(t500, t1000, t2000, t4000) <= 20) return 'normal'
  if (t4000 - t500 > 20) return 'sloping'
  if (t500 - t4000 > 20) return 'rising'
  if (t4000 > t2000 + 15 && t4000 > t1000 + 15) return 'notch'
  return 'flat'
}

/** Map audiometry result to annotation chip IDs (hr1-hr10) */
export function suggestHearingChips(result: AudiometryResult): string[] {
  const chips: string[] = []

  // Overall classification chips
  if (result.overallClassification === 'Normal') chips.push('hr1')
  else if (result.overallClassification === 'Slight') chips.push('hr2')
  else if (result.overallClassification === 'Mild') chips.push('hr3')
  else if (result.overallClassification === 'Moderate') chips.push('hr4')
  else chips.push('hr5') // severe/profound

  // Asymmetry
  if (result.asymmetry) chips.push('hr6')

  // Frequency pattern
  if (result.frequencyPattern === 'sloping') chips.push('hr7')
  else if (result.frequencyPattern === 'notch') chips.push('hr8')

  return chips
}
