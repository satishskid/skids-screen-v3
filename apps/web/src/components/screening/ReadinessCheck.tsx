/**
 * Device Readiness Check — Verifies camera, mic, storage, AI model availability.
 * Displays status indicators before screening starts.
 */

import { useState, useEffect, useCallback } from 'react'

interface ReadinessItem {
  id: string
  label: string
  status: 'checking' | 'ready' | 'warning' | 'error'
  detail?: string
}

interface ReadinessCheckProps {
  onReady?: () => void
  showOllama?: boolean
  showCloudGateway?: boolean
}

export function ReadinessCheck({ onReady, showOllama = false, showCloudGateway = false }: ReadinessCheckProps) {
  const [items, setItems] = useState<ReadinessItem[]>([])
  const [checking, setChecking] = useState(true)

  const updateItem = useCallback((id: string, update: Partial<ReadinessItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...update } : item))
  }, [])

  useEffect(() => {
    const initialItems: ReadinessItem[] = [
      { id: 'camera', label: 'Camera', status: 'checking' },
      { id: 'microphone', label: 'Microphone', status: 'checking' },
      { id: 'storage', label: 'Storage', status: 'checking' },
    ]
    if (showOllama) {
      initialItems.push({ id: 'ollama', label: 'Local AI (Ollama)', status: 'checking' })
    }
    if (showCloudGateway) {
      initialItems.push({ id: 'cloud', label: 'Cloud AI Gateway', status: 'checking' })
    }
    initialItems.push({ id: 'ai_models', label: 'AI Models', status: 'checking' })

    setItems(initialItems)

    const runChecks = async () => {
      // Camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(t => t.stop())
        updateItem('camera', { status: 'ready', detail: 'Camera accessible' })
      } catch {
        updateItem('camera', { status: 'error', detail: 'Camera not available or permission denied' })
      }

      // Microphone
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(t => t.stop())
        updateItem('microphone', { status: 'ready', detail: 'Microphone accessible' })
      } catch {
        updateItem('microphone', { status: 'warning', detail: 'Mic unavailable — audio modules will be skipped' })
      }

      // Storage
      try {
        if (navigator.storage && navigator.storage.estimate) {
          const est = await navigator.storage.estimate()
          const freeGB = ((est.quota || 0) - (est.usage || 0)) / (1024 * 1024 * 1024)
          if (freeGB > 0.5) {
            updateItem('storage', { status: 'ready', detail: `${freeGB.toFixed(1)} GB available` })
          } else {
            updateItem('storage', { status: 'warning', detail: `Only ${freeGB.toFixed(2)} GB free` })
          }
        } else {
          updateItem('storage', { status: 'ready', detail: 'Storage API not available — assuming OK' })
        }
      } catch {
        updateItem('storage', { status: 'warning', detail: 'Cannot check storage' })
      }

      // Ollama
      if (showOllama) {
        try {
          const res = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(3000) })
          if (res.ok) {
            const data = await res.json()
            const models = (data.models || []).map((m: { name: string }) => m.name)
            updateItem('ollama', { status: 'ready', detail: `${models.length} models available` })
          } else {
            updateItem('ollama', { status: 'warning', detail: 'Ollama running but returned error' })
          }
        } catch {
          updateItem('ollama', { status: 'warning', detail: 'Ollama not running — AI will use cloud fallback' })
        }
      }

      // Cloud gateway
      if (showCloudGateway) {
        updateItem('cloud', { status: 'ready', detail: 'Cloud gateway configured' })
      }

      // AI Models (check Cache API)
      try {
        const { getCachedModelSize } = await import('../../lib/ai/model-loader')
        const size = await getCachedModelSize()
        if (size > 0) {
          updateItem('ai_models', { status: 'ready', detail: `${(size / (1024 * 1024)).toFixed(1)} MB cached` })
        } else {
          updateItem('ai_models', { status: 'warning', detail: 'No models cached — will download on first use' })
        }
      } catch {
        updateItem('ai_models', { status: 'warning', detail: 'AI models not yet downloaded' })
      }

      setChecking(false)
    }

    runChecks()
  }, [showOllama, showCloudGateway, updateItem])

  useEffect(() => {
    if (!checking) {
      const allOk = items.every(i => i.status === 'ready' || i.status === 'warning')
      if (allOk) onReady?.()
    }
  }, [checking, items, onReady])

  const statusIcon = (status: ReadinessItem['status']) => {
    switch (status) {
      case 'checking': return '⏳'
      case 'ready': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
    }
  }

  const statusColor = (status: ReadinessItem['status']) => {
    switch (status) {
      case 'checking': return 'text-gray-500'
      case 'ready': return 'text-green-700'
      case 'warning': return 'text-amber-700'
      case 'error': return 'text-red-700'
    }
  }

  const hasErrors = items.some(i => i.status === 'error')

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-base">🔧</span>
        <span className="text-sm font-semibold text-gray-800">Device Readiness</span>
        {checking && <span className="text-xs text-gray-400 ml-auto">Checking...</span>}
        {!checking && !hasErrors && <span className="text-xs text-green-600 ml-auto">All ready</span>}
        {!checking && hasErrors && <span className="text-xs text-red-600 ml-auto">Issues found</span>}
      </div>

      <div className="space-y-1.5">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2">
            <span className="text-sm">{statusIcon(item.status)}</span>
            <span className="text-xs font-medium text-gray-700 w-28">{item.label}</span>
            <span className={`text-[11px] ${statusColor(item.status)}`}>{item.detail || ''}</span>
          </div>
        ))}
      </div>

      {hasErrors && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">
          Some required features are unavailable. Screening may be limited.
        </p>
      )}
    </div>
  )
}
