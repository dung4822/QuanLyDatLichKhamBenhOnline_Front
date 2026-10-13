import { getErrorMessage } from '../../lib/apiClient.js'
import { clinicDays, clinicNow, isFutureSlot } from '../appointment-slots/utils.js'

export const appointmentStatuses = {
  Confirmed: { label: 'Đã xác nhận', tone: 'confirmed' },
  Completed: { label: 'Đã khám', tone: 'completed' },
  Cancelled: { label: 'Đã hủy', tone: 'cancelled' },
  NoShow: { label: 'Không đến', tone: 'no-show' },
}

export const appointmentActions = {
  cancel: { label: 'Hủy lịch hẹn', result: 'Đã hủy lịch hẹn.', description: 'Lịch hẹn sẽ được hủy. Bạn có thể ghi lại lý do bên dưới.' },
  complete: { label: 'Đánh dấu đã khám', result: 'Đã đánh dấu lịch hẹn là đã khám.', description: 'Xác nhận bệnh nhân đã hoàn tất buổi khám này.' },
  'no-show': { label: 'Đánh dấu không đến', result: 'Đã đánh dấu bệnh nhân không đến.', description: 'Xác nhận bệnh nhân không đến trong khung giờ đã hẹn.' },
}

export function allowedActions(appointment, now = clinicNow()) {
  if (appointment.status !== 'Confirmed') return []
  const current = `${now.date}T${now.time}`
  if (current < `${appointment.date}T${appointment.startTime}`) return ['cancel']
  if (current >= `${appointment.date}T${appointment.endTime}`) return ['complete', 'no-show']
  return []
}

export function canRescheduleAppointment(appointment, now = clinicNow()) {
  if (appointment?.status !== 'Confirmed') return false
  const start = Date.parse(`${appointment.date}T${appointment.startTime}+07:00`)
  const current = Date.parse(`${now.date}T${now.time}+07:00`)
  return start - current >= 2 * 60 * 60 * 1000
}

export function rescheduleRestriction(appointment, now = clinicNow()) {
  if (appointment?.status !== 'Confirmed') return 'Chỉ sửa được lịch hẹn đang ở trạng thái Đã xác nhận.'
  if (!canRescheduleAppointment(appointment, now)) return 'Không thể sửa lịch hẹn khi còn dưới 2 tiếng trước giờ khám hoặc lịch đã bắt đầu.'
  return ''
}

export function isRescheduleSlot(slot, appointment, now = clinicNow()) {
  return slot.appointmentSlotId !== appointment.appointmentSlotId
    && clinicDays(now.date).includes(slot.date) && isFutureSlot(slot, now)
}

const APPOINTMENT_MESSAGES = {
  404: 'Lịch hẹn, bệnh nhân hoặc khung giờ không còn tồn tại. Vui lòng tải lại dữ liệu.',
  409: 'Lịch hẹn hoặc khung giờ đã thay đổi. Vui lòng kiểm tra dữ liệu mới nhất.',
}

export function appointmentError(error) {
  return getErrorMessage(error, APPOINTMENT_MESSAGES)
}

export function shortDate(value) {
  if (!value) return '—'
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

export function timeRange(appointment) {
  return `${appointment.startTime.slice(0, 5)} – ${appointment.endTime.slice(0, 5)}`
}

export function timestampLabel(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' }).format(date)
}

export function validateDateRange(filters) {
  return filters.fromDate && filters.toDate && filters.toDate < filters.fromDate ? 'Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.' : ''
}
