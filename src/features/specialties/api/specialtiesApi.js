import { api } from '../../../lib/apiClient.js'

// GET công khai (khách xem được). Ghi dữ liệu chỉ Admin.
// Status chuyên khoa là chuỗi 'Active' | 'Inactive'. DELETE là xóa mềm: chuyển sang 'Inactive'.
export const getSpecialties = (options) => api.get('/specialties', options)
export const getSpecialty = (specialtyId, options) => api.get(`/specialties/${specialtyId}`, options)
export const createSpecialty = (values) => api.post('/specialties', values)
export const updateSpecialty = (specialtyId, values) => api.put(`/specialties/${specialtyId}`, values)
export const deleteSpecialty = (specialtyId) => api.delete(`/specialties/${specialtyId}`)
