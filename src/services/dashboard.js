import { getApiBaseUrl } from '../config/env'
import { parseApiError } from '../utils/apiUtils'

export async function fetchDashboardSummary({ period, token }) {
  const headers = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${getApiBaseUrl()}/api/v1/dashboard/?period=${period}`, {
    headers,
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(parseApiError(payload, 'Gagal mengambil data dashboard'))
  }

  return payload
}
