// Only public scheduling choices travel in URLs. Patient identity comes from /me/profile.
export function bookingIntent(search = '') {
  const query = new URLSearchParams(search)
  const id = (name) => /^[1-9]\d{0,9}$/.test(query.get(name) || '') && Number(query.get(name)) <= 2147483647 ? query.get(name) : ''
  const date = query.get('date') || ''
  const parsed = new Date(`${date}T00:00:00Z`)
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
  return { doctor: id('doctor'), slot: id('slot'), date: validDate ? date : '', specialty: id('specialty') }
}

export function bookingUrl(values = {}) {
  const sanitized = bookingIntent(new URLSearchParams(values).toString())
  const query = new URLSearchParams(Object.entries(sanitized).filter(([, value]) => value))
  return `/appointments${query.size ? `?${query}` : ''}`
}
