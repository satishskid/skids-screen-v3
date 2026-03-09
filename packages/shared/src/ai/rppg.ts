/**
 * rPPG (Remote Photoplethysmography) heart rate extraction.
 * Ported from V2 rppg.ts — pure signal processing only (no HTMLVideoElement/Canvas).
 *
 * Uses the CHROM method for robust contactless heart rate measurement.
 * The browser-specific extractFaceSignal() stays in apps/web.
 */

export interface RGBSignalSample {
  r: number
  g: number
  b: number
  time: number  // timestamp in ms
}

/**
 * CHROM method for rPPG heart rate extraction.
 * More robust than simple green channel analysis.
 *
 * @param signalBuffer - Array of face region average RGB + timestamps (≥90 samples needed)
 * @returns Heart rate in BPM (clamped 40-200), or 0 if insufficient data
 */
export function computeHeartRateCHROM(signalBuffer: RGBSignalSample[]): number {
  if (signalBuffer.length < 90) return 0

  const xSignal: number[] = []
  const ySignal: number[] = []
  const times: number[] = []

  signalBuffer.forEach(s => {
    xSignal.push(3 * s.r - 2 * s.g)
    ySignal.push(1.5 * s.r + s.g - 1.5 * s.b)
    times.push(s.time)
  })

  const xMean = xSignal.reduce((a, b) => a + b, 0) / xSignal.length
  const yMean = ySignal.reduce((a, b) => a + b, 0) / ySignal.length

  const xNorm = xSignal.map(x => x - xMean)
  const yNorm = ySignal.map(y => y - yMean)

  const xStd = Math.sqrt(xNorm.reduce((a, b) => a + b * b, 0) / xNorm.length)
  const yStd = Math.sqrt(yNorm.reduce((a, b) => a + b * b, 0) / yNorm.length)

  if (xStd === 0 || yStd === 0) return 0

  const chromSignal = xNorm.map((x, i) => x / xStd - yNorm[i] / yStd)

  // Peak detection
  const sampleRate = 30
  let peaks = 0
  let lastPeakIdx = 0
  const minPeakDistance = Math.floor(sampleRate * 0.4)

  for (let i = 1; i < chromSignal.length - 1; i++) {
    if (chromSignal[i] > chromSignal[i - 1] && chromSignal[i] > chromSignal[i + 1]) {
      if (i - lastPeakIdx >= minPeakDistance) {
        peaks++
        lastPeakIdx = i
      }
    }
  }

  const duration = (times[times.length - 1] - times[0]) / 1000
  const heartRate = Math.round((peaks / duration) * 60)

  return Math.max(40, Math.min(200, heartRate))
}

/**
 * Compute average RGB from a face ROI in raw RGBA pixel data.
 * Use this to build signal buffer for computeHeartRateCHROM.
 *
 * @param pixels - RGBA pixel data
 * @param width - Full image width
 * @param height - Full image height
 * @param roi - Face region of interest {x, y, width, height} in pixels
 * @param step - Sample every Nth pixel for performance (default 10)
 */
export function extractFaceROISignal(
  pixels: Uint8ClampedArray | number[],
  width: number,
  height: number,
  roi?: { x: number; y: number; width: number; height: number },
  step = 10,
): { r: number; g: number; b: number } | null {
  // Default ROI: center 40% width, top 50% height (approximate face region)
  const r = roi ?? {
    x: Math.floor(width * 0.3),
    y: Math.floor(height * 0.1),
    width: Math.floor(width * 0.4),
    height: Math.floor(height * 0.5),
  }

  let totalR = 0, totalG = 0, totalB = 0, count = 0

  for (let y = r.y; y < r.y + r.height && y < height; y++) {
    for (let x = r.x; x < r.x + r.width && x < width; x += step) {
      const i = (y * width + x) * 4
      totalR += pixels[i]
      totalG += pixels[i + 1]
      totalB += pixels[i + 2]
      count++
    }
  }

  if (count === 0) return null

  return {
    r: totalR / count,
    g: totalG / count,
    b: totalB / count,
  }
}
