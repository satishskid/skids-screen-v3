/**
 * AI Configuration Panel — Admin settings for LLM mode, local model, cloud provider.
 * Ported from V2 admin-setup-wizard.tsx (AI section only).
 */

import { useState, useCallback } from 'react'
import {
  type AIMode,
  type CloudProvider,
  type LLMConfig,
  DEFAULT_LLM_CONFIG,
  LOCAL_MODEL_RECOMMENDATIONS,
  checkOllamaStatus,
} from '../../lib/ai/llm-gateway'

interface AIConfigPanelProps {
  config?: Partial<LLMConfig>
  onSave: (config: LLMConfig) => void
  saving?: boolean
}

const MODE_LABELS: Record<AIMode, { label: string; desc: string }> = {
  local_only: { label: 'Local Only', desc: 'Ollama on this device — full privacy, no cloud' },
  local_first: { label: 'Local First', desc: 'Try Ollama first, fall back to cloud if unavailable' },
  cloud_first: { label: 'Cloud First', desc: 'Use cloud AI, fall back to Ollama if offline' },
  dual: { label: 'Dual (Side-by-Side)', desc: 'Run both local and cloud, show results side-by-side' },
}

const PROVIDER_LABELS: Record<CloudProvider, string> = {
  gemini: 'Gemini Flash (Google)',
  claude: 'Claude Sonnet (Anthropic)',
  gpt4o: 'GPT-4o (OpenAI)',
  groq: 'Groq (Llama 3.3 70B)',
}

const CATEGORY_COLORS: Record<string, string> = {
  medical: 'border-green-300 text-green-700 bg-green-50',
  general: 'border-blue-300 text-blue-700 bg-blue-50',
  reasoning: 'border-purple-300 text-purple-700 bg-purple-50',
  nurse: 'border-amber-300 text-amber-700 bg-amber-50',
}

export function AIConfigPanel({ config: initial, onSave, saving }: AIConfigPanelProps) {
  const [config, setConfig] = useState<LLMConfig>({
    ...DEFAULT_LLM_CONFIG,
    ...initial,
  })
  const [ollamaStatus, setOllamaStatus] = useState<{
    checked: boolean
    available: boolean
    models: string[]
    error?: string
  }>({ checked: false, available: false, models: [] })

  const handleTestOllama = useCallback(async () => {
    const status = await checkOllamaStatus(config.ollamaUrl, config.ollamaModel)
    setOllamaStatus({ checked: true, ...status })
  }, [config.ollamaUrl, config.ollamaModel])

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-800">AI Mode</label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(MODE_LABELS) as [AIMode, { label: string; desc: string }][]).map(([mode, info]) => (
            <button
              key={mode}
              className={`p-3 rounded-lg border text-left transition-colors ${
                config.mode === mode
                  ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setConfig(c => ({ ...c, mode }))}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                  config.mode === mode ? 'border-gray-900' : 'border-gray-300'
                }`}>
                  {config.mode === mode && <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />}
                </div>
                <span className="text-xs font-medium">{info.label}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1 ml-5">{info.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Local Model (Ollama) */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-800">Local AI Model (Ollama)</label>

        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 text-xs px-3 py-2 border rounded-lg"
            placeholder="http://localhost:11434"
            value={config.ollamaUrl}
            onChange={e => setConfig(c => ({ ...c, ollamaUrl: e.target.value }))}
          />
          <button
            className="text-xs px-3 py-2 bg-gray-100 border rounded-lg hover:bg-gray-200"
            onClick={handleTestOllama}
          >
            Test
          </button>
        </div>

        {ollamaStatus.checked && (
          <div className={`text-xs p-2 rounded-lg ${ollamaStatus.available ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            {ollamaStatus.available
              ? `Connected — ${ollamaStatus.models.length} models found`
              : `Not available: ${ollamaStatus.error || 'Connection failed'}`}
          </div>
        )}

        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {Object.entries(LOCAL_MODEL_RECOMMENDATIONS).map(([key, rec]) => (
            <div
              key={key}
              className={`p-2.5 border rounded-lg cursor-pointer transition-colors ${
                config.ollamaModel === rec.model
                  ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setConfig(c => ({ ...c, ollamaModel: rec.model }))}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                  config.ollamaModel === rec.model ? 'border-gray-900' : 'border-gray-300'
                }`}>
                  {config.ollamaModel === rec.model && <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />}
                </div>
                <span className="text-xs font-medium">{rec.label}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[rec.category] || ''}`}>
                  {rec.badge}
                </span>
                <span className="text-[10px] text-gray-400 ml-auto">{rec.size}</span>
              </div>
              <div className="ml-5 mt-1 flex items-center gap-2">
                <p className="text-[10px] text-gray-500">{rec.for}</p>
                {rec.vision && (
                  <span className="text-[8px] px-1 py-0 rounded border border-teal-200 text-teal-600">Vision</span>
                )}
                {rec.medical && (
                  <span className="text-[8px] px-1 py-0 rounded border border-green-200 text-green-600">Clinical</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cloud Provider */}
      {config.mode !== 'local_only' && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800">Cloud AI Provider</label>

          <select
            className="w-full text-xs px-3 py-2 border rounded-lg"
            value={config.cloudProvider}
            onChange={e => setConfig(c => ({ ...c, cloudProvider: e.target.value as CloudProvider }))}
          >
            {(Object.entries(PROVIDER_LABELS) as [CloudProvider, string][]).map(([provider, label]) => (
              <option key={provider} value={provider}>{label}</option>
            ))}
          </select>

          <input
            type="text"
            className="w-full text-xs px-3 py-2 border rounded-lg"
            placeholder="Cloudflare AI Gateway URL"
            value={config.cloudGatewayUrl}
            onChange={e => setConfig(c => ({ ...c, cloudGatewayUrl: e.target.value }))}
          />

          <input
            type="password"
            className="w-full text-xs px-3 py-2 border rounded-lg"
            placeholder="API Key"
            value={config.cloudApiKey}
            onChange={e => setConfig(c => ({ ...c, cloudApiKey: e.target.value }))}
          />

          {/* PHI Protection Toggle */}
          <div className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <div>
              <p className="text-xs font-medium text-amber-800">Send Images to Cloud</p>
              <p className="text-[10px] text-amber-600">
                When off (default), only text summaries are sent. Images stay local.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={config.sendImagesToCloud}
                onChange={e => setConfig(c => ({ ...c, sendImagesToCloud: e.target.checked }))}
              />
              <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>
      )}

      {/* Save */}
      <button
        className="w-full text-sm py-2.5 px-4 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
        onClick={() => onSave(config)}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save AI Configuration'}
      </button>
    </div>
  )
}
