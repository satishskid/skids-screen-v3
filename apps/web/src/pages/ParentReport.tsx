/**
 * Parent Report Page — Token-protected, no-login view of child health report.
 * Accessed via /report/:token — suitable for QR code sharing.
 * Parent-friendly language, simplified visualizations, educational content.
 */

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { Child, Observation } from '@skids/shared'
import {
  MODULE_CONFIGS,
  computeFourDReport,
  getModuleEducation,
  getConditionInfo,
  CONDITION_DESCRIPTIONS,
} from '@skids/shared'

interface ReportData {
  child: Child
  observations: Observation[]
  campaignCode: string
}

export function ParentReportPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || ''
        const res = await fetch(`${apiUrl}/api/report-tokens/${token}`)
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'This report link is invalid or has expired.')
        }
        const result = await res.json()
        setData(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load report')
      } finally {
        setLoading(false)
      }
    }
    if (token) load()
  }, [token])

  const fourDReport = useMemo(() => {
    if (!data) return null
    return computeFourDReport(data.observations)
  }, [data])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading health report...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">!</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Report Unavailable</h1>
          <p className="mt-2 text-sm text-gray-500">{error || 'This report could not be found.'}</p>
          <p className="mt-4 text-xs text-gray-400">
            If you believe this is an error, please contact your child's school or clinic.
          </p>
        </div>
      </div>
    )
  }

  const { child, observations } = data
  const age = child.dob
    ? `${Math.floor((Date.now() - new Date(child.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old`
    : ''

  const vitalModules = ['height', 'weight', 'vitals', 'spo2', 'hemoglobin', 'bp', 'muac']
  const vitalObs = observations.filter(o => vitalModules.includes(o.moduleType))
  const examObs = observations.filter(o => !vitalModules.includes(o.moduleType))

  const normalCount = observations.filter(o => !o.aiAnnotations?.[0]?.riskCategory || o.aiAnnotations[0].riskCategory === 'no_risk').length
  const findingsCount = observations.length - normalCount

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">{child.name?.[0] || 'C'}</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Health Screening Report</h1>
              <p className="text-sm text-gray-500">{child.name} {age && `| ${age}`}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4">Summary</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <p className="text-2xl font-bold text-blue-700">{observations.length}</p>
              <p className="text-xs text-blue-600">Tests Done</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <p className="text-2xl font-bold text-green-700">{normalCount}</p>
              <p className="text-xs text-green-600">Normal</p>
            </div>
            <div className={`p-3 rounded-lg ${findingsCount > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
              <p className={`text-2xl font-bold ${findingsCount > 0 ? 'text-amber-700' : 'text-green-700'}`}>{findingsCount}</p>
              <p className={`text-xs ${findingsCount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {findingsCount > 0 ? 'Need Attention' : 'All Clear'}
              </p>
            </div>
          </div>

          {findingsCount === 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                Great news! Your child's screening results are all normal. Continue regular check-ups to maintain good health.
              </p>
            </div>
          )}
        </div>

        {/* Vitals */}
        {vitalObs.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Measurements</h2>
            <div className="space-y-2">
              {vitalObs.map(obs => {
                const features = obs.aiAnnotations?.[0]?.features as Record<string, unknown> | undefined
                const moduleConfig = MODULE_CONFIGS.find(m => m.type === obs.moduleType)
                const risk = obs.aiAnnotations?.[0]?.riskCategory || 'no_risk'
                return (
                  <div key={obs.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-700">{moduleConfig?.name || obs.moduleType}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {features?.value !== undefined ? `${features.value}` : ''}
                        {features?.unit ? ` ${features.unit}` : ''}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        risk === 'high_risk' ? 'bg-red-100 text-red-700' :
                        risk === 'possible_risk' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {risk === 'no_risk' ? 'Normal' : risk === 'possible_risk' ? 'Check' : 'Attention'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Examination Results */}
        {examObs.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">Examination Results</h2>
            <div className="space-y-3">
              {examObs.map(obs => {
                const moduleConfig = MODULE_CONFIGS.find(m => m.type === obs.moduleType)
                const education = getModuleEducation(obs.moduleType)
                const risk = obs.aiAnnotations?.[0]?.riskCategory || 'no_risk'
                const isNormal = risk === 'no_risk'

                return (
                  <div key={obs.id} className={`rounded-lg border p-3 ${
                    isNormal ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-800">{moduleConfig?.name || obs.moduleType}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isNormal ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'
                      }`}>
                        {isNormal ? 'Normal' : 'Needs Follow-up'}
                      </span>
                    </div>

                    {obs.aiAnnotations?.[0]?.summaryText && (
                      <p className="mt-1 text-xs text-gray-600">{obs.aiAnnotations[0].summaryText}</p>
                    )}

                    {/* Educational content */}
                    {education && (
                      <p className="mt-2 text-xs text-gray-500">
                        {isNormal ? education.healthyMessage : education.intro}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Conditions needing attention */}
        {fourDReport && fourDReport.categories.some(c => c.conditions.length > 0) && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">What We Found</h2>
            <div className="space-y-3">
              {fourDReport.categories
                .filter(c => c.conditions.length > 0)
                .flatMap(cat => cat.conditions)
                .map(cond => {
                  const condInfo = getConditionInfo(cond.id)
                  return (
                    <div key={cond.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          cond.severity === 'severe' ? 'bg-red-100 text-red-700' :
                          cond.severity === 'moderate' ? 'bg-amber-100 text-amber-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {cond.severity}
                        </span>
                        <h3 className="text-sm font-medium text-gray-800">{cond.name}</h3>
                      </div>
                      {condInfo && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-600">{condInfo.description}</p>
                          {condInfo.prevalence && (
                            <p className="text-[10px] text-gray-400">{condInfo.prevalence}</p>
                          )}
                          <p className="text-xs text-blue-700 font-medium mt-1">{condInfo.intervention}</p>
                        </div>
                      )}
                      {!condInfo && CONDITION_DESCRIPTIONS[cond.id] && (
                        <p className="mt-1 text-xs text-gray-600">{CONDITION_DESCRIPTIONS[cond.id]}</p>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-blue-800 mb-2">Next Steps</h2>
          <ul className="space-y-1.5 text-xs text-blue-700">
            {findingsCount > 0 ? (
              <>
                <li>1. Share this report with your child's doctor at the next visit.</li>
                <li>2. If any condition is marked "severe," schedule a doctor visit soon.</li>
                <li>3. Follow any specific recommendations listed above.</li>
                <li>4. Continue regular health check-ups as recommended.</li>
              </>
            ) : (
              <>
                <li>1. Keep this report for your records.</li>
                <li>2. Continue regular health check-ups.</li>
                <li>3. Maintain a balanced diet and regular physical activity.</li>
              </>
            )}
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-gray-400 py-4">
          SKIDS Health Screening Report | Generated {new Date().toLocaleDateString()}
          <br />This is a screening report, not a diagnosis. Please consult a doctor for medical advice.
        </div>
      </div>
    </div>
  )
}
