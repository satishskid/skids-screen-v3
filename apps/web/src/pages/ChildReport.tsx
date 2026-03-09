/**
 * Child Report Page — Multi-section health report with visualizations and education.
 * Sections: Overview → Vitals & Growth → Head-to-Toe Modules → Clinical Summary
 */

import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import type { Child, Observation } from '@skids/shared'
import {
  MODULE_CONFIGS,
  computeFourDReport,
  getModuleEducation,
  getConditionInfo,
  CONDITION_DESCRIPTIONS,
} from '@skids/shared'
import { InlineGrowthPanel, BehavioralRadar, EvidenceGallery, InlineAudiogram, InlineCardiacSummary } from '../components/report/ReportCharts'
import { GrowthChart } from '../components/visualizations/GrowthChart'
import { AudiogramChart } from '../components/visualizations/AudiogramChart'
import { DentalDiagram } from '../components/visualizations/DentalDiagram'
import { VisionDiagram } from '../components/visualizations/VisionDiagram'

interface APIResponse {
  child: Child
  observations: Observation[]
}

export function ChildReportPage() {
  const { code, childId } = useParams<{ code: string; childId: string }>()
  const { token } = useAuth()
  const [data, setData] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || ''

        const [childRes, obsRes] = await Promise.all([
          fetch(`${apiUrl}/api/children/${childId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/api/observations?childId=${childId}&campaignCode=${code}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (!childRes.ok || !obsRes.ok) throw new Error('Failed to load data')

        const childData = await childRes.json()
        const obsData = await obsRes.json()

        setData({
          child: childData.child || childData,
          observations: obsData.observations || obsData,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load report')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [code, childId, token])

  const fourDReport = useMemo(() => {
    if (!data) return null
    return computeFourDReport(data.observations)
  }, [data])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 text-sm">{error || 'No data available'}</p>
        <Link to={`/campaigns/${code}`} className="text-sm text-blue-600 mt-2 inline-block">Back to campaign</Link>
      </div>
    )
  }

  const { child, observations } = data
  const age = child.dob
    ? `${Math.floor((Date.now() - new Date(child.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years`
    : 'Unknown age'

  // Group observations by module
  const obsByModule = observations.reduce((acc, obs) => {
    acc[obs.moduleType] = [...(acc[obs.moduleType] || []), obs]
    return acc
  }, {} as Record<string, Observation[]>)

  // Separate vitals modules from head-to-toe
  const vitalModules = ['height', 'weight', 'vitals', 'spo2', 'hemoglobin', 'bp', 'muac']
  const vitalObs = observations.filter(o => vitalModules.includes(o.moduleType))
  const examObs = observations.filter(o => !vitalModules.includes(o.moduleType))

  return (
    <div className="max-w-4xl mx-auto space-y-8 print:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{child.name}</h1>
          <p className="text-sm text-gray-500">
            {age} | {child.gender || 'Unknown'} | Campaign: {code}
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Link to={`/campaigns/${code}`} className="text-xs text-gray-500 hover:text-gray-700">
            Back to Campaign
          </Link>
          <button
            className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            onClick={() => window.print()}
          >
            Print Report
          </button>
        </div>
      </div>

      {/* Section 1: Overview */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Screening Overview</h2>

        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{observations.length}</p>
            <p className="text-[10px] text-gray-500">Modules Screened</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {fourDReport?.categories.filter(c => c.conditions.length > 0).length || 0}
            </p>
            <p className="text-[10px] text-gray-500">4D Categories</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">
              {observations.filter(o => o.aiAnnotations?.[0]?.riskCategory === 'high_risk').length}
            </p>
            <p className="text-[10px] text-gray-500">High Risk</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {observations.filter(o => !o.aiAnnotations?.[0]?.riskCategory || o.aiAnnotations[0].riskCategory === 'no_risk').length}
            </p>
            <p className="text-[10px] text-gray-500">Normal</p>
          </div>
        </div>
      </section>

      {/* Section 2: Vitals & Growth */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Vitals & Growth</h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-medium text-gray-600 mb-2">Growth Z-Scores</h3>
            <InlineGrowthPanel observations={vitalObs} />
          </div>
          <div>
            <h3 className="text-xs font-medium text-gray-600 mb-2">Growth Chart</h3>
            <GrowthChart observations={vitalObs} childDob={child.dob} />
          </div>
        </div>

        {/* Vital signs table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1.5 text-gray-500 font-medium">Module</th>
                <th className="text-left py-1.5 text-gray-500 font-medium">Value</th>
                <th className="text-left py-1.5 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {vitalObs.map(obs => {
                const features = obs.aiAnnotations?.[0]?.features as Record<string, unknown> | undefined
                const moduleConfig = MODULE_CONFIGS.find(m => m.type === obs.moduleType)
                return (
                  <tr key={obs.id} className="border-b border-gray-100">
                    <td className="py-1.5 text-gray-700">{moduleConfig?.name || obs.moduleType}</td>
                    <td className="py-1.5 text-gray-900 font-medium">
                      {features?.value !== undefined ? `${features.value}` : '—'}
                      {features?.unit ? ` ${features.unit}` : ''}
                    </td>
                    <td className="py-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        obs.aiAnnotations?.[0]?.riskCategory === 'high_risk' ? 'bg-red-100 text-red-700' :
                        obs.aiAnnotations?.[0]?.riskCategory === 'possible_risk' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {obs.aiAnnotations?.[0]?.riskCategory?.replace('_', ' ') || 'normal'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: Head-to-Toe Modules */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Head-to-Toe Examination</h2>

        <div className="space-y-4">
          {examObs.map(obs => {
            const moduleConfig = MODULE_CONFIGS.find(m => m.type === obs.moduleType)
            const education = getModuleEducation(obs.moduleType)
            const chips = (obs.annotationData as { selectedChips?: string[] })?.selectedChips ?? []
            const risk = obs.aiAnnotations?.[0]?.riskCategory || 'no_risk'

            return (
              <div key={obs.id} className="border border-gray-100 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-800">
                    {moduleConfig?.name || obs.moduleType}
                  </h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    risk === 'high_risk' ? 'bg-red-100 text-red-700' :
                    risk === 'possible_risk' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {risk.replace('_', ' ')}
                  </span>
                </div>

                {/* Summary text */}
                {obs.aiAnnotations?.[0]?.summaryText && (
                  <p className="text-xs text-gray-600">{obs.aiAnnotations[0].summaryText}</p>
                )}

                {/* Chips */}
                {chips.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {chips.map(chipId => (
                      <span key={chipId} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                        {chipId}
                      </span>
                    ))}
                  </div>
                )}

                {/* Module-specific visualizations */}
                {obs.moduleType === 'hearing' && <AudiogramChart observations={[obs]} />}
                {obs.moduleType === 'dental' && <DentalDiagram observations={[obs]} />}
                {obs.moduleType === 'vision' && <VisionDiagram observations={[obs]} />}
                {obs.moduleType === 'cardiac' && <InlineCardiacSummary observations={[obs]} />}
                {obs.moduleType === 'neurodevelopment' && <BehavioralRadar observations={[obs]} />}

                {/* Evidence image */}
                {obs.mediaUrl && (
                  <img src={obs.mediaUrl} alt={obs.moduleType} className="w-24 h-24 rounded-lg object-cover border border-gray-200" loading="lazy" />
                )}

                {/* Parent education */}
                {education && risk !== 'no_risk' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <p className="text-[10px] font-medium text-blue-700 mb-0.5">For Parents</p>
                    <p className="text-[10px] text-blue-600">{education.healthy}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Section 4: Clinical Summary (4D Report) */}
      {fourDReport && fourDReport.categories.some(c => c.conditions.length > 0) && (
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">4D Clinical Summary</h2>

          {fourDReport.categories
            .filter(c => c.conditions.length > 0)
            .map(cat => (
              <div key={cat.category} className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-700">{cat.label}</h3>
                <div className="space-y-1">
                  {cat.conditions.map(cond => (
                    <div key={cond.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        cond.severity === 'severe' ? 'bg-red-100 text-red-700' :
                        cond.severity === 'moderate' ? 'bg-amber-100 text-amber-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {cond.severity}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800">{cond.name}</p>
                        {CONDITION_DESCRIPTIONS[cond.id] && (
                          <p className="text-[10px] text-gray-500 mt-0.5">{CONDITION_DESCRIPTIONS[cond.id]}</p>
                        )}
                        {cond.icdCode && (
                          <span className="text-[9px] text-gray-400">ICD: {cond.icdCode}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </section>
      )}

      {/* Evidence Gallery */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Evidence Gallery</h2>
        <EvidenceGallery observations={observations} />
      </section>

      {/* Footer */}
      <div className="text-center text-[10px] text-gray-400 py-4 print:py-2">
        SKIDS Screen V3 — Generated {new Date().toLocaleDateString()} — For clinical use only
      </div>
    </div>
  )
}
