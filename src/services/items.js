import { getApiBaseUrl } from '../config/env'

function buildHeaders(token) {
  const headers = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, options)
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.detail || 'Permintaan gagal')
  }
  return payload
}

export function fetchCategories(token) {
  return requestJson('/api/v1/categories/', {
    headers: buildHeaders(token),
  })
}

export function createCategory({ name, token }) {
  return requestJson('/api/v1/categories/', {
    method: 'POST',
    headers: {
      ...buildHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  })
}

export function fetchItems(token) {
  return requestJson('/api/v1/items/', {
    headers: buildHeaders(token),
  })
}

export function createItem({ payload, token }) {
  return requestJson('/api/v1/items/', {
    method: 'POST',
    headers: {
      ...buildHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function getItemPhotoUrl(itemId) {
  return `${getApiBaseUrl()}/api/v1/items/${itemId}/photo`
}
