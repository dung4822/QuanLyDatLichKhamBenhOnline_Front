import { api } from '../../../lib/apiClient.js'

// API quản trị (Admin). doctorId = null nghĩa là cả bệnh viện nghỉ.
export const getNonWorkingDays = (fromDate, options) => api.get('/non-working-days', { ...options, query: { fromDate } })
export const createNonWorkingDay = (values) => api.post('/non-working-days', values)
export const updateNonWorkingDay = (nonWorkingDayId, values) => api.put(`/non-working-days/${nonWorkingDayId}`, values)
export const deleteNonWorkingDay = (nonWorkingDayId) => api.delete(`/non-working-days/${nonWorkingDayId}`)
