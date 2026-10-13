import { getErrorMessage } from '../../lib/apiClient.js'

// Clinic dates are independent of the browser's timezone.
export function clinicNow(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(now).map(({ type, value }) => [type, value]))
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}:${parts.second}` }
}

export function clinicDays(today) {
  // UTC is only used for calendar arithmetic, never to convert slot times.
  const date = new Date(`${today}T00:00:00Z`)
  return Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(date)
    day.setUTCDate(date.getUTCDate() + offset)
    return day.toISOString().slice(0, 10)
  })
}

export function dayLabel(date, options = { weekday: 'long', day: '2-digit', month: '2-digit' }) {
  return new Intl.DateTimeFormat('vi-VN', { ...options, timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
}

export function isFutureSlot(slot, now) {
  return slot.status === 'Available' && (slot.date > now.date || (slot.date === now.date && slot.startTime > now.time))
}

export function slotError(error) {
  if (error?.status === 400 && !error.problem?.detail && !Object.keys(error.problem?.errors || {}).length) {
    return 'Khoảng ngày không hợp lệ. Vui lòng chọn ngày trong 7 ngày từ hôm nay theo giờ Việt Nam.'
  }
  return getErrorMessage(error, {
    0: 'Không tải được khung giờ khám. Vui lòng kiểm tra kết nối và thử lại.',
    404: 'Bác sĩ không tồn tại hoặc đã bị xóa. Vui lòng chọn lại bác sĩ.',
    500: 'Không tải được khung giờ khám. Vui lòng thử lại sau ít phút.',
  })
}
