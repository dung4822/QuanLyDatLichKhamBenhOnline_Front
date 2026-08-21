const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const NON_WORKING_DAYS_URL = `${API_BASE_URL}/non-working-days`

export class NonWorkingDayApiError extends Error {
  constructor(status, data) {
    super('Yêu cầu tới API ngày nghỉ không thành công.')
    this.name = 'NonWorkingDayApiError'
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
    throw new NonWorkingDayApiError(response.status, data)
  }

  return data
}

export function getNonWorkingDays(fromDate) {
  const query = fromDate ? `?fromDate=${encodeURIComponent(fromDate)}` : ''
  return request(`${NON_WORKING_DAYS_URL}${query}`)
}

export function createNonWorkingDay(values) {
  return request(NON_WORKING_DAYS_URL, {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export function updateNonWorkingDay(nonWorkingDayId, values) {
  return request(`${NON_WORKING_DAYS_URL}/${nonWorkingDayId}`, {
    method: 'PUT',
    body: JSON.stringify(values),
  })
}

export function deleteNonWorkingDay(nonWorkingDayId) {
  return request(`${NON_WORKING_DAYS_URL}/${nonWorkingDayId}`, {
    method: 'DELETE',
  })
}
