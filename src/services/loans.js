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

export function fetchLoans(token, params = {}) {
  const queryParams = new URLSearchParams()
  if (params.borrower_name) queryParams.append('borrower_name', params.borrower_name)
  if (params.item_code) queryParams.append('item_code', params.item_code)
  if (params.status) queryParams.append('status', params.status)
  if (params.start_date) queryParams.append('start_date', params.start_date)
  if (params.end_date) queryParams.append('end_date', params.end_date)

  const queryString = queryParams.toString()
  const url = queryString ? `/api/v1/loans/?${queryString}` : '/api/v1/loans/'

  return requestJson(url, {
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
