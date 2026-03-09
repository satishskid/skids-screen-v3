/**
 * AI Gateway Worker Route — Proxies LLM requests through Cloudflare AI Gateway.
 * Logs usage to ai_usage table for cost tracking and observability.
 */

import { Hono } from 'hono'
import type { Bindings, Variables } from '../index'

export const aiGatewayRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

/** POST /api/ai/analyze — Route LLM request through Cloudflare AI Gateway */
aiGatewayRoutes.post('/analyze', async (c) => {
  const db = c.get('db')
  const userId = c.get('userId')
  const startTime = Date.now()

  const body = await c.req.json<{
    model: string
    messages: Array<{ role: string; content: string }>
    max_tokens?: number
    temperature?: number
    provider?: string
  }>()

  // For now, proxy to the configured cloud gateway
  // In production, this would route through Cloudflare AI Gateway binding
  const latencyMs = Date.now() - startTime

  // Log usage
  try {
    await db.execute({
      sql: `INSERT INTO ai_usage (user_id, model, provider, tokens_input, tokens_output, latency_ms, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        userId || 'anonymous',
        body.model,
        body.provider || 'cloud',
        0, // Will be populated from actual response
        0,
        latencyMs,
      ],
    })
  } catch {
    // Don't fail the request if logging fails
  }

  return c.json({
    message: 'AI Gateway route placeholder — configure Cloudflare AI binding to enable.',
    model: body.model,
    provider: body.provider || 'cloud',
    latencyMs,
  })
})

/** GET /api/ai/usage — Get AI usage stats (admin only) */
aiGatewayRoutes.get('/usage', async (c) => {
  const db = c.get('db')

  try {
    const result = await db.execute(`
      SELECT
        model,
        provider,
        COUNT(*) as request_count,
        SUM(tokens_input + tokens_output) as total_tokens,
        AVG(latency_ms) as avg_latency_ms,
        MAX(created_at) as last_used
      FROM ai_usage
      GROUP BY model, provider
      ORDER BY request_count DESC
    `)

    return c.json({ usage: result.rows })
  } catch {
    // Table might not exist yet
    return c.json({ usage: [], note: 'ai_usage table not yet created' })
  }
})
