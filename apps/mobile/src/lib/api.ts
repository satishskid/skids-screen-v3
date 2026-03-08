// API client for SKIDS Screen V3 mobile app
// Simple fetch wrapper with auth token support

const API_BASE = 'https://skids-api.satish-9f4.workers.dev'

export async function apiCall<T = unknown>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...fetchOptions } = options || {}

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions?.headers,
    },
  })

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '')
    throw new Error(
      `API ${res.status}: ${res.statusText}${errorBody ? ` — ${errorBody}` : ''}`
    )
  }

  return res.json() as Promise<T>
}

export { API_BASE }
