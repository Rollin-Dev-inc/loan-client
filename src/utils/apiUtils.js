export function translatePydanticError(msg) {
  if (!msg) return msg

  if (msg === 'Field required') return 'Kolom ini wajib diisi'
  if (msg === 'Input should be a valid string') return 'Input harus berupa teks yang valid'
  if (msg === 'Input should be a valid integer') return 'Input harus berupa angka bulat'
  if (msg === 'Input should be a valid boolean') return 'Input harus berupa pilihan ya/tidak'
  
  // Regex mapping for dynamic messages
  let match = msg.match(/String should have at least (\d+) characters/)
  if (match) return `Minimal harus ${match[1]} karakter`

  match = msg.match(/String should have at most (\d+) characters/)
  if (match) return `Maksimal ${match[1]} karakter`

  match = msg.match(/Input should be greater than or equal to (\d+)/)
  if (match) return `Nilai minimal adalah ${match[1]}`

  match = msg.match(/Input should be less than or equal to (\d+)/)
  if (match) return `Nilai maksimal adalah ${match[1]}`

  match = msg.match(/Value error, (.*)/)
  if (match) return `Kesalahan input: ${match[1]}`

  return msg
}

export function parseApiError(payload, defaultMessage = 'Permintaan gagal') {
  if (payload && payload.detail) {
    if (Array.isArray(payload.detail) && payload.detail.length > 0) {
      if (payload.detail[0].msg) {
        return translatePydanticError(payload.detail[0].msg)
      }
      return JSON.stringify(payload.detail)
    }
    if (typeof payload.detail === 'string') {
      return payload.detail
    }
  }
  return defaultMessage
}
