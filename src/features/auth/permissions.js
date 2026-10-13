import { bookingUrl } from '../appointments/bookingIntent.js'

export const roleLabels = { Patient: 'Bệnh nhân', Doctor: 'Bác sĩ', Receptionist: 'Lễ tân', Admin: 'Quản trị viên' }
export const isStaff = (role) => ['Admin', 'Receptionist'].includes(role)
export const canBook = (role) => ['Patient', 'Admin', 'Receptionist'].includes(role)
export const canUseAssistant = (role) => role === 'Patient'
export const defaultDestination = (role) => isStaff(role) ? '/admin/appointments' : '/me/appointments'
export function canVisit(path, role) {
  if (path === '/appointments') return canBook(role)
  if (path === '/me/appointments') return ['Patient', 'Doctor'].includes(role)
  // POST /api/chats chỉ cho phép vai trò Patient.
  if (path === '/me/assistant') return canUseAssistant(role)
  if (path.startsWith('/me/')) return Boolean(roleLabels[role])
  if (['/admin/appointments', '/admin/patients'].includes(path)) return isStaff(role)
  if (path.startsWith('/admin/')) return role === 'Admin'
  return true
}
export function loginDestination(value, role) {
  // Only known local routes can be used as post-login destinations.
  const paths = ['/appointments', '/me/profile', '/me/security', '/me/appointments', '/me/assistant', '/admin/appointments', '/admin/patients', '/admin/accounts', '/admin/doctors', '/admin/specialties', '/admin/appointment-slots', '/admin/shift-schedules', '/admin/non-working-days']
  const [path, query] = (value || '').split('?')
  if (!paths.includes(path) || !canVisit(path, role)) return defaultDestination(role)
  return path === '/appointments' ? bookingUrl(Object.fromEntries(new URLSearchParams(query))) : path
}
export function permittedAppointmentActions(actions, role) {
  return actions.filter((action) => action === 'cancel' ? canBook(role) : ['Admin', 'Receptionist', 'Doctor'].includes(role))
}
