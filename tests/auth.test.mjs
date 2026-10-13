import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { checkSessionExpiry, clearSession, getSession, setSession } from '../src/lib/session.js'
import { ApiError, api, getErrorMessage, getFieldErrors } from '../src/lib/apiClient.js'
import { mockFetch, problem } from './helpers/mockApi.mjs'
import { canVisit, loginDestination, permittedAppointmentActions } from '../src/features/auth/permissions.js'
import { authError, changePassword, createAccount, getAccounts, getMyAppointments, login, logout, register, restoreSession, saveMyProfile, updateAccountAccess } from '../src/features/auth/api.js'
import { getAppointmentHistory } from '../src/features/appointments/api/appointmentsApi.js'
import { bookingIntent, bookingUrl } from '../src/features/appointments/bookingIntent.js'

const account = { userAccountId: 'test-patient', email: 'patient@example.test', displayName: 'Test patient', role: 'Patient', isActive: true, patientId: 12, doctorId: null }
const profile = { account, patient: { patientId: 12, fullName: 'Test patient' }, doctor: null }
const expiry = () => new Date(Date.now() + 3_600_000).toISOString()
const signedIn = () => setSession(profile, expiry())
afterEach(clearSession)

test('each role can access exactly its protected areas and actions', () => {
  for (const role of ['Patient', 'Doctor', 'Receptionist', 'Admin']) {
    assert.equal(canVisit('/admin/accounts', role), role === 'Admin')
    assert.equal(canVisit('/admin/shift-schedules', role), role === 'Admin')
    assert.equal(canVisit('/admin/patients', role), ['Admin', 'Receptionist'].includes(role))
    assert.equal(canVisit('/appointments', role), role !== 'Doctor')
    assert.equal(canVisit('/me/appointments', role), ['Patient', 'Doctor'].includes(role))
    assert.equal(canVisit('/me/profile', role), true)
  }
  assert.deepEqual(permittedAppointmentActions(['cancel', 'complete', 'no-show'], 'Patient'), ['cancel'])
  assert.deepEqual(permittedAppointmentActions(['cancel', 'complete', 'no-show'], 'Doctor'), ['complete', 'no-show'])
  assert.deepEqual(permittedAppointmentActions(['cancel', 'complete'], undefined), [])
})

test('login destination rejects external URLs and unauthorized internal paths', () => {
  for (const path of ['https://example.test', '//example.test', '/admin/accounts', '/\\example.test', '/unknown']) assert.equal(loginDestination(path, 'Patient'), '/me/appointments')
  assert.equal(loginDestination('/appointments', 'Patient'), '/appointments')
  assert.equal(loginDestination('/appointments', 'Doctor'), '/me/appointments')
})

test('booking intent survives login while discarding patient IDs, tokens and invalid values', () => {
  assert.equal(loginDestination('/appointments?doctor=5&date=2028-02-29&slot=12&patientId=99&accessToken=secret', 'Patient'), '/appointments?doctor=5&slot=12&date=2028-02-29')
  assert.equal(loginDestination('/appointments?doctor=5', 'Doctor'), '/me/appointments')
  assert.equal(bookingUrl({ doctor: 5, date: '2028-02-29', slot: 12, patientId: 99 }), '/appointments?doctor=5&slot=12&date=2028-02-29')
  assert.deepEqual(bookingIntent('doctor=-1&slot=9999999999&date=2026-02-31'), { doctor: '', slot: '', date: '', specialty: '' })
  assert.equal(bookingUrl({ specialty: 3 }), '/appointments?specialty=3')
  assert.deepEqual(bookingIntent('doctor=5&slot=abc&date=not-a-date'), { doctor: '5', slot: '', date: '', specialty: '' })
})

test('login uses the cookie session, sends CSRF and verifies the profile before publishing it', async (t) => {
  const calls = mockFetch(t, async (url) => {
    assert.equal(getSession().profile, null)
    return Response.json(url.endsWith('/login') ? { expiresAt: expiry(), account: { ...account, role: 'Admin' } } : profile)
  })
  assert.equal((await login(' PATIENT@example.test ', 'Test-only-password')).role, 'Patient')
  const [loginCall, profileCall] = calls
  assert.equal(loginCall.url, '/api/auth/login')
  assert.equal(loginCall.method, 'POST')
  assert.equal(loginCall.credentials, 'include')
  assert.equal(loginCall.headers.has('Authorization'), false)
  assert.match(loginCall.headers.get('X-CSRF-TOKEN'), /^test-csrf-token/)
  assert.equal(JSON.parse(loginCall.body).email, 'PATIENT@example.test')
  assert.equal(profileCall.url, '/api/me/profile')
  assert.equal(profileCall.credentials, 'include')
  assert.equal(profileCall.headers.has('Authorization'), false)
  assert.deepEqual(getSession().profile, profile)
  assert.equal(getSession().status, 'authenticated')
})

test('CSRF token is fetched again after the identity changes', async (t) => {
  const calls = mockFetch(t, async (url) => url.endsWith('/login') ? Response.json({ expiresAt: expiry(), account }) : url.endsWith('/me/profile') ? Response.json(profile) : new Response(null, { status: 204 }))
  await login(account.email, 'Test-only-password')
  await api.delete('/doctors/1')
  assert.equal(calls.csrfRequests, 2)
  assert.notEqual(calls[0].headers.get('X-CSRF-TOKEN'), calls[2].headers.get('X-CSRF-TOKEN'))
  await api.delete('/doctors/2')
  assert.equal(calls.csrfRequests, 2, 'token is reused while the identity is unchanged')
})

test('a rejected CSRF token is refreshed and the request retried once', async (t) => {
  signedIn()
  const calls = mockFetch(t, async (url, options, all) => all.length === 1
    ? problem(400, { detail: 'CSRF token không hợp lệ. Gọi GET /api/auth/csrf rồi gửi requestToken trong header X-CSRF-TOKEN.' })
    : Response.json({ specialtyId: 1 }))
  assert.deepEqual(await api.post('/specialties', { name: 'Nhi' }), { specialtyId: 1 })
  assert.equal(calls.length, 2)
  assert.equal(calls.csrfRequests, 2)
  assert.equal(calls[1].body, calls[0].body)
})

test('a CSRF failure after retry shows a reload hint instead of technical details', async (t) => {
  signedIn()
  mockFetch(t, async () => problem(400, { detail: 'CSRF token không hợp lệ.' }))
  await assert.rejects(api.post('/specialties', {}), (error) => error.status === 400 && /tải lại trang/.test(getErrorMessage(error)))
})

test('missing verified profile or inactive account cannot create a session', async (t) => {
  mockFetch(t, async (url) => Response.json(url.endsWith('/login') ? { expiresAt: expiry(), account } : { account: { ...account, isActive: false }, patient: null }))
  await assert.rejects(login('a@example.test', 'Test-only-password'))
  assert.equal(getSession().profile, null)
})

test('registration sends the nested profile and does not auto-login', async (t) => {
  const payload = { email: account.email, password: 'Test-only-password', profile: { fullName: 'Test user', gender: 0 } }
  mockFetch(t, async (url, options) => {
    assert.equal(url, '/api/auth/register')
    assert.deepEqual(JSON.parse(options.body), payload)
    assert.equal(options.headers.has('Authorization'), false)
    return Response.json(account, { status: 201 })
  })
  await register(payload)
  assert.equal(getSession().profile, null)
})

test('multipart uploads keep the browser boundary and disable personal response caching', async (t) => {
  signedIn()
  mockFetch(t, async (url, options) => {
    assert.equal(options.headers.has('Content-Type'), false)
    assert.ok(options.headers.get('X-CSRF-TOKEN'))
    assert.equal(options.cache, 'no-store')
    return new Response(null, { status: 204 })
  })
  await api.postForm('/doctors', new FormData())
})

test('expired sessions and current 401 responses clear personal state', async (t) => {
  setSession(profile, new Date(Date.now() - 1).toISOString())
  checkSessionExpiry()
  assert.equal(getSession().profile, null)
  signedIn()
  mockFetch(t, async () => problem(401))
  await assert.rejects(api.get('/me/profile'), { status: 401 })
  assert.equal(getSession().profile, null)
  assert.match(getSession().reason, /đăng nhập lại/)
})

test('a wrong current password keeps the session and shows the server message', async (t) => {
  signedIn()
  mockFetch(t, async () => problem(401, { detail: 'Mật khẩu hiện tại không đúng.' }))
  await assert.rejects(changePassword({ currentPassword: 'wrong', newPassword: 'Test-only-new-password' }), (error) => authError(error, 'password') === 'Mật khẩu hiện tại không đúng.')
  assert.ok(getSession().profile)
})

test('ProblemDetails are mapped to messages and form fields', () => {
  const validation = new ApiError(400, { detail: 'Validation failed: -- Name: ...', errors: { Name: ['Tên là bắt buộc.'], 'Profile.FullName': ['Họ tên quá ngắn.'], 'Avatar.Length': ['Ảnh quá lớn.'], '$.status': ['Sai định dạng.'], Other: ['Lỗi khác.'] } })
  assert.deepEqual(getFieldErrors(validation, ['name', 'fullName', 'avatar', 'status']), { fields: { name: 'Tên là bắt buộc.', fullName: 'Họ tên quá ngắn.', avatar: 'Ảnh quá lớn.', status: 'Sai định dạng.' }, others: ['Lỗi khác.'] })
  assert.doesNotMatch(getErrorMessage(validation), /Validation failed/)
  assert.equal(getErrorMessage(validation, { 400: 'Kiểm tra lại biểu mẫu.' }), 'Kiểm tra lại biểu mẫu.')
  assert.equal(getErrorMessage(new ApiError(409, { detail: 'Chuyên khoa còn lịch hẹn.', errors: {} }), { 409: 'Xung đột.' }), 'Chuyên khoa còn lịch hẹn.')
  assert.equal(getErrorMessage(new ApiError(404, { title: 'Không tìm thấy dữ liệu.', detail: null, errors: {} }), { 404: 'Bác sĩ đã bị xóa.' }), 'Bác sĩ đã bị xóa.')
  assert.equal(getErrorMessage(new ApiError(500, { detail: 'Đã xảy ra lỗi khi xử lý yêu cầu.', errors: {} }), { 500: 'Không lưu được.' }), 'Không lưu được.')
  assert.match(getErrorMessage(new ApiError(0)), /kết nối/)
})

test('late responses from a previous account cannot replace or revoke the next session', async (t) => {
  signedIn()
  let resolve
  mockFetch(t, () => new Promise((done) => { resolve = done }))
  const request = api.get('/me/profile')
  while (!resolve) await new Promise((done) => setTimeout(done, 0))
  setSession({ account: { ...account, userAccountId: 'different-user' } }, expiry())
  resolve(problem(401))
  await assert.rejects(request, { name: 'AbortError' })
  assert.equal(getSession().profile.account.userAccountId, 'different-user')
})

test('delayed profile response body cannot update a different account', async (t) => {
  signedIn()
  let resolve
  mockFetch(t, async () => ({ ok: true, status: 200, text: () => new Promise((done) => { resolve = done }) }))
  const request = saveMyProfile({ fullName: 'Updated old user' })
  while (!resolve) await new Promise((done) => setTimeout(done, 0))
  setSession({ account: { ...account, userAccountId: 'different-user' } }, expiry())
  resolve(JSON.stringify({ patientId: 12, fullName: 'Updated old user' }))
  await assert.rejects(request, { name: 'AbortError' })
  assert.equal(getSession().profile.patient, undefined)
})

test('403 leaves the session intact and returns a useful access message', async (t) => {
  signedIn()
  mockFetch(t, async () => problem(403, { detail: 'Bạn không có quyền thực hiện thao tác này.' }))
  await assert.rejects(getAccounts({ page: 1 }), (error) => error.status === 403 && /quyền/.test(authError(error)))
  assert.ok(getSession().profile)
})

test('logout and change password accept 204 and remove all local personal state', async (t) => {
  const calls = mockFetch(t, async () => new Response(null, { status: 204 }))
  signedIn(); await logout(); assert.equal(getSession().profile, null)
  signedIn(); await changePassword({ currentPassword: 'Test-only-current', newPassword: 'Test-only-new-password' })
  assert.equal(getSession().profile, null)
  assert.equal(calls[0].url, '/api/auth/logout')
  assert.equal(calls[1].url, '/api/auth/change-password')
  for (const call of calls) assert.ok(call.headers.get('X-CSRF-TOKEN'))
  assert.deepEqual(JSON.parse(calls[1].body), { currentPassword: 'Test-only-current', newPassword: 'Test-only-new-password' })
})

test('accounts and history are paginated arrays; personal appointments use page DTO', async (t) => {
  signedIn()
  mockFetch(t, async (url) => {
    if (url.startsWith('/api/me/appointments')) {
      assert.match(url, /status=Completed/)
      assert.doesNotMatch(url, /patientId/)
      return Response.json({ items: [], totalCount: 0 })
    }
    assert.match(url, /page=2/)
    return Response.json([])
  })
  assert.deepEqual(await getAccounts({ page: 2, pageSize: 20 }), [])
  assert.deepEqual(await getAppointmentHistory(42, 2), [])
  assert.deepEqual(await getMyAppointments({ status: 'Completed', patientId: '', page: 1 }), { items: [], totalCount: 0 })
})

test('access update sends the full replacement including explicit null links', async (t) => {
  signedIn()
  mockFetch(t, async (url, options) => {
    assert.equal(url, '/api/accounts/test-account/access')
    assert.equal(options.method, 'PUT')
    assert.deepEqual(JSON.parse(options.body), { role: 'Receptionist', patientId: null, doctorId: null, isActive: false })
    return Response.json(account)
  })
  await updateAccountAccess('test-account', { role: 'Receptionist', patientId: null, doctorId: null, isActive: false })
})

test('creating a linked account preserves server 409 and does not automatically retry', async (t) => {
  let calls = 0
  mockFetch(t, async () => { calls++; return problem(409, { detail: 'Hồ sơ đã liên kết.' }) })
  await assert.rejects(createAccount({ role: 'Patient', patientId: 12, doctorId: null }), (error) => error.status === 409 && authError(error) === 'Hồ sơ đã liên kết.')
  assert.equal(calls, 1)
})

test('429, network failure and invalid JSON retain actionable errors', async (t) => {
  mockFetch(t, async () => new Response(null, { status: 429 }))
  await assert.rejects(login(account.email, 'test'), (error) => /một phút/.test(authError(error)))
  mockFetch(t, async () => { throw new TypeError('Network error') })
  await assert.rejects(login(account.email, 'test'), (error) => error.status === 0)
  mockFetch(t, async () => new Response('<html>fallback</html>'))
  await assert.rejects(login(account.email, 'test'), (error) => error.status === 502)
})
