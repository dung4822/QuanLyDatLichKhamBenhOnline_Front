import { api } from '../../../lib/apiClient.js'

// Danh sách/tạo/xóa: Admin, Receptionist. Bệnh nhân chỉ đọc/sửa hồ sơ của mình (qua /me/profile).
export const getPatients = (options) => api.get('/patients', options)
export const getPatient = (patientId, options) => api.get(`/patients/${patientId}`, options)
export const createPatient = (patient) => api.post('/patients', patient)
export const updatePatient = (patientId, patient) => api.put(`/patients/${patientId}`, patient)
export const deletePatient = (patientId) => api.delete(`/patients/${patientId}`)
