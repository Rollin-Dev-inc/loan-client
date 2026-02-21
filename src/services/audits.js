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

export function fetchAudits(token) {
    return requestJson('/api/v1/audits/', {
        headers: buildHeaders(token),
    })
}
