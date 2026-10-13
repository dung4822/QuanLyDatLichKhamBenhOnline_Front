import { api } from '../../../lib/apiClient.js'

// API quản trị (Admin). dayOfWeek là chuỗi enum C#: 'Monday' ... 'Sunday'; giờ dạng 'HH:mm:ss'.
export const getShifts = (options) => api.get('/shifts', options)
export const createShift = (values) => api.post('/shifts', values)
export const updateShift = (shiftId, values) => api.put(`/shifts/${shiftId}`, values)
export const deleteShift = (shiftId) => api.delete(`/shifts/${shiftId}`)

export const getDoctorShifts = (doctorId, options) => api.get(`/doctors/${doctorId}/shifts`, options)
// Gửi toàn bộ trạng thái checkbox sau khi chỉnh, không phải chỉ những ID mới tick.
export const replaceDoctorShifts = (doctorId, shiftIds) => api.put(`/doctors/${doctorId}/shifts`, { shiftIds })
