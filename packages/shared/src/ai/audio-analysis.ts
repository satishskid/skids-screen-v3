/**
 * Audio feature extraction and classification for cough, cardiac, and pulmonary sounds.
 * Ported from V2 audio.ts + auscultation.ts — pure algorithms, no Web Audio API.
 */

// ─── Audio Feature Extraction ──────────────────────────────────

export interface AudioFeatures {
  duration: number
  peakFrequency: number
  spectralCentroid: number
  zeroCrossingRate: number
  rms: number
}

export interface CoughClassification {
  type: 'dry' | 'wet' | 'barking' | 'whooping' | 'unknown'
  confidence: number
}

/** Extract audio features from raw float samples */
export function extractAudioFeatures(samples: Float32Array, sampleRate: number): AudioFeatures {
  const duration = samples.length / sampleRate
  let rms = 0
  let zeroCrossings = 0
  for (let i = 0; i < samples.length; i++) {
    rms += samples[i] * samples[i]
    if (i > 0 && Math.sign(samples[i]) !== Math.sign(samples[i - 1])) zeroCrossings++
  }
  rms = Math.sqrt(rms / samples.length)
  const zeroCrossingRate = zeroCrossings / samples.length

  // Naive spectral analysis via zero-crossing approximation
  const peakFrequency = (zeroCrossingRate * sampleRate) / 2
  const spectralCentroid = peakFrequency * 0.8

  return { duration, peakFrequency, spectralCentroid, zeroCrossingRate, rms }
}

/** Rule-based cough classification from audio features */
export function classifyCough(features: AudioFeatures): CoughClassification {
  const { peakFrequency, spectralCentroid, zeroCrossingRate } = features

  if (peakFrequency < 300 && spectralCentroid < 400) {
    return { type: 'barking', confidence: 0.7 }
  }
  if (zeroCrossingRate > 0.4) {
    return { type: 'whooping', confidence: 0.6 }
  }
  if (spectralCentroid > 500 && spectralCentroid < 1500) {
    return { type: 'wet', confidence: 0.65 }
  }
  if (zeroCrossingRate < 0.15) {
    return { type: 'dry', confidence: 0.6 }
  }
  return { type: 'unknown', confidence: 0.3 }
}

// ─── Auscultation Points ───────────────────────────────────────

export interface AuscultationPoint {
  id: string
  name: string
  x: number  // percentage on body diagram
  y: number
}

export const CARDIAC_POINTS: AuscultationPoint[] = [
  { id: 'aortic', name: 'Aortic', x: 55, y: 28 },
  { id: 'pulmonic', name: 'Pulmonic', x: 45, y: 28 },
  { id: 'tricuspid', name: 'Tricuspid', x: 52, y: 42 },
  { id: 'mitral', name: 'Mitral', x: 40, y: 45 },
]

export const PULMONARY_POINTS: AuscultationPoint[] = [
  { id: 'upper_r_post', name: 'Upper Right (Post)', x: 60, y: 25 },
  { id: 'upper_l_post', name: 'Upper Left (Post)', x: 40, y: 25 },
  { id: 'lower_r_post', name: 'Lower Right (Post)', x: 60, y: 40 },
  { id: 'lower_l_post', name: 'Lower Left (Post)', x: 40, y: 40 },
  { id: 'upper_r_ant', name: 'Upper Right (Ant)', x: 55, y: 20 },
  { id: 'upper_l_ant', name: 'Upper Left (Ant)', x: 45, y: 20 },
]

// ─── Sound Analysis (from frequency data) ──────────────────────

export interface SoundAnalysisResult {
  finding: string
  confidence: number
  details: string
}

/**
 * Analyze cardiac audio from frequency magnitude data.
 * Input: array of frequency bin magnitudes (0-255) from an FFT.
 */
export function analyzeCardiacFrequencies(frequencyData: Uint8Array, binSize: number): SoundAnalysisResult {
  if (frequencyData.length === 0) return { finding: 'No Signal', confidence: 0, details: 'No audio data' }

  // Sum energy in frequency bands
  let lowBand = 0   // 20-200 Hz (heart sounds S1/S2)
  let midBand = 0   // 200-500 Hz (murmur range)
  let highBand = 0  // >500 Hz (noise)
  let totalEnergy = 0

  for (let i = 0; i < frequencyData.length; i++) {
    const freq = i * binSize
    const mag = frequencyData[i]
    totalEnergy += mag
    if (freq >= 20 && freq <= 200) lowBand += mag
    else if (freq > 200 && freq <= 500) midBand += mag
    else if (freq > 500) highBand += mag
  }

  if (totalEnergy < 500) return { finding: 'No Signal', confidence: 0.3, details: 'Audio level too low' }

  const lowRatio = lowBand / totalEnergy
  const midRatio = midBand / totalEnergy

  if (midRatio > 0.3 && midBand > lowBand * 0.5) {
    return { finding: 'Possible Murmur', confidence: 0.6, details: 'Elevated mid-frequency energy (200-500 Hz)' }
  }
  if (highBand > totalEnergy * 0.5) {
    return { finding: 'Noisy Recording', confidence: 0.4, details: 'High ambient noise' }
  }
  if (lowRatio > 0.4) {
    return { finding: 'Normal S1/S2', confidence: 0.7, details: 'Dominant low-frequency heart sounds' }
  }
  return { finding: 'Normal S1/S2', confidence: 0.5, details: 'No abnormality detected' }
}

/**
 * Analyze pulmonary audio from frequency magnitude data.
 */
export function analyzePulmonaryFrequencies(frequencyData: Uint8Array, binSize: number): SoundAnalysisResult {
  if (frequencyData.length === 0) return { finding: 'No Signal', confidence: 0, details: 'No audio data' }

  let totalEnergy = 0
  let wheezeBand = 0    // >400 Hz continuous
  let rhonchiBand = 0   // <200 Hz rumbling

  for (let i = 0; i < frequencyData.length; i++) {
    const freq = i * binSize
    const mag = frequencyData[i]
    totalEnergy += mag
    if (freq > 400 && freq < 1500) wheezeBand += mag
    if (freq > 50 && freq < 200) rhonchiBand += mag
  }

  if (totalEnergy < 500) return { finding: 'No Signal', confidence: 0.3, details: 'Audio level too low' }

  if (wheezeBand > totalEnergy * 0.35) {
    return { finding: 'Possible Wheeze', confidence: 0.6, details: 'Elevated high-frequency continuous sounds (>400 Hz)' }
  }
  if (rhonchiBand > totalEnergy * 0.4) {
    return { finding: 'Possible Rhonchi', confidence: 0.55, details: 'Low-frequency rumbling sounds (<200 Hz)' }
  }
  if (totalEnergy < 2000) {
    return { finding: 'Diminished', confidence: 0.5, details: 'Reduced breath sound intensity' }
  }
  return { finding: 'Normal Vesicular', confidence: 0.65, details: 'Normal breath sounds' }
}
