import config from './config'

function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem('auth')
    if (!raw) return null
    const parsed = JSON.parse(raw) as { token?: string | null }
    return parsed?.token || null
  } catch {
    return null
  }
}

export async function apiPost<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    credentials: 'omit',
    ...init,
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(msg || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${config.apiBaseUrl}${path}`, {
    method: 'GET',
    headers,
    credentials: 'omit',
    ...init,
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(msg || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}


