// Shared types and utilities for synced observations from campaign data
// Ported from V2 — zero business logic changes

import type { Observation, Severity } from './types'

/** Lightweight ENT finding stored in synced features */
export interface SyncedENTFinding {
  chipId: string
  label: string
  confidence: number
  icdCode: string
}

/** Flattened observation shape as stored in Turso/synced from nurse devices */
export interface SyncedObservation {
  id: string
  sessionId: string
  childId: string
  moduleType: string
  bodyRegion?: string
  timestamp: string
  riskCategory: 'no_risk' | 'possible_risk' | 'high_risk'
  summaryText: string
  confidence: number
  features: Record<string, unknown> & {
    entFindings?: SyncedENTFinding[]
    entInferenceMs?: number
  }
  annotationData?: {
    selectedChips?: string[]
    chipSeverities?: Record<string, string>
    pins?: Array<{ x: number; y: number; label: string; severity?: string }>
    notes?: string
  }
  mediaUrl?: string
  mediaUrls?: string[]
  mediaType?: 'image' | 'video' | 'audio'
  _nurseName?: string
  _deviceId?: string
  _syncedAt?: string
}

/** Convert a synced (flattened) observation back to the full Observation type */
export function toObservation(so: SyncedObservation): Observation {
  return {
    id: so.id,
    sessionId: so.sessionId,
    moduleType: so.moduleType as Observation['moduleType'],
    bodyRegion: so.bodyRegion,
    mediaUrl: so.mediaUrl,
    mediaUrls: so.mediaUrls,
    mediaType: so.mediaType,
    captureMetadata: { childId: so.childId },
    aiAnnotations: [{
      id: `${so.id}-ai`,
      modelId: `${so.moduleType}_browser_v1.0`,
      features: so.features,
      summaryText: so.summaryText,
      confidence: so.confidence,
      qualityFlags: [],
      riskCategory: so.riskCategory,
    }],
    annotationData: so.annotationData ? {
      selectedChips: so.annotationData.selectedChips || [],
      chipSeverities: (so.annotationData.chipSeverities || {}) as Record<string, Severity>,
      pins: (so.annotationData.pins || []).map(p => ({
        id: `${so.id}-pin-${p.x}-${p.y}`,
        x: p.x,
        y: p.y,
        label: p.label,
        severity: p.severity as Severity | undefined,
      })),
      aiSuggestedChips: [],
      notes: so.annotationData.notes || '',
    } : undefined,
    timestamp: so.timestamp,
  }
}
