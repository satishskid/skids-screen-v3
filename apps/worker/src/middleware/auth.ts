// Auth middleware — protects API routes, extracts user info
import { createMiddleware } from 'hono/factory'
import type { Bindings, Variables } from '../index'
import { createAuth } from '../auth'

/**
 * Auth middleware — validates session, sets userId + userRole on context.
 * Use on protected routes: app.use('/api/protected/*', authMiddleware)
 */
export const authMiddleware = createMiddleware<{
  Bindings: Bindings
  Variables: Variables
}>(async (c, next) => {
  const auth = createAuth(c.env)

  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    if (!session?.user) {
      return c.json({ error: 'Unauthorized — please sign in' }, 401)
    }

    c.set('userId', session.user.id)
    // Read role from user.additionalFields (stored on user table)
    c.set('userRole', (session.user as Record<string, unknown>).role as string || 'nurse')

    await next()
  } catch {
    return c.json({ error: 'Invalid session' }, 401)
  }
})

/**
 * Role guard — restrict access to specific roles.
 * Usage: app.get('/api/analytics', requireRole('doctor', 'admin'), handler)
 */
export function requireRole(...roles: string[]) {
  return createMiddleware<{
    Bindings: Bindings
    Variables: Variables
  }>(async (c, next) => {
    const userRole = c.get('userRole')
    if (!userRole || !roles.includes(userRole)) {
      return c.json({
        error: 'Forbidden — insufficient permissions',
        required: roles,
        current: userRole || 'none',
      }, 403)
    }
    await next()
  })
}
