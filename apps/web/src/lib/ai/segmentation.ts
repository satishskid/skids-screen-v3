/**
 * MobileSAM Segmentation — Interactive segmentation for ENT image regions.
 * Ported from V2 segmentation.ts.
 *
 * Nurse/doctor taps a point → MobileSAM generates a mask isolating
 * the region of interest (tympanic membrane, lesion, tonsil, etc.)
 */

import { loadModel, runInference, preprocessImage, type ModelLoadProgress } from './model-loader'

const SAM_ENCODER_URL = '/models/mobilesam-encoder-v1.onnx'
const SAM_DECODER_URL = '/models/mobilesam-decoder-v1.onnx'

export interface SegmentationPoint {
  x: number
  y: number
  label: 1 | 0  // 1 = foreground, 0 = background
}

export interface SegmentationResult {
  mask: Uint8Array
  maskWidth: number
  maskHeight: number
  maskDataUrl: string
  area: number
  inferenceTimeMs: number
}

let cachedEmbedding: { imageKey: string; data: Float32Array } | null = null

/** Encode an image to get the embedding vector (cached per image). */
async function encodeImage(
  imageData: ImageData,
  imageKey: string,
  onProgress?: (progress: ModelLoadProgress) => void
): Promise<Float32Array | null> {
  if (cachedEmbedding && cachedEmbedding.imageKey === imageKey) {
    return cachedEmbedding.data
  }

  const model = await loadModel(SAM_ENCODER_URL, onProgress)
  if (!model) return null

  const { data, shape } = preprocessImage(imageData, 1024,
    [0.485, 0.456, 0.406], [0.229, 0.224, 0.225])

  const outputs = await runInference(model, data, shape)
  if (!outputs) return null

  const embedding = outputs.get(model.outputNames[0])
  if (!embedding) return null

  cachedEmbedding = { imageKey, data: embedding }
  return embedding
}

/** Decode a mask from embedding + point prompts. */
async function decodeMask(
  embedding: Float32Array,
  points: SegmentationPoint[],
  originalWidth: number,
  originalHeight: number,
): Promise<{ mask: Float32Array; width: number; height: number } | null> {
  const decoder = await loadModel(SAM_DECODER_URL)
  if (!decoder) return null

  const pointCoords = new Float32Array(points.length * 2)
  const pointLabels = new Float32Array(points.length)
  for (let i = 0; i < points.length; i++) {
    pointCoords[i * 2] = (points[i].x / originalWidth) * 1024
    pointCoords[i * 2 + 1] = (points[i].y / originalHeight) * 1024
    pointLabels[i] = points[i].label
  }

  const ort = await import('onnxruntime-web')
  const feeds: Record<string, unknown> = {
    image_embeddings: new ort.Tensor('float32', embedding, [1, 256, 64, 64]),
    point_coords: new ort.Tensor('float32', pointCoords, [1, points.length, 2]),
    point_labels: new ort.Tensor('float32', pointLabels, [1, points.length]),
    has_mask_input: new ort.Tensor('float32', new Float32Array([0]), [1]),
    mask_input: new ort.Tensor('float32', new Float32Array(256 * 256).fill(0), [1, 1, 256, 256]),
    orig_im_size: new ort.Tensor('float32', new Float32Array([originalHeight, originalWidth]), [2]),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = decoder.session as any
  try {
    const results = await session.run(feeds)
    const maskOutput = results[decoder.outputNames[0]]
    if (!maskOutput?.data) return null
    return {
      mask: new Float32Array(maskOutput.data as ArrayBuffer),
      width: originalWidth,
      height: originalHeight,
    }
  } catch {
    return null
  }
}

/** Generate a colored mask overlay as PNG data URL. */
function maskToDataUrl(
  mask: Uint8Array,
  width: number,
  height: number,
  color: [number, number, number] = [59, 130, 246]
): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  const imgData = ctx.createImageData(width, height)
  for (let i = 0; i < mask.length; i++) {
    const alpha = mask[i] > 127 ? 100 : 0
    imgData.data[i * 4] = color[0]
    imgData.data[i * 4 + 1] = color[1]
    imgData.data[i * 4 + 2] = color[2]
    imgData.data[i * 4 + 3] = alpha
  }
  ctx.putImageData(imgData, 0, 0)
  return canvas.toDataURL('image/png')
}

/** Run MobileSAM segmentation with point prompts. */
export async function segmentWithPoints(
  imageData: ImageData,
  points: SegmentationPoint[],
  imageKey: string,
  onProgress?: (progress: ModelLoadProgress) => void
): Promise<SegmentationResult | null> {
  if (points.length === 0) return null

  const startTime = performance.now()
  const w = imageData.width
  const h = imageData.height

  const embedding = await encodeImage(imageData, imageKey, onProgress)
  if (!embedding) return null

  const decoded = await decodeMask(embedding, points, w, h)
  if (!decoded) return null

  const binaryMask = new Uint8Array(decoded.mask.length)
  let maskArea = 0
  for (let i = 0; i < decoded.mask.length; i++) {
    if (decoded.mask[i] > 0) {
      binaryMask[i] = 255
      maskArea++
    }
  }

  const area = Math.round((maskArea / (w * h)) * 1000) / 10

  const maskDataUrl = maskToDataUrl(binaryMask, w, h)

  return {
    mask: binaryMask,
    maskWidth: w,
    maskHeight: h,
    maskDataUrl,
    area,
    inferenceTimeMs: Math.round(performance.now() - startTime),
  }
}

/** Clear the cached image embedding. */
export function clearEmbeddingCache(): void {
  cachedEmbedding = null
}

/** Check if MobileSAM models are available. */
export async function isSAMAvailable(): Promise<boolean> {
  try {
    const { isModelCached } = await import('./model-loader')
    const [encoder, decoder] = await Promise.all([
      isModelCached(SAM_ENCODER_URL),
      isModelCached(SAM_DECODER_URL),
    ])
    return encoder && decoder
  } catch {
    return false
  }
}
