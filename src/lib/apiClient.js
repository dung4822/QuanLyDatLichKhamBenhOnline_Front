import { clearSession, getSession } from './session.js'

// Nơi DUY NHẤT gọi HTTP tới backend. Các file api/*.js của từng feature chỉ khai báo URL và dữ liệu.
//
// Hợp đồng với backend (WebDatLichKhamBenh.Api):
// - Đăng nhập bằng cookie HttpOnly: luôn gửi `credentials: 'include'`, không có Authorization header.
// - Chống CSRF: POST/PUT/PATCH/DELETE phải kèm header X-CSRF-TOKEN lấy từ GET /api/auth/csrf.
//   Token gắn với danh tính hiện tại nên phải lấy lại sau khi đăng nhập/đăng xuất.
// - Thành công: body là dữ liệu trực tiếp (DTO, mảng, hoặc rỗng với 204).
// - Lỗi: ProblemDetails (RFC 9457) { type, title, status, detail, traceId, errors? }.
//   `errors` chỉ có ở lỗi 400 validation, dạng { "TênField": ["message", ...] }.
export const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const SESSION_REVOKED = 'Phiên đăng nhập không còn hiệu lực. Vui lòng đăng nhập lại.'

const DEFAULT_MESSAGES = {
  0: 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại.',
  400: 'Thông tin chưa hợp lệ. Vui lòng kiểm tra và thử lại.',
  401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  403: 'Tài khoản của bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu hoặc dữ liệu đã bị xóa.',
  409: 'Dữ liệu đã thay đổi. Vui lòng tải lại và thử lại.',
  413: 'Dữ liệu gửi lên quá lớn.',
  429: 'Bạn thao tác quá nhanh. Vui lòng chờ một phút rồi thử lại.',
  500: 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.',
}
const CSRF_MESSAGE = 'Phiên làm việc đã thay đổi. Vui lòng tải lại trang rồi thử lại.'

export class ApiError extends Error {
  constructor(status, problem = null, { retryAfter = null } = {}) {
    super(problem?.detail || problem?.title || defaultMessage(status))
    this.name = 'ApiError'
    this.status = status
    // ProblemDetails đã được chuẩn hóa (xem toProblem); null khi không có body hợp lệ.
    this.problem = problem
    this.retryAfter = retryAfter
  }
}

function defaultMessage(status) {
  return DEFAULT_MESSAGES[status] || (status >= 500 ? DEFAULT_MESSAGES[500] : 'Không thể xử lý yêu cầu. Vui lòng thử lại.')
}

// Chỉ giữ các field đúng kiểu để component không phải tự kiểm tra từng chỗ.
function toProblem(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const errors = {}
  if (data.errors && typeof data.errors === 'object') {
    for (const [key, value] of Object.entries(data.errors)) {
      const messages = (Array.isArray(value) ? value : [value]).filter((item) => typeof item === 'string' && item)
      if (messages.length) errors[key] = messages
    }
  }
  const text = (value) => (typeof value === 'string' && value.trim() ? value : null)
  return { title: text(data.title), detail: text(data.detail), traceId: text(data.traceId), errors }
}

const isCsrfFailure = (status, problem) =>
  status === 400 && !Object.keys(problem?.errors || {}).length && /csrf/i.test(problem?.detail || '')

async function readJson(response) {
  const text = await response.text()
  if (!text) return { ok: true, data: null }
  try {
    return { ok: true, data: JSON.parse(text) }
  } catch {
    return { ok: false, data: null }
  }
}

// ---- CSRF token ----------------------------------------------------------------------------
// Giữ trong bộ nhớ, gắn với `version` của session: danh tính đổi thì token cũ tự bị bỏ.
let csrf = { version: -1, token: null, pending: null }

function fetchCsrfToken() {
  const { version } = getSession()
  if (csrf.version === version && csrf.token) return Promise.resolve(csrf.token)
  if (csrf.version === version && csrf.pending) return csrf.pending

  const pending = fetch(`${API_BASE_URL}/auth/csrf`, {
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  }).then(async (response) => {
    const { data } = await readJson(response)
    if (!response.ok) throw new ApiError(response.status, toProblem(data))
    if (typeof data?.requestToken !== 'string' || !data.requestToken) throw new ApiError(502)
    return data.requestToken
  }, () => {
    throw new ApiError(0)
  })

  csrf = { version, token: null, pending }
  pending.then(
    (token) => { if (csrf.pending === pending) csrf = { version, token, pending: null } },
    () => { if (csrf.pending === pending) csrf = { version: -1, token: null, pending: null } },
  )
  return pending
}

export function resetCsrfToken() {
  csrf = { version: -1, token: null, pending: null }
}

// ---- Request -------------------------------------------------------------------------------
export function toQueryString(params = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== null && value !== undefined) query.set(key, value)
  }
  const text = query.toString()
  return text ? `?${text}` : ''
}

/**
 * Gửi request tới API.
 * - `json`: object sẽ được JSON.stringify và đặt Content-Type.
 * - `body`: dùng cho FormData (không tự đặt Content-Type để trình duyệt thêm boundary).
 * - `query`: object tham số; giá trị rỗng/null bị bỏ qua.
 * - `keepSessionOn401`: 401 là lỗi nghiệp vụ (VD sai mật khẩu hiện tại), không phải mất phiên.
 * Trả về body đã parse (null với 204). Ném ApiError khi lỗi, hoặc AbortError khi bị hủy/danh tính đổi.
 */
export async function apiRequest(path, { method = 'GET', json, body, query, signal, keepSessionOn401 = false } = {}) {
  const upperMethod = method.toUpperCase()
  const needsCsrf = !SAFE_METHODS.has(upperMethod)
  const url = `${API_BASE_URL}${path}${query ? toQueryString(query) : ''}`
  const version = getSession().version
  const assertSameIdentity = () => {
    // Bỏ qua response của danh tính trước đó, kể cả 401 đến trễ sau khi đã đăng nhập lại.
    if (version !== getSession().version) throw new DOMException('Session changed', 'AbortError')
  }

  for (let attempt = 0; ; attempt += 1) {
    const headers = new Headers({ Accept: 'application/json' })
    let payload = body
    if (json !== undefined) {
      headers.set('Content-Type', 'application/json')
      payload = JSON.stringify(json)
    }
    if (needsCsrf) headers.set('X-CSRF-TOKEN', await fetchCsrfToken())

    let response
    try {
      response = await fetch(url, { method: upperMethod, headers, body: payload, signal, credentials: 'include', cache: 'no-store' })
    } catch (error) {
      if (error?.name === 'AbortError') throw error
      throw new ApiError(0)
    }
    assertSameIdentity()
    const parsed = await readJson(response)
    assertSameIdentity()

    if (response.ok) {
      if (!parsed.ok) throw new ApiError(502, { title: null, detail: 'Máy chủ trả về dữ liệu không hợp lệ.', traceId: null, errors: {} })
      return parsed.data
    }

    const problem = toProblem(parsed.data)
    if (needsCsrf && attempt === 0 && isCsrfFailure(response.status, problem)) {
      // Token hết hạn hoặc tab khác vừa đổi tài khoản: lấy token mới và thử lại đúng một lần.
      resetCsrfToken()
      continue
    }
    if (response.status === 401 && !keepSessionOn401 && getSession().profile) clearSession(SESSION_REVOKED)
    throw new ApiError(response.status, problem, { retryAfter: response.headers.get('Retry-After') })
  }
}

export const api = {
  get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, json, options) => apiRequest(path, { ...options, method: 'POST', json }),
  put: (path, json, options) => apiRequest(path, { ...options, method: 'PUT', json }),
  patch: (path, json, options) => apiRequest(path, { ...options, method: 'PATCH', json }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
  postForm: (path, formData, options) => apiRequest(path, { ...options, method: 'POST', body: formData }),
  putForm: (path, formData, options) => apiRequest(path, { ...options, method: 'PUT', body: formData }),
}

// ---- Hiển thị lỗi --------------------------------------------------------------------------
export function validationMessages(error) {
  return Object.values(error?.problem?.errors || {}).flat()
}

/**
 * Câu thông báo lỗi cho người dùng.
 * Thứ tự ưu tiên: lỗi theo field (400) → `detail` của server → câu riêng của màn hình theo status
 * (`messages`) → `title` của server → câu mặc định.
 * Lỗi 400 có `errors` mà màn hình đã khai báo `messages[400]` thì dùng câu đó làm tóm tắt,
 * vì từng lỗi đã được form hiển thị cạnh ô nhập.
 */
export function getErrorMessage(error, messages = {}) {
  const status = error?.status ?? 0
  const problem = error?.problem
  if (isCsrfFailure(status, problem)) return CSRF_MESSAGE
  const fieldMessages = validationMessages(error)
  if (fieldMessages.length) return messages[400] || fieldMessages.join(' ')
  // 500 luôn có detail cố định ("Đã xảy ra lỗi..."), nên câu riêng của màn hình hữu ích hơn.
  if (status === 500 && messages[500]) return messages[500]
  return problem?.detail || messages[status] || problem?.title || defaultMessage(status)
}

const normalizeKey = (key) => key.replace(/^\$\.?/, '').toLowerCase()

/**
 * Gắn lỗi validation của server vào field của form.
 * Backend trả key theo tên property C# (`FullName`, `Profile.FullName`, `Avatar.Length`, `$.name`...),
 * nên so khớp không phân biệt hoa/thường theo cả key, phần cuối, rồi phần đầu.
 * Trả về { fields: { fieldName: message }, others: [message] } với các lỗi không gắn được.
 */
export function getFieldErrors(error, fieldNames) {
  const lookup = new Map(fieldNames.map((name) => [name.toLowerCase(), name]))
  const fields = {}
  const others = []
  for (const [key, list] of Object.entries(error?.problem?.errors || {})) {
    const normalized = normalizeKey(key)
    const segments = normalized.split('.')
    const field = lookup.get(normalized) || lookup.get(segments.at(-1)) || lookup.get(segments[0])
    if (field && !fields[field]) fields[field] = list[0]
    else if (!field) others.push(...list)
  }
  return { fields, others }
}
