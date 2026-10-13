import { api } from '../../../lib/apiClient.js'

// GET công khai. Tạo/sửa dùng multipart/form-data vì có ảnh đại diện (field `avatar`, `removeAvatar`).
export const getDoctors = (specialtyId, options) => api.get('/doctors', { ...options, query: { specialtyId } })
export const getDoctor = (doctorId, options) => api.get(`/doctors/${doctorId}`, options)
export const createDoctor = (formData) => api.postForm('/doctors', formData)
export const updateDoctor = (doctorId, formData) => api.putForm(`/doctors/${doctorId}`, formData)
export const deleteDoctor = (doctorId) => api.delete(`/doctors/${doctorId}`)
