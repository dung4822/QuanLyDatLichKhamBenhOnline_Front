export function getTodayDateString() {
  const date = new Date()
  const timezoneOffset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10)
}

export function getTomorrowDateString() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  const timezoneOffset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 10)
}

export function isFutureDate(dateString) {
  return Boolean(dateString) && dateString > getTodayDateString()
}

export function parseDateOnly(dateString) {
  const [year, month, day] = (dateString || '').split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

export function formatDate(dateString, options = {}) {
  if (!dateString) {
    return '—'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }).format(parseDateOnly(dateString))
}

export function formatMonth(monthDate) {
  return new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(monthDate)
}

export function getScopeLabel(nonWorkingDay) {
  return nonWorkingDay.doctorId === null ? 'Toàn bệnh viện' : nonWorkingDay.doctorFullName || `Bác sĩ #${nonWorkingDay.doctorId}`
}
