import { getApiBaseUrl } from '../config/env'

export async function loginRequest({ username, password }) {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.detail || 'Login gagal')
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
    throw new Error(payload.detail || 'Gagal mengambil profil')
  }

  return payload
}
