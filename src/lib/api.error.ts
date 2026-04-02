import type { AxiosError } from 'axios'

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const ax = error as AxiosError<unknown>
  const data = ax?.response?.data

  if (data == null) return fallback

  if (typeof data === 'string' && data.trim()) return data

  if (Array.isArray(data) && data.length > 0) {
    const first = data[0]
    if (typeof first === 'string') return first
    return fallback
  }

  if (typeof data === 'object') {
    const o = data as Record<string, unknown>

    if ('errors' in o && o.errors != null) {
      const errors = o.errors
      if (Array.isArray(errors) && errors.length > 0) {
        const first = errors[0]
        if (typeof first === 'string') return first
      }
      if (typeof errors === 'object' && errors !== null) {
        for (const v of Object.values(errors)) {
          if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') return v[0]
          if (typeof v === 'string') return v
        }
      }
    }

    if ('title' in o && typeof o.title === 'string' && o.title) return o.title
    if ('detail' in o && typeof o.detail === 'string' && o.detail) return o.detail
    if ('message' in o && typeof o.message === 'string' && o.message) return o.message
  }

  return fallback
}
