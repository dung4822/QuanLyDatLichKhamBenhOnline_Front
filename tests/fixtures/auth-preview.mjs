// Isolated, in-memory API fixture for manual browser QA. Never loaded by the app.
// Run npm run test:ui, then open http://127.0.0.1:5180/login.
// Users: patient, doctor, reception, admin @example.test. Password: Test-only-password
import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { createServer } from 'vite'
import { clinicDays, clinicNow } from '../../src/features/appointment-slots/utils.js'

const days = clinicDays(clinicNow().date)
const patient = { patientId: 12, fullName: 'Nguyễn Minh An', dateOfBirth: '1998-05-12', gender: 0, phoneNumber: '0901234567', email: 'minhan@example.test', address: 'Quận 3, TP. Hồ Chí Minh' }
const doctors = [{ doctorId: 5, specialtyId: 2, specialtyName: 'Nội tổng quát', fullName: 'BS. Trần Thanh Hương', experience: 12, gender: 1, email: 'doctor@example.test', phoneNumber: '0902345678' }, { doctorId: 8, specialtyId: 3, specialtyName: 'Tim mạch', fullName: 'BS. Nguyễn Đức Minh', experience: 9, gender: 0 }]
const accounts = ['Patient', 'Doctor', 'Receptionist', 'Admin'].map((role, index) => ({ userAccountId: `00000000-0000-4000-8000-00000000000${index}`, email: `${['patient', 'doctor', 'reception', 'admin'][index]}@example.test`, displayName: ['Nguyễn Minh An', 'BS. Trần Thanh Hương', 'Lê Phương Linh', 'Quản trị viên'][index], role, patientId: role === 'Patient' ? 12 : null, doctorId: role === 'Doctor' ? 5 : null, isActive: true }))
const sessions = new Map()
const visits = [{ appointmentId: 42, patientId: 12, patientFullName: patient.fullName, patientPhoneNumber: patient.phoneNumber, ...doctors[0], doctorFullName: doctors[0].fullName, appointmentSlotId: 105, date: days[1], startTime: '09:00:00', endTime: '09:30:00', reason: 'Khám sức khỏe định kỳ', status: 'Confirmed', createdAt: new Date().toISOString() }, { appointmentId: 43, patientId: 12, patientFullName: patient.fullName, patientPhoneNumber: patient.phoneNumber, doctorId: 5, doctorFullName: doctors[0].fullName, specialtyId: 2, specialtyName: 'Nội tổng quát', appointmentSlotId: 104, date: days[0], startTime: '00:01:00', endTime: '00:31:00', status: 'Confirmed', createdAt: new Date().toISOString() }]
const histories = new Map(visits.map((item) => [item.appointmentId, [{ appointmentHistoryId: item.appointmentId, appointmentId: item.appointmentId, action: 'Created', actorDisplayName: patient.fullName, actorRole: 'Patient', occurredAt: new Date().toISOString(), before: null, after: { ...item } }]]))
const chats = new Map()
const chatActions = new Map()
let chatTurnSeq = 0
const vite = await createServer({ server: { middlewareMode: true, proxy: {}, hmr: { port: 5181 } }, appType: 'spa' })
const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith('/api/')) return vite.middlewares(req, res)
  const url = new URL(req.url, 'http://127.0.0.1:5180')
  const path = url.pathname.slice(4)
  const method = req.method
  let raw = ''
  for await (const chunk of req) raw += chunk
  const body = raw ? JSON.parse(raw) : {}
  // Giống backend thật: lỗi luôn là ProblemDetails, đăng nhập bằng cookie HttpOnly, ghi dữ liệu cần X-CSRF-TOKEN.
  const send = (status, data, headers = {}) => {
    const isProblem = status >= 400
    const body = isProblem ? { type: 'about:blank', title: 'Không thể xử lý yêu cầu.', status, detail: null, traceId: randomUUID(), ...data } : data
    res.writeHead(status, { 'Content-Type': isProblem ? 'application/problem+json' : 'application/json', 'Cache-Control': 'no-store', ...headers })
    res.end(status === 204 ? undefined : JSON.stringify(body))
  }
  const cookies = Object.fromEntries((req.headers.cookie || '').split(';').map((part) => part.trim().split('=')).filter(([key]) => key))
  const sessionId = cookies['fixture.auth']
  const account = sessions.get(sessionId)
  if (path === '/auth/csrf') return send(200, { requestToken: `csrf-${sessionId || 'guest'}` })
  if (!['GET', 'HEAD'].includes(method) && req.headers['x-csrf-token'] !== `csrf-${sessionId || 'guest'}`) {
    return send(400, { title: 'Dữ liệu không hợp lệ.', detail: 'CSRF token không hợp lệ. Gọi GET /api/auth/csrf rồi gửi requestToken trong header X-CSRF-TOKEN.' })
  }
  const clearCookie = { 'Set-Cookie': 'fixture.auth=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0' }
  const staff = account && ['Admin', 'Receptionist'].includes(account.role)
  const slice = (items) => { const page = Number(url.searchParams.get('page') || 1); const size = Number(url.searchParams.get('pageSize') || 20); return items.slice((page - 1) * size, page * size) }
  if (path === '/auth/login') {
    if (body.email === 'limited@example.test') return send(429, {})
    const found = accounts.find((item) => item.email.toLowerCase() === body.email?.toLowerCase() && item.isActive)
    if (!found || body.password !== 'Test-only-password') return send(401, { detail: 'Email hoặc mật khẩu không đúng, hoặc tài khoản tạm thời không khả dụng.' })
    const token = randomUUID(); sessions.set(token, found)
    return send(200, { expiresAt: new Date(Date.now() + 8 * 3_600_000).toISOString(), account: found }, { 'Set-Cookie': `fixture.auth=${token}; HttpOnly; Path=/; SameSite=Lax` })
  }
  if (path === '/auth/register') {
    if (accounts.some((item) => item.email === body.email)) return send(409, { detail: 'Email đã được sử dụng.' })
    return send(201, { ...accounts[0], email: body.email, displayName: body.profile.fullName })
  }
  if (path === '/doctors') return send(200, doctors)
  if (path === '/specialties') return send(200, [{ specialtyId: 2, name: 'Nội tổng quát', status: 'Active' }, { specialtyId: 3, name: 'Tim mạch', status: 'Active' }])
  if (/^\/doctors\/\d+\/appointment-slots$/.test(path)) {
    const doctorId = Number(path.split('/')[2]); const date = url.searchParams.get('fromDate')
    return send(200, ['08:00:00', '08:30:00', '10:00:00', '14:00:00'].map((startTime, index) => ({ appointmentSlotId: 200 + index, doctorId, date, startTime, endTime: startTime.slice(0, 3) + (startTime.slice(3, 5) === '30' ? '59:59' : '30:00'), status: 'Available' })))
  }
  if (!account) return send(401, {})
  if (path === '/auth/logout') { sessions.delete(sessionId); return send(204, null, clearCookie) }
  if (path === '/auth/change-password') {
    if (body.currentPassword !== 'Test-only-password') return send(401, { detail: 'Mật khẩu hiện tại không đúng.' })
    for (const [token, value] of sessions) if (value.userAccountId === account.userAccountId) sessions.delete(token)
    return send(204, null, clearCookie)
  }
  if (path === '/me/profile') {
    if (method === 'PUT') { if (account.role !== 'Patient') return send(403, {}); Object.assign(patient, body); return send(200, patient) }
    return send(200, { account, patient: account.role === 'Patient' ? patient : null, doctor: account.role === 'Doctor' ? doctors[0] : null })
  }
  if (path === '/patients') return send(staff ? 200 : 403, staff ? [patient, { ...patient, patientId: 13, fullName: 'Lê Phương Mai' }] : {})
  if (path.startsWith('/accounts')) {
    if (account.role !== 'Admin') return send(403, {})
    if (method === 'GET') return send(200, slice(accounts))
    if (method === 'POST') { const created = { ...body, isActive: true, userAccountId: randomUUID() }; delete created.password; accounts.push(created); return send(201, created) }
    const found = accounts.find((item) => item.userAccountId === path.split('/')[2])
    if (!found) return send(404, {})
    if (found.role === 'Admin' && (body.role !== 'Admin' || !body.isActive) && accounts.filter((item) => item.role === 'Admin' && item.isActive).length === 1) return send(409, { detail: 'Phải giữ ít nhất một Admin đang hoạt động.' })
    Object.assign(found, body)
    for (const [token, value] of sessions) if (value.userAccountId === found.userAccountId) sessions.delete(token)
    return send(200, found)
  }
  if (path === '/me/appointments' || (path === '/appointments' && method === 'GET')) {
    if (path === '/me/appointments' && staff) return send(403, {})
    const visible = visits.filter((item) => (staff || account.role === 'Patient' && item.patientId === account.patientId || account.role === 'Doctor' && item.doctorId === account.doctorId) && (!url.searchParams.get('status') || item.status === url.searchParams.get('status')) && (!url.searchParams.get('fromDate') || item.date >= url.searchParams.get('fromDate')) && (!url.searchParams.get('toDate') || item.date <= url.searchParams.get('toDate')))
    return send(200, { items: slice(visible), totalCount: visible.length, page: Number(url.searchParams.get('page') || 1), pageSize: Number(url.searchParams.get('pageSize') || 20) })
  }
  if (path === '/appointments' && method === 'POST') {
    if (!(staff || account.role === 'Patient' && body.patientId === account.patientId)) return send(403, {})
    const created = { ...visits[0], ...body, appointmentId: visits.length + 100, startTime: '08:00:00', endTime: '08:30:00' }; visits.push(created); return send(201, created)
  }
  if (path.startsWith('/appointments/')) {
    const id = Number(path.split('/')[2]); const visit = visits.find((item) => item.appointmentId === id)
    if (!visit || !(staff || account.role === 'Patient' && visit.patientId === account.patientId || account.role === 'Doctor' && visit.doctorId === account.doctorId)) return send(404, {})
    if (path.endsWith('/history')) return send(200, slice(histories.get(id) || []))
    if (method === 'GET') return send(200, visit)
    const action = path.split('/')[3]
    const before = { ...visit }
    if (['cancel', 'reschedule'].includes(action) && account.role === 'Doctor') return send(403, {})
    if (['complete', 'no-show'].includes(action) && account.role === 'Patient') return send(403, {})
    if (action === 'reschedule') Object.assign(visit, { ...body, startTime: '08:00:00', endTime: '08:30:00' })
    else Object.assign(visit, { status: { cancel: 'Cancelled', complete: 'Completed', 'no-show': 'NoShow' }[action], cancellationReason: body.reason })
    const history = histories.get(id) || []
    history.unshift({ appointmentHistoryId: Date.now(), appointmentId: id, action: { reschedule: 'Rescheduled', cancel: 'Cancelled', complete: 'Completed', 'no-show': 'NoShow' }[action], actorDisplayName: account.displayName, actorRole: account.role, occurredAt: new Date().toISOString(), before, after: { ...visit } })
    histories.set(id, history)
    return send(200, visit)
  }
  if (path.startsWith('/chats')) {
    // Phản hồi soạn sẵn theo hợp đồng CHATS_API.md (phiên + thẻ xác nhận), không gọi LLM thật.
    if (account.role !== 'Patient') return send(403, { detail: 'Bạn không có quyền thực hiện thao tác này.' })
    const now = () => new Date().toISOString()
    const mine = (chat) => chat && chat.owner === account.userAccountId
    const sessionView = ({ chatSessionId, title, createdAt, updatedAt }) => ({ chatSessionId, title, createdAt, updatedAt })
    if (path === '/chats/sessions' && method === 'POST') {
      const chat = { chatSessionId: randomUUID(), owner: account.userAccountId, title: 'Cuộc trò chuyện mới', createdAt: now(), updatedAt: now(), turns: [] }
      chats.set(chat.chatSessionId, chat)
      return send(201, sessionView(chat))
    }
    if (path === '/chats/sessions' && method === 'GET') return send(200, [...chats.values()].filter(mine).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 20).map(sessionView))
    const sessionMatch = path.match(/^\/chats\/sessions\/([^/]+)(\/messages)?$/)
    if (sessionMatch) {
      const chat = chats.get(sessionMatch[1])
      if (!mine(chat)) return send(404, { detail: 'Không tìm thấy cuộc trò chuyện.' })
      const actionOf = (turn) => (turn.actionId ? chatActions.get(turn.actionId) : null)
      if (!sessionMatch[2]) return send(200, { session: sessionView(chat), turns: chat.turns.slice(-50).map(({ actionId, sources, ...turn }) => ({ ...turn, action: actionOf({ actionId }) })) })
      const replay = chat.turns.find((turn) => turn.clientMessageId === body.clientMessageId)
      if (replay) return send(200, { chatSessionId: chat.chatSessionId, chatTurnId: replay.chatTurnId, reply: replay.reply, action: actionOf(replay), sources: replay.sources })
      if (body.message.includes('lỗi')) return send(502, { detail: 'Trợ lý phản hồi quá thời gian chờ 60 giây. Vui lòng thử lại.' })
      const text = body.message.toLowerCase()
      const visit = visits.find((item) => item.patientId === account.patientId && item.status === 'Confirmed')
      const doctor = doctors[0]
      const kind = /hủy/.test(text) ? 'CancelAppointment' : /đổi/.test(text) ? 'RescheduleAppointment' : /đặt/.test(text) ? 'BookAppointment' : null
      let action = null
      if (kind) {
        for (const item of chatActions.values()) if (item.sessionId === chat.chatSessionId && item.status === 'Pending') item.status = 'Superseded'
        const details = {
          BookAppointment: [['Bác sĩ', null, doctor.fullName], ['Chuyên khoa', null, 'Nội tổng quát'], ['Ngày khám', null, days[1]], ['Giờ khám', null, '09:00 - 09:30'], ['Lý do khám', null, /bận/.test(text) ? 'Thử slot vừa bị đặt' : 'Đau đầu']],
          CancelAppointment: [['Bác sĩ', null, doctor.fullName], ['Ngày khám', null, visit?.date || days[1]], ['Giờ khám', null, '08:00 - 08:30'], ['Lý do hủy', null, 'Bận việc đột xuất']],
          RescheduleAppointment: [['Bác sĩ', null, doctor.fullName], ['Ngày khám', visit?.date || days[1], days[2]], ['Giờ khám', '08:00 - 08:30', '10:00 - 10:30']],
        }[kind].map(([label, before, value]) => ({ label, before, value }))
        action = { chatActionId: randomUUID(), sessionId: chat.chatSessionId, type: kind, status: 'Pending', title: { BookAppointment: 'Đặt lịch khám', CancelAppointment: 'Hủy lịch khám', RescheduleAppointment: 'Đổi lịch khám' }[kind], details, expiresAt: new Date(Date.now() + (/nhanh/.test(text) ? 15_000 : 600_000)).toISOString(), completedAt: null, failureReason: null, failOnConfirm: /bận/.test(text) }
        chatActions.set(action.chatActionId, action)
      }
      const reply = kind
        ? 'Mình đã chuẩn bị thẻ bên dưới. Bạn kiểm tra thông tin rồi bấm **Xác nhận** để thực hiện nhé.'
        : 'Phòng khám hiện có **2 chuyên khoa** đang hoạt động:\n1. Nội tổng quát\n2. Tim mạch\n\nBạn muốn đặt lịch với chuyên khoa nào?'
      const sources = kind ? [] : [{ tool: 'get_specialties', data: { items: [{ specialtyId: 2, name: 'Nội tổng quát' }, { specialtyId: 3, name: 'Tim mạch' }], hasMore: false } }]
      const turn = { chatTurnId: ++chatTurnSeq, clientMessageId: body.clientMessageId, message: body.message, reply, createdAt: now(), actionId: action?.chatActionId || null, sources }
      chat.turns.push(turn)
      if (chat.turns.length === 1) chat.title = body.message.slice(0, 60)
      chat.updatedAt = now()
      return send(200, { chatSessionId: chat.chatSessionId, chatTurnId: turn.chatTurnId, reply, action: actionOf(turn), sources })
    }
    const actionMatch = path.match(/^\/chats\/actions\/([^/]+)\/(confirm|reject)$/)
    const action = actionMatch && chatActions.get(actionMatch[1])
    if (!action || !mine(chats.get(action.sessionId))) return send(404, { detail: 'Không tìm thấy đề xuất.' })
    const { sessionId: _session, failOnConfirm, ...view } = action
    const target = actionMatch[2] === 'confirm' ? 'Confirmed' : 'Rejected'
    if (action.status === target) return send(200, view)
    if (action.status === 'Pending' && Date.parse(action.expiresAt) <= Date.now()) action.status = 'Expired'
    if (action.status !== 'Pending') return send(409, { detail: 'Đề xuất không còn hiệu lực.' })
    if (target === 'Confirmed' && failOnConfirm) {
      Object.assign(action, { status: 'Failed', failureReason: 'Khung giờ vừa được người khác đặt. Hãy nhờ trợ lý chọn giờ khác.', completedAt: now() })
      return send(409, { detail: action.failureReason })
    }
    Object.assign(action, { status: target, completedAt: now() })
    const { sessionId: _s, failOnConfirm: _f, ...done } = action
    return send(200, done)
  }
  return send(404, { detail: 'Endpoint not included in the isolated UI fixture.' })
})
server.listen(5180, '127.0.0.1', () => console.log('Isolated UI fixture: http://127.0.0.1:5180/login (no real backend or database)'))
async function close() { server.close(); await vite.close(); process.exit() }
process.on('SIGINT', close)
process.on('SIGTERM', close)
