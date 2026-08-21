const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const SHIFTS_URL = `${API_BASE_URL}/shifts`
const DOCTORS_URL = `${API_BASE_URL}/doctors`

export class ShiftApiError extends Error {
  constructor(status, data) {
    super('Yêu cầu tới API lịch làm việc không thành công.')
    this.name = 'ShiftApiError'
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
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const data = await readResponseBody(response)

  if (!response.ok) {
    throw new ShiftApiError(response.status, data)
  }

  return data
}

export function getShifts() {
  return request(SHIFTS_URL)
}

export function createShift(values) {
  return request(SHIFTS_URL, {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export function updateShift(shiftId, values) {
  return request(`${SHIFTS_URL}/${shiftId}`, {
    method: 'PUT',
    body: JSON.stringify(values),
  })
}

export function deleteShift(shiftId) {
  return request(`${SHIFTS_URL}/${shiftId}`, {
    method: 'DELETE',
  })
}

export function getDoctorShifts(doctorId) {
  return request(`${DOCTORS_URL}/${doctorId}/shifts`)
}

export function replaceDoctorShifts(doctorId, shiftIds) {
  // Đây là toàn bộ trạng thái checkbox sau khi chỉnh, không phải chỉ những ID mới tick.
  return request(`${DOCTORS_URL}/${doctorId}/shifts`, {
    method: 'PUT',
    body: JSON.stringify({ shiftIds }),
  })
}
