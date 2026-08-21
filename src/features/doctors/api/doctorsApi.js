// Service này chỉ chịu trách nhiệm giao tiếp HTTP. Component không cần biết URL hay cách đọc response.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const DOCTORS_URL = `${API_BASE_URL}/doctors`

export class DoctorApiError extends Error {
  constructor(status, data) {
    super('Yêu cầu tới API bác sĩ không thành công.')
    this.name = 'DoctorApiError'
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
    return text
  }
}

async function request(url, options = {}) {
  const response = await fetch(url, options)
  const data = await readResponseBody(response)

  if (!response.ok) {
    throw new DoctorApiError(response.status, data)
  }

  return data
}

export function getDoctors() {
  return request(DOCTORS_URL)
}

export function createDoctor(formData) {
  // Không tự đặt Content-Type: browser cần tự thêm boundary cho multipart/form-data.
  return request(DOCTORS_URL, {
    method: 'POST',
    body: formData,
  })
}

export function updateDoctor(doctorId, formData) {
  return request(`${DOCTORS_URL}/${doctorId}`, {
    method: 'PUT',
    body: formData,
  })
}

export function deleteDoctor(doctorId) {
  return request(`${DOCTORS_URL}/${doctorId}`, {
    method: 'DELETE',
  })
}
