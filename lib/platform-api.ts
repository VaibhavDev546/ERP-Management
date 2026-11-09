const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/+$/, '')

export type PlatformUser = {
  id: string
  email: string
  full_name: string
  is_superuser?: boolean
  role?: string | null
  permissions?: string[]
}

export type ApiList<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

let csrfToken: string | null = null
let refreshRequest: Promise<boolean> | null = null

function isUnsafeMethod(method: string) {
  return !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method.toUpperCase())
}

async function getCsrfToken() {
  if (csrfToken) return csrfToken
  const response = await fetch(`${API_BASE_URL}/auth/csrf/`, { credentials: 'include' })
  const body = await response.json()
  if (!response.ok || typeof body.csrfToken !== 'string') {
    throw new ApiError('Unable to initialize a secure connection to the backend.', response.status)
  }
  csrfToken = body.csrfToken
  return csrfToken
}

function getErrorMessage(body: unknown, fallback: string) {
  if (body && typeof body === 'object') {
    const data = body as Record<string, unknown>
    const error = data.error
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      return error.message
    }
    if (typeof data.detail === 'string') return data.detail
    if (typeof data.message === 'string') return data.message
    const firstFieldError = Object.values(data).find(value => Array.isArray(value) && typeof value[0] === 'string')
    if (Array.isArray(firstFieldError)) return firstFieldError[0] as string
  }
  return fallback
}

async function refreshPlatformSession() {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      const token = await getCsrfToken()
      const response = await fetch(`${API_BASE_URL}/auth/platform/refresh/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRFToken': token },
      })
      if (!response.ok) return false
      return true
    })().finally(() => {
      refreshRequest = null
    })
  }
  return refreshRequest
}

export async function platformRequest<T>(path: string, init: RequestInit = {}, retryUnauthorized = true): Promise<T> {
  const method = init.method ?? 'GET'
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (isUnsafeMethod(method)) headers.set('X-CSRFToken', await getCsrfToken())

  const send = () => fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    method,
    headers,
    credentials: 'include',
  })

  let response = await send()
  const isPlatformAuthEndpoint = ['/auth/platform/login/', '/auth/platform/refresh/', '/auth/platform/logout/']
    .some(endpoint => path.endsWith(endpoint))
  if (response.status === 401 && retryUnauthorized && !isPlatformAuthEndpoint) {
    if (await refreshPlatformSession()) response = await send()
  }

  const body = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(getErrorMessage(body, `Backend request failed (${response.status}).`), response.status)
  }
  return body as T
}

export function platformLogin(email: string, password: string) {
  return platformRequest<{ user: PlatformUser }>('/auth/platform/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, false)
}

export function getPlatformUser() {
  return platformRequest<PlatformUser>('/auth/platform/me/')
}

export function platformLogout() {
  return platformRequest<{ detail: string }>('/auth/platform/logout/', { method: 'POST' }, false)
}

export async function getPlatformList<T>(path: string, page = 1, pageSize = 100): Promise<ApiList<T>> {
  const separator = path.includes('?') ? '&' : '?'
  const result = await platformRequest<ApiList<T> | T[]>(`${path}${separator}page_size=${pageSize}&page=${page}`)
  return Array.isArray(result)
    ? { count: result.length, next: null, previous: null, results: result }
    : result
}

export const apiBaseUrl = API_BASE_URL
