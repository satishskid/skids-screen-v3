/**
 * Campaign Progress Route — Real-time campaign pipeline metrics.
 * GET /api/campaign-progress/:code — Full progress dashboard data.
 */

import { Hono } from 'hono'
import type { Bindings, Variables } from '../index'
import { computeCampaignDashboard, MODULE_CONFIGS } from '@skids/shared'
import type { Child, Observation, ClinicianReview, ModuleType } from '@skids/shared'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.get('/:code', async (c) => {
  const code = c.req.param('code')
  const db = c.get('db')

  const [childRows, obsRows, reviewRows, campaignRow] = await Promise.all([
    db.execute({ sql: 'SELECT * FROM children WHERE campaignCode = ?', args: [code] }),
    db.execute({ sql: 'SELECT * FROM observations WHERE campaignCode = ?', args: [code] }),
    db.execute({ sql: 'SELECT * FROM reviews WHERE campaignCode = ?', args: [code] }),
    db.execute({ sql: 'SELECT * FROM campaigns WHERE code = ?', args: [code] }),
  ])

  const campaign = campaignRow.rows?.[0] as any
  if (!campaign) return c.json({ error: 'Campaign not found' }, 404)

  const enabledModules: ModuleType[] = campaign.enabled_modules
    ? JSON.parse(campaign.enabled_modules)
    : MODULE_CONFIGS.map(m => m.type)

  const children: Child[] = (childRows.rows ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    dob: r.dob,
    gender: r.gender,
    class: r.class,
    campaignCode: r.campaignCode,
  }))

  const observations: Observation[] = (obsRows.rows ?? []).map((r: any) => ({
    id: r.id,
    childId: r.childId,
    moduleType: r.moduleType,
    campaignCode: r.campaignCode,
    annotationData: r.annotationData ? JSON.parse(r.annotationData) : undefined,
    aiAnnotations: r.aiAnnotations ? JSON.parse(r.aiAnnotations) : undefined,
    mediaUrl: r.mediaUrl,
    createdAt: r.createdAt,
    _nurseName: r.nurseName || r._nurseName,
  }))

  const reviews: Record<string, ClinicianReview> = {}
  for (const r of (reviewRows.rows ?? []) as any[]) {
    reviews[r.observationId || r.id] = {
      decision: r.decision,
      notes: r.notes,
      reviewedBy: r.reviewedBy,
      reviewedAt: r.reviewedAt,
    }
  }

  const progress = computeCampaignDashboard(children, observations, reviews, enabledModules)

  return c.json({ progress })
})

export const campaignProgressRoutes = app
