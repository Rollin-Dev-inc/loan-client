const fallbackApiUrl = 'http://localhost:8000'

export function getApiBaseUrl() {
  return (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_BACKEND_URLS ||
    fallbackApiUrl
  ).replace(/\/+$/, '')
}
