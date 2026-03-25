import type { AxiosError } from 'axios'

/**
 * Extract a user-friendly message from an API error.
 * Handles: string body, { message }, { detail }, { title }, or validation-style { errors }.
 */
export function getApiErrorMessage(err: unknown): string {
  const e = err as AxiosError<{ message?: string; detail?: string; title?: string; errors?: Record<string, string[]> }>
  const data = e.response?.data
  if (!data) return e.message || 'Something went wrong.'
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  if (data.message) return data.message
  if (data.title) return data.title
  if (data.errors && typeof data.errors === 'object') {
    const first = Object.entries(data.errors)[0]
    if (first) return first[1]?.[0] ?? first[0]
  }
  return e.message || 'Something went wrong.'
}
