// Tách các lời gọi HTTP khỏi component để UI chỉ tập trung vào hiển thị và thao tác người dùng.
// Trong lúc chạy Vite, `/api` đi qua proxy đã cấu hình trong vite.config.js.
// Khi deploy khác backend, có thể đặt VITE_API_BASE_URL, ví dụ: https://localhost:7023/api
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const SPECIALTIES_URL = `${API_BASE_URL}/specialties`

export class ApiError extends Error {
  constructor(status, data) {
    super('Yêu cầu tới API không thành công.')
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function readResponseBody(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    // Một số lỗi từ server có thể trả về text thay vì JSON.
    return text
  }
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await readResponseBody(response)

  if (!response.ok) {
    throw new ApiError(response.status, data)
  }

  return data
}

export function getSpecialties() {
  return request(SPECIALTIES_URL)
}

export function createSpecialty(values) {
  return request(SPECIALTIES_URL, {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export function updateSpecialty(specialtyId, values) {
  return request(`${SPECIALTIES_URL}/${specialtyId}`, {
    method: 'PUT',
    body: JSON.stringify(values),
  })
}

export function deleteSpecialty(specialtyId) {
  return request(`${SPECIALTIES_URL}/${specialtyId}`, {
    method: 'DELETE',
  })
}
