/**
 * Base URL for API requests. Empty = same origin (use Vite proxy in dev).
 * Set VITE_API_ORIGIN=http://localhost:5001 in .env if proxy fails.
 */
const API_ORIGIN = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_ORIGIN
  ? import.meta.env.VITE_API_ORIGIN.replace(/\/$/, '')
  : ''

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_ORIGIN}${p}`
}

/**
 * Fetch and parse JSON. If the response is HTML (e.g. SPA fallback or error page),
 * throws a clear error instead of "Unexpected token '<'".
 */
export async function apiFetch(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : apiUrl(url)
  const res = await fetch(fullUrl, options)
  const text = await res.text()
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    try {
      return { res, data: JSON.parse(text) }
    } catch (_) {
      throw new Error(
        `Backend returned invalid JSON (${res.status}) from ${fullUrl}. Ensure the backend is running and reachable.`
      )
    }
  }
  if (text.trimStart().startsWith('<')) {
    throw new Error(
      `Backend unavailable or wrong URL (${res.status}) from ${fullUrl}. ` +
        `You are receiving HTML instead of JSON (first chars: ${JSON.stringify(text.trimStart().slice(0, 40))}). ` +
        `Restart frontend+backend and ensure /api is proxied to :5001.`
    )
  }
  try {
    const data = JSON.parse(text)
    return { res, data }
  } catch (_) {
    throw new Error(
      `Backend returned an unexpected response (${res.status}) from ${fullUrl}. Ensure the backend is running and reachable.`
    )
  }
}
