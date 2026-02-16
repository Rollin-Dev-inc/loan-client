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

export function fetchLoans(token) {
  return requestJson('/api/v1/loans/', {
    headers: buildHeaders(token),
  })
}

export function fetchLoanNotifications(token) {
  return requestJson('/api/v1/loans/notifications', {
    headers: buildHeaders(token),
  })
}

export function fetchLoanItems(token) {
  return requestJson('/api/v1/items/', {
    headers: buildHeaders(token),
  })
}

export function createLoan({ payload, token }) {
  return requestJson('/api/v1/loans/', {
    method: 'POST',
    headers: {
      ...buildHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function confirmLoanReturned({ loanId, token }) {
  return requestJson(`/api/v1/loans/${loanId}/confirm-return`, {
    method: 'PATCH',
    headers: {
      ...buildHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_returned: true }),
  })
}
