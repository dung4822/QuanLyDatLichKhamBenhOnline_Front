export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export const DAY_LABELS = {
  Monday: 'Thứ Hai',
  Tuesday: 'Thứ Ba',
  Wednesday: 'Thứ Tư',
  Thursday: 'Thứ Năm',
  Friday: 'Thứ Sáu',
  Saturday: 'Thứ Bảy',
  Sunday: 'Chủ nhật',
}

export function toInputTime(value) {
  return value ? value.slice(0, 5) : ''
}

export function toApiTime(value) {
  return /^\d{2}:\d{2}$/.test(value) ? `${value}:00` : value
}

export function formatShiftTime(startTime, endTime) {
  return `${toInputTime(startTime)}–${toInputTime(endTime)}`
}
