import { ApiError, apiRequest } from '../../../lib/apiClient.js'

// Tạo/đổi lịch là thao tác ghi quan trọng: nếu mất response (mạng rớt, 5xx, body hỏng) thì chưa biết
// server đã lưu hay chưa. Khi đó lỗi được đánh dấu `uncertain` để UI đối soát lại trước khi cho gửi tiếp.
function markUncertain(error) {
  error.uncertain = true
  return error
}

async function request(path, options = {}, { needsReceipt = false } = {}) {
  let data
  try {
    data = await apiRequest(`/appointments${path}`, options)
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    if (needsReceipt && (error.status === 0 || error.status >= 500)) markUncertain(error)
    throw error
  }
  if (needsReceipt && !data?.appointmentId) throw markUncertain(new ApiError(502))
  return data
}

export async function getAppointments(filters = {}, signal) {
  const query = {}
  for (const key of ['patientId', 'doctorId', 'specialtyId', 'fromDate', 'toDate', 'status', 'page', 'pageSize']) query[key] = filters[key]
  const data = await request('', { query, signal })
  if (!Array.isArray(data?.items) || !Number.isInteger(data.totalCount) || data.totalCount < 0) throw new ApiError(502)
  return data
}

export function getAppointment(id, signal) {
  return request(`/${id}`, { signal })
}

export function createAppointment({ patientId, appointmentSlotId, reason }) {
  const body = { patientId: Number(patientId), appointmentSlotId: Number(appointmentSlotId), reason: reason?.trim() || null }
  return request('', { method: 'POST', json: body }, { needsReceipt: true })
}

export async function rescheduleAppointment(id, appointmentSlotId) {
  const slotId = Number(appointmentSlotId)
  if (!Number.isInteger(slotId) || slotId <= 0) {
    throw new ApiError(400, { title: null, detail: 'Vui lòng chọn một khung giờ mới hợp lệ.', traceId: null, errors: {} })
  }
  const data = await request(`/${id}/reschedule`, { method: 'PATCH', json: { appointmentSlotId: slotId } }, { needsReceipt: true })
  if (data.appointmentId !== Number(id) || !data.appointmentSlotId || !data.date || !data.startTime || !data.endTime) {
    throw markUncertain(new ApiError(502))
  }
  return data
}

export function changeAppointmentStatus(id, action, reason = '') {
  if (!['cancel', 'complete', 'no-show'].includes(action)) throw new Error('Thao tác lịch hẹn không hợp lệ.')
  // Chỉ "cancel" có body (lý do hủy); complete/no-show không có body.
  const body = action === 'cancel' ? { reason: reason.trim() || null } : undefined
  return request(`/${id}/${action}`, { method: 'PATCH', json: body })
}

export async function getAppointmentHistory(id, page = 1, signal) {
  const data = await request(`/${id}/history`, { query: { page, pageSize: 10 }, signal })
  if (!Array.isArray(data)) throw new ApiError(502)
  return data
}

// Mất response của POST thì phải đối soát bằng cách đọc lại trước khi cho đặt lịch tiếp.
export async function findSubmittedAppointment({ patientId, appointmentSlotId, date }) {
  let page = 1
  let data
  do {
    data = await getAppointments({ patientId, fromDate: date, toDate: date, page, pageSize: 100 })
    const found = data.items.find((item) => item.appointmentSlotId === appointmentSlotId && item.status !== 'Cancelled')
    if (found) return found
    page += 1
  } while ((page - 1) * 100 < data.totalCount)
  return null
}
