/**
 * Photoscreening Classifier — Amblyopia risk detection from flash photography.
 * Ported from V2 photoscreening.ts.
 *
 * Detects: strabismus, anisocoria, abnormal red reflex, ptosis,
 * anisometropia risk, media opacity.
 *
 * Uses MobileNetV2 ONNX model + rule-based crescent analysis.
 */

import { loadModel, runInference, preprocessImage, type ModelLoadProgress } from './model-loader'

const PHOTOSCREEN_MODEL_URL = '/models/photoscreen-v1.onnx'

export const PHOTOSCREEN_FINDINGS = [
  { index: 0, chipId: 'v1', label: 'Strabismus', icd: 'H50', riskWeight: 3 },
  { index: 1, chipId: 'v5', label: 'Anisocoria', icd: 'H57.0', riskWeight: 2 },
  { index: 2, chipId: 'v4', label: 'Abnormal Red Reflex', icd: 'H44.9', riskWeight: 4 },
  { index: 3, chipId: 'v6', label: 'Ptosis', icd: 'H02.4', riskWeight: 2 },
  { index: 4, chipId: 'v_aniso', label: 'Anisometropia Risk', icd: 'H52.3', riskWeight: 3 },
  { index: 5, chipId: 'v_media', label: 'Media Opacity', icd: 'H26.9', riskWeight: 5 },
] as const

export interface PhotoscreenFinding {
  chipId: string
  label: string
  confidence: number
  icdCode: string
  riskWeight: number
}

export interface CrescentAnalysis {
  leftCrescentAngle: number
  rightCrescentAngle: number
  asymmetry: number
  estimatedAnisometropia: boolean
}

export interface PhotoscreenResult {
  findings: PhotoscreenFinding[]
  allScores: number[]
  crescentAnalysis: CrescentAnalysis | null
  overallRisk: 'pass' | 'refer' | 'inconclusive'
  inferenceTimeMs: number
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

/** Analyze red reflex crescents for refractive error indicators. */
function analyzeCrescents(imageData: ImageData): CrescentAnalysis {
  const { width, height, data } = imageData

  const leftPupil = {
    cx: Math.floor(width * 0.35), cy: Math.floor(height * 0.4),
    r: Math.floor(Math.min(width, height) * 0.06),
  }
  const rightPupil = {
    cx: Math.floor(width * 0.65), cy: Math.floor(height * 0.4),
    r: Math.floor(Math.min(width, height) * 0.06),
  }

  function analyzeOnePupil(cx: number, cy: number, r: number): number {
    let topHalfBrightness = 0, bottomHalfBrightness = 0
    let leftHalfBrightness = 0, rightHalfBrightness = 0
    let count = 0

    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue
        const px = cx + dx
        const py = cy + dy
        if (px < 0 || px >= width || py < 0 || py >= height) continue

        const idx = (py * width + px) * 4
        const brightness = (data[idx] * 2 + data[idx + 1] + data[idx + 2]) / 4

        if (dy < 0) topHalfBrightness += brightness
        else bottomHalfBrightness += brightness
        if (dx < 0) leftHalfBrightness += brightness
        else rightHalfBrightness += brightness
        count++
      }
    }

    if (count === 0) return 0

    const vertAsym = Math.abs(topHalfBrightness - bottomHalfBrightness) / (count * 128)
    const horizAsym = Math.abs(leftHalfBrightness - rightHalfBrightness) / (count * 128)
    return Math.atan2(vertAsym, horizAsym) * (180 / Math.PI)
  }

  const leftAngle = analyzeOnePupil(leftPupil.cx, leftPupil.cy, leftPupil.r)
  const rightAngle = analyzeOnePupil(rightPupil.cx, rightPupil.cy, rightPupil.r)
  const asymmetry = Math.abs(leftAngle - rightAngle)

  return {
    leftCrescentAngle: Math.round(leftAngle * 10) / 10,
    rightCrescentAngle: Math.round(rightAngle * 10) / 10,
    asymmetry: Math.round(asymmetry * 10) / 10,
    estimatedAnisometropia: asymmetry > 15,
  }
}

/** Run photoscreening analysis on a flash photograph of both eyes. */
export async function runPhotoscreening(
  imageData: ImageData,
  threshold: number = 0.4,
  onProgress?: (progress: ModelLoadProgress) => void
): Promise<PhotoscreenResult> {
  const startTime = performance.now()

  const crescentAnalysis = analyzeCrescents(imageData)

  const findings: PhotoscreenFinding[] = []
  let allScores: number[] = []

  const model = await loadModel(PHOTOSCREEN_MODEL_URL, onProgress)
  if (model) {
    const { data, shape } = preprocessImage(imageData, 224)
    const outputs = await runInference(model, data, shape)

    if (outputs) {
      const outputName = model.outputNames[0]
      const rawScores = outputs.get(outputName)
      if (rawScores) {
        allScores = Array.from(rawScores).map(sigmoid)

        for (const finding of PHOTOSCREEN_FINDINGS) {
          const confidence = allScores[finding.index]
          if (confidence >= threshold) {
            findings.push({
              chipId: finding.chipId,
              label: finding.label,
              confidence: Math.round(confidence * 100) / 100,
              icdCode: finding.icd,
              riskWeight: finding.riskWeight,
            })
          }
        }
      }
    }
  }

  if (crescentAnalysis.estimatedAnisometropia) {
    const existing = findings.find(f => f.chipId === 'v_aniso')
    if (!existing) {
      findings.push({
        chipId: 'v_aniso',
        label: 'Anisometropia Risk',
        confidence: Math.min(0.9, 0.5 + crescentAnalysis.asymmetry / 50),
        icdCode: 'H52.3',
        riskWeight: 3,
      })
    }
  }

  findings.sort((a, b) => b.confidence - a.confidence)

  const totalRisk = findings.reduce((sum, f) => sum + f.confidence * f.riskWeight, 0)
  const overallRisk: PhotoscreenResult['overallRisk'] =
    totalRisk >= 5 ? 'refer' :
    totalRisk >= 2 ? 'inconclusive' :
    'pass'

  return {
    findings,
    allScores,
    crescentAnalysis,
    overallRisk,
    inferenceTimeMs: Math.round(performance.now() - startTime),
  }
}
