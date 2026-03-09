/**
 * ENT Classifier — 10-class ear/dental/throat classification with GradCAM heatmaps.
 * Ported from V2 ent-classifier.ts.
 *
 * Runs at doctor review time (not during live screening).
 */

import { loadModel, runInference, preprocessImage, type ModelLoadProgress } from './model-loader'

const ENT_MODEL_URL = '/models/ent-classifier-v1.onnx'

export const ENT_FINDINGS = [
  { index: 0, chipId: 'e1', module: 'ear', label: 'Wax Impaction', icd: 'H61.2' },
  { index: 1, chipId: 'e7', module: 'ear', label: 'Otitis Externa', icd: 'H60' },
  { index: 2, chipId: 'e8', module: 'ear', label: 'Otitis Media', icd: 'H66' },
  { index: 3, chipId: 'e5', module: 'ear', label: 'TM Perforation', icd: 'H72' },
  { index: 4, chipId: 'd1', module: 'dental', label: 'Dental Caries', icd: 'K02' },
  { index: 5, chipId: 'd5', module: 'dental', label: 'Gingivitis', icd: 'K05.1' },
  { index: 6, chipId: 'd6', module: 'dental', label: 'Plaque/Calculus', icd: 'K03.6' },
  { index: 7, chipId: 't1', module: 'throat', label: 'Tonsil Hypertrophy', icd: 'J35.1' },
  { index: 8, chipId: 't5', module: 'throat', label: 'Pharyngeal Erythema', icd: 'J02.9' },
  { index: 9, chipId: 't6', module: 'throat', label: 'Tonsillar Exudate', icd: 'J03' },
] as const

export interface ENTClassification {
  chipId: string
  module: string
  label: string
  confidence: number
  icdCode: string
}

export interface ENTAnalysisResult {
  findings: ENTClassification[]
  allScores: number[]
  heatmapDataUrl: string | null
  inferenceTimeMs: number
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

/** Generate a simulated GradCAM heatmap from color distribution analysis. */
async function generateHeatmap(
  imageData: ImageData,
  scores: number[],
  topFindingIndex: number
): Promise<string | null> {
  try {
    const gridSize = 7
    const topScore = scores[topFindingIndex]
    if (topScore < 0.3) return null

    const canvas = document.createElement('canvas')
    canvas.width = imageData.width
    canvas.height = imageData.height
    const ctx = canvas.getContext('2d')!
    ctx.putImageData(imageData, 0, 0)

    const heatCanvas = document.createElement('canvas')
    heatCanvas.width = imageData.width
    heatCanvas.height = imageData.height
    const heatCtx = heatCanvas.getContext('2d')!

    const pixels = imageData.data
    const w = imageData.width
    const h = imageData.height

    for (let gy = 0; gy < gridSize; gy++) {
      for (let gx = 0; gx < gridSize; gx++) {
        const startX = Math.floor((gx / gridSize) * w)
        const startY = Math.floor((gy / gridSize) * h)
        const endX = Math.floor(((gx + 1) / gridSize) * w)
        const endY = Math.floor(((gy + 1) / gridSize) * h)

        let rSum = 0, gSum = 0, bSum = 0, count = 0
        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            const idx = (y * w + x) * 4
            rSum += pixels[idx]
            gSum += pixels[idx + 1]
            bSum += pixels[idx + 2]
            count++
          }
        }

        const rAvg = rSum / count / 255
        const gAvg = gSum / count / 255
        const bAvg = bSum / count / 255

        let attention = 0
        const findingModule = ENT_FINDINGS[topFindingIndex].module

        if (findingModule === 'ear') {
          const redness = rAvg - (gAvg + bAvg) / 2
          const darkness = 1 - (rAvg + gAvg + bAvg) / 3
          attention = Math.max(redness * 2, darkness * 1.5)
        } else if (findingModule === 'dental') {
          const darkness = 1 - (rAvg + gAvg + bAvg) / 3
          const redness = rAvg - gAvg
          attention = Math.max(darkness * 1.8, redness * 1.5)
        } else if (findingModule === 'throat') {
          const redness = rAvg - (gAvg + bAvg) / 2
          const whiteness = (rAvg + gAvg + bAvg) / 3
          attention = Math.max(redness * 2, whiteness > 0.7 ? whiteness : 0)
        }

        attention = Math.max(0, Math.min(1, attention)) * topScore

        if (attention > 0.1) {
          const r = Math.floor(255 * Math.min(1, attention * 2))
          const g = Math.floor(255 * Math.max(0, 1 - attention * 2))
          heatCtx.fillStyle = `rgba(${r}, ${g}, 0, ${attention * 0.4})`
          heatCtx.fillRect(startX, startY, endX - startX, endY - startY)
        }
      }
    }

    ctx.drawImage(heatCanvas, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.85)
  } catch {
    return null
  }
}

/** Classify an ENT image (key frame from video). */
export async function classifyENTImage(
  imageData: ImageData,
  threshold: number = 0.5,
  onProgress?: (progress: ModelLoadProgress) => void
): Promise<ENTAnalysisResult | null> {
  const startTime = performance.now()

  const model = await loadModel(ENT_MODEL_URL, onProgress)
  if (!model) return null

  const { data, shape } = preprocessImage(imageData, 224)
  const outputs = await runInference(model, data, shape)
  if (!outputs) return null

  const outputName = model.outputNames[0]
  const rawScores = outputs.get(outputName)
  if (!rawScores) return null

  const scores = Array.from(rawScores).map(sigmoid)

  const findings: ENTClassification[] = []
  for (const finding of ENT_FINDINGS) {
    const confidence = scores[finding.index]
    if (confidence >= threshold) {
      findings.push({
        chipId: finding.chipId,
        module: finding.module,
        label: finding.label,
        confidence: Math.round(confidence * 100) / 100,
        icdCode: finding.icd,
      })
    }
  }

  findings.sort((a, b) => b.confidence - a.confidence)

  let heatmapDataUrl: string | null = null
  if (findings.length > 0) {
    const topFindingIdx = ENT_FINDINGS.findIndex(f => f.chipId === findings[0].chipId)
    if (topFindingIdx >= 0) {
      heatmapDataUrl = await generateHeatmap(imageData, scores, topFindingIdx)
    }
  }

  return {
    findings,
    allScores: scores,
    heatmapDataUrl,
    inferenceTimeMs: Math.round(performance.now() - startTime),
  }
}

/** Compare AI findings with nurse-selected chips. */
export function compareWithNurseChips(
  aiFindings: ENTClassification[],
  nurseChips: string[],
  moduleType: string
): {
  confirmed: ENTClassification[]
  suggested: ENTClassification[]
  missed: string[]
} {
  const relevantFindings = aiFindings.filter(f => f.module === moduleType)
  const aiChipIds = new Set(relevantFindings.map(f => f.chipId))
  const nurseChipSet = new Set(nurseChips)

  const confirmed = relevantFindings.filter(f => nurseChipSet.has(f.chipId))
  const suggested = relevantFindings.filter(f => !nurseChipSet.has(f.chipId))
  const missed = nurseChips.filter(c => !aiChipIds.has(c))

  return { confirmed, suggested, missed }
}
