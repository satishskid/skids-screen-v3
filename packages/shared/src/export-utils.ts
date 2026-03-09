// Export utilities for authority reports — CSV, JSON, and print
// Ported from V2 — adapted to V3 types (removed browser-specific downloadFile/exportToPDF)

import type { PrevalenceReport } from './cohort-analytics'
import type { FourDCategory } from './four-d-mapping'
import { FOUR_D_CATEGORY_LABELS } from './four-d-mapping'

// ============================================
// TYPES
// ============================================

export interface DemographicData {
  totalChildren: number
  genderSplit: { male: number; female: number }
  ageGroups: Array<{ group: string; count: number; percentage: number }>
  conditionByAge: Array<{
    conditionName: string
    icdCode?: string
    byAge: Record<string, number>
  }>
  conditionByGender: Array<{
    conditionName: string
    icdCode?: string
    male: number
    female: number
  }>
}

export interface AuthorityReportData {
  campaignCode: string
  campaignName: string
  schoolName: string
  location?: string
  generatedAt: string
  dateRange: { start: string; end: string }
  prevalence: PrevalenceReport
  demographics: DemographicData
  executiveSummary: {
    totalScreened: number
    completionRate: number
    referralRate: number
    highRiskCount: number
    topConditions: Array<{ name: string; prevalence: number }>
    overallNormalRate: number
  }
}

// ============================================
// CSV EXPORT
// ============================================

export function exportConditionsToCSV(report: PrevalenceReport): string {
  const headers = ['Condition', 'ICD-10 Code', 'Category', 'Count', 'Prevalence (%)', 'Normal', 'Mild', 'Moderate', 'Severe']
  const rows = report.conditions.map(c => [
    `"${c.conditionName}"`,
    c.icdCode || '',
    getCategoryLabel(c.category),
    c.count,
    c.prevalence.toFixed(1),
    c.severityBreakdown['normal'] || 0,
    c.severityBreakdown['mild'] || 0,
    c.severityBreakdown['moderate'] || 0,
    c.severityBreakdown['severe'] || 0,
  ])

  const categoryRows = report.categoryPrevalence.map(cp => [
    `"[CATEGORY] ${cp.label}"`,
    '',
    cp.label,
    cp.totalConditionsFound,
    cp.prevalence.toFixed(1),
    '', '', '', '',
  ])

  return [
    `"SKIDS Screen — Prevalence Report"`,
    `"Campaign: ${report.campaignCode}"`,
    `"Generated: ${report.generatedAt}"`,
    `"Total Screened: ${report.totalScreened}"`,
    '',
    headers.join(','),
    ...rows.map(r => r.join(',')),
    '',
    '"Category Summary"',
    ['Category', 'Conditions Found', 'Children Affected', 'Prevalence (%)'].join(','),
    ...categoryRows.map(r => [r[2], r[3], '', r[4]].join(',')),
  ].join('\n')
}

export function exportFullReportToCSV(
  report: PrevalenceReport,
  demographics: DemographicData,
): string {
  const sections: string[] = []

  // Section 1: Demographics
  sections.push('"DEMOGRAPHICS"')
  sections.push(`"Total Children",${demographics.totalChildren}`)
  sections.push(`"Male",${demographics.genderSplit.male}`)
  sections.push(`"Female",${demographics.genderSplit.female}`)
  sections.push('')
  sections.push('"Age Group","Count","Percentage"')
  for (const ag of demographics.ageGroups) {
    sections.push(`"${ag.group}",${ag.count},${ag.percentage.toFixed(1)}`)
  }
  sections.push('')

  // Section 2: Condition prevalence
  sections.push(exportConditionsToCSV(report))

  return sections.join('\n')
}

export function exportToJSON(data: AuthorityReportData): string {
  return JSON.stringify(data, null, 2)
}

// ============================================
// FILE NAME GENERATION
// ============================================

export function generateReportFilename(
  campaignCode: string,
  format: 'csv' | 'json' | 'pdf',
): string {
  const date = new Date().toISOString().split('T')[0]
  return `skids-report-${campaignCode}-${date}.${format}`
}

// ============================================
// HELPERS
// ============================================

function getCategoryLabel(category: FourDCategory): string {
  return FOUR_D_CATEGORY_LABELS[category] || category
}
