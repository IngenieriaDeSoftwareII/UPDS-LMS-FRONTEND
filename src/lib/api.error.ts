import type { AxiosError } from 'axios'

/**
 * Extrae el primer mensaje de error del formato estándar del backend:
 * { "errors": ["mensaje 1", "mensaje 2"] }
 *
 * Si no puede extraerlo, retorna el fallback provisto.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ errors?: string[] }>
  const errors = axiosError?.response?.data?.errors
  if (Array.isArray(errors) && errors.length > 0) return errors[0]
  return fallback
}
