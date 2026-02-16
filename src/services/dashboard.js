import { getApiBaseUrl } from '../config/env'

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
    throw new Error(payload.detail || 'Gagal mengambil data dashboard')
  }

  return payload
}
