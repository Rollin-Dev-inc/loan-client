import { getApiBaseUrl } from '../config/env'
import { parseApiError } from '../utils/apiUtils'

export async function loginRequest({ username, password }) {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(parseApiError(payload, 'Login gagal'))
  }

  return payload
}

export async function fetchProfile(token) {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(parseApiError(payload, 'Gagal mengambil profil'))
  }

  return payload
}
