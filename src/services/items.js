import { getApiBaseUrl } from '../config/env'
import { parseApiError } from '../utils/apiUtils'

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
    throw new Error(parseApiError(payload, 'Permintaan gagal'))
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

export function fetchItems(token, params = {}) {
  const queryParams = new URLSearchParams()
  if (params.q) queryParams.append('q', params.q)
  if (params.category_id) queryParams.append('category_id', params.category_id)
  if (params.in_stock !== undefined && params.in_stock !== null && params.in_stock !== '') {
    queryParams.append('in_stock', params.in_stock)
  }

  const queryString = queryParams.toString()
  const url = queryString ? `/api/v1/items/?${queryString}` : '/api/v1/items/'

  return requestJson(url, {
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

export function updateItem({ itemId, payload, token }) {
  return requestJson(`/api/v1/items/${itemId}`, {
    method: 'PUT',
    headers: {
      ...buildHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export async function deleteItem({ itemId, token }) {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/items/${itemId}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(parseApiError(payload, 'Gagal menghapus item'))
  }
}

export function getItemPhotoUrl(itemId) {
  return `${getApiBaseUrl()}/api/v1/items/${itemId}/photo`
}

export function getItemPhotoAdditionalUrl(itemId, photoId) {
  return `${getApiBaseUrl()}/api/v1/items/${itemId}/photos/${photoId}`
}
