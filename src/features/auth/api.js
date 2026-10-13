import { ApiError, api, getErrorMessage, resetCsrfToken } from '../../lib/apiClient.js'
import { clearSession, getSession, setSession, updateSessionProfile } from '../../lib/session.js'
import { roleLabels } from './permissions.js'

// Hồ sơ phải nhất quán với vai trò trước khi được dùng làm danh tính phía client.
function isValidProfile(profile) {
  const account = profile?.account
  if (!account?.userAccountId || !roleLabels[account.role] || !account.isActive) return false
  if (account.role === 'Patient') return profile.patient?.patientId === account.patientId
  if (account.role === 'Doctor') return profile.doctor?.doctorId === account.doctorId
  return true
}

// Backend trả DateTime UTC; nếu thiếu hậu tố múi giờ thì coi là UTC để không lệch theo máy người dùng.
const asUtc = (value) => (typeof value === 'string' && !/(Z|[+-]\d{2}:\d{2})$/.test(value) ? `${value}Z` : value)

export async function login(email, password) {
  const data = await api.post('/auth/login', { email: email.trim(), password })
  const expiresAt = asUtc(data?.expiresAt)
  if (!data?.account?.userAccountId || !(Date.parse(expiresAt) > Date.now())) throw new ApiError(502)
  // Server vừa đổi cookie đăng nhập: CSRF token cũ gắn với "khách" không còn dùng được.
  resetCsrfToken()
  const profile = await api.get('/me/profile')
  if (!isValidProfile(profile)) throw new ApiError(502)
  setSession(profile, expiresAt)
  return profile.account
}

// Khi tải lại trang, cookie HttpOnly vẫn còn: hỏi server để khôi phục phiên.
let restoring = null
export function restoreSession() {
  if (getSession().status !== 'unknown') return Promise.resolve()
  restoring ??= api.get('/me/profile')
    .then((profile) => {
      if (getSession().status !== 'unknown') return
      if (isValidProfile(profile)) setSession(profile)
      else clearSession()
    })
    .catch(() => {
      // Người dùng có thể đã đăng nhập xong trong lúc chờ; khi đó giữ nguyên phiên mới.
      if (getSession().status === 'unknown') clearSession()
    })
    .finally(() => { restoring = null })
  return restoring
}

// Đăng ký không tự đăng nhập; trả AccountDto.
export const register = (body) => api.post('/auth/register', body)

export async function logout() {
  try {
    await api.post('/auth/logout')
  } catch (error) {
    // 401: phiên trên server đã hết từ trước, vẫn dọn trạng thái ở trình duyệt.
    if (error?.status !== 401) throw error
  }
  clearSession()
}

export async function changePassword(body) {
  // Sai mật khẩu hiện tại cũng trả 401, nhưng phiên vẫn còn hiệu lực.
  await api.post('/auth/change-password', body, { keepSessionOn401: true })
  clearSession('Đã đổi mật khẩu. Vui lòng đăng nhập lại bằng mật khẩu mới.')
}

export async function saveMyProfile(body) {
  const patient = await api.put('/me/profile', body)
  const current = getSession().profile
  if (current) updateSessionProfile({ ...current, patient })
  return patient
}

// Hồ sơ vừa được đổi ở nơi khác (VD xác nhận thẻ "Cập nhật hồ sơ" của trợ lý): tải lại cho header/trang hồ sơ.
export async function refreshMyProfile() {
  const profile = await api.get('/me/profile')
  const current = getSession().profile
  if (current && isValidProfile(profile) && profile.account.userAccountId === current.account.userAccountId) updateSessionProfile({ ...current, ...profile })
  return profile
}

async function getPage(path, filters, signal) {
  const data = await api.get(path, { query: filters, signal })
  if (!Array.isArray(data?.items) || !Number.isInteger(data.totalCount) || data.totalCount < 0) throw new ApiError(502)
  return data
}
export const getMyAppointments = (filters, signal) => getPage('/me/appointments', filters, signal)

export async function getAccounts(filters, signal) {
  const data = await api.get('/accounts', { query: filters, signal })
  if (!Array.isArray(data)) throw new ApiError(502)
  return data
}
export const createAccount = (body) => api.post('/accounts', body)
export const updateAccountAccess = (id, body) => api.put(`/accounts/${id}/access`, body)

export function authError(error, context = '') {
  const unauthorized = {
    login: 'Email hoặc mật khẩu chưa đúng, hoặc tài khoản tạm thời bị khóa. Vui lòng kiểm tra và thử lại sau.',
    password: 'Mật khẩu hiện tại chưa đúng hoặc phiên đăng nhập đã hết hạn.',
  }[context]
  return getErrorMessage(error, {
    401: unauthorized,
    404: 'Không tìm thấy thông tin hoặc bạn không có quyền xem dữ liệu này.',
    409: 'Email hoặc hồ sơ đã được liên kết với tài khoản khác. Vui lòng kiểm tra lại.',
  })
}
