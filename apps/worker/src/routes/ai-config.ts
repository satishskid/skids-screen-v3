/**
 * AI Configuration Routes — Store/retrieve per-org AI settings.
 */

import { Hono } from 'hono'
import type { Bindings, Variables } from '../index'

export const aiConfigRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

/** GET /api/ai-config/:orgId — Get AI config for an organization */
aiConfigRoutes.get('/:orgId', async (c) => {
  const db = c.get('db')
  const orgId = c.req.param('orgId')

  try {
    const result = await db.execute({
      sql: `SELECT config_json FROM ai_config WHERE org_id = ? LIMIT 1`,
      args: [orgId],
    })

    if (result.rows.length === 0) {
      return c.json({ config: null })
    }

    const config = JSON.parse(result.rows[0].config_json as string)
    return c.json({ config })
  } catch {
    return c.json({ config: null, note: 'ai_config table not yet created' })
  }
})

/** PUT /api/ai-config/:orgId — Save AI config for an organization */
aiConfigRoutes.put('/:orgId', async (c) => {
  const db = c.get('db')
  const orgId = c.req.param('orgId')
  const body = await c.req.json()

  try {
    // Ensure table exists
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ai_config (
        org_id TEXT PRIMARY KEY,
        config_json TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now')),
        updated_by TEXT
      )
    `)

    await db.execute({
      sql: `INSERT INTO ai_config (org_id, config_json, updated_by)
            VALUES (?, ?, ?)
            ON CONFLICT(org_id) DO UPDATE SET
              config_json = excluded.config_json,
              updated_at = datetime('now'),
              updated_by = excluded.updated_by`,
      args: [orgId, JSON.stringify(body.config), c.get('userId') || 'unknown'],
    })

    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: e instanceof Error ? e.message : 'Failed to save config' }, 500)
  }
})
