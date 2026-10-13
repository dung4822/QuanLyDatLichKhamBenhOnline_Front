import { ApiError, api } from '../../../lib/apiClient.js'

// Công khai: khách cũng xem được khung giờ trống.
export async function getAppointmentSlots(doctorId, date, signal) {
  const data = await api.get(`/doctors/${doctorId}/appointment-slots`, { query: { fromDate: date, toDate: date }, signal })
  if (!Array.isArray(data)) throw new ApiError(502)
  return data
}
