import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

// SSR smoke tests kiểm tra render/props, không giả lập kết quả từ backend hay thao tác trình duyệt.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
after(async () => { await server.close() })

async function render(path, props = {}) {
  const { default: Component } = await server.ssrLoadModule(path)
  return renderToStaticMarkup(createElement(Component, props))
}

test('home renders one heading and all local anchors resolve', async () => {
  const html = await render('/src/features/home/page/HomePage.jsx')
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1)
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(html.includes(`id="${target}"`), `Missing section #${target}`)
  }
  assert.match(html, /href="\/appointments"/)
  assert.doesNotMatch(html, /appointments are not submitted yet/)
  // Lối tắt đặt lịch nhanh luôn có mặt, kể cả khi danh sách chuyên khoa chưa tải xong.
  assert.match(html, /<form class="hero-finder"/)
  assert.match(html, /href="\/availability"/)
  assert.doesNotMatch(html, /href="#"/)
})

test('while the cookie session is being restored, protected URLs render no personal data', async () => {
  const { default: App } = await server.ssrLoadModule('/src/App.jsx')
  const previousWindow = globalThis.window
  try {
    for (const pathname of ['/admin/appointments', '/admin/accounts', '/me/profile', '/appointments', '/login']) {
      globalThis.window = { location: { pathname } }
      const html = renderToStaticMarkup(createElement(App))
      assert.match(html, /Đang kiểm tra phiên đăng nhập/)
      assert.doesNotMatch(html, /admin-sidebar|appointment-table|accounts-table|Xác nhận đặt lịch/)
    }
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
})

test('all administration URLs require sign-in before rendering personal data', async () => {
  const { default: App } = await server.ssrLoadModule('/src/App.jsx')
  const { clearSession } = await server.ssrLoadModule('/src/lib/session.js')
  clearSession()
  const previousWindow = globalThis.window
  try {
    for (const [pathname] of [
      ['/admin/appointments', 'Quản lý lịch hẹn'],
      ['/admin/specialties', 'Chuyên khoa'],
      ['/admin/doctors', 'Bác sĩ'],
      ['/admin/patients', 'Bệnh nhân'],
      ['/admin/appointment-slots', 'Khung giờ khám'],
      ['/admin/shift-schedules', 'Ca làm việc &amp; lịch bác sĩ'],
      ['/admin/non-working-days', 'Ngày không làm việc'],
      ['/admin/doctors/', 'Bác sĩ'],
    ]) {
      globalThis.window = { location: { pathname } }
      const html = renderToStaticMarkup(createElement(App))
      assert.match(html, /<h1[^>]*>Chào mừng trở lại.<\/h1>/)
      assert.doesNotMatch(html, /admin-sidebar|appointment-table|accounts-table/)
      assert.equal((html.match(/<main[ >]/g) || []).length, 1)
    }
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
})

test('booking prompts guests to sign in and preserves their booking destination', async () => {
  const { default: App } = await server.ssrLoadModule('/src/App.jsx')
  const { clearSession } = await server.ssrLoadModule('/src/lib/session.js')
  clearSession()
  const previousWindow = globalThis.window
  try {
    globalThis.window = { location: { pathname: '/appointments' } }
    const html = renderToStaticMarkup(createElement(App))
    assert.match(html, /<h1>Chào mừng trở lại.<\/h1>/)
    assert.match(html, /next=%2Fappointments/)
    assert.doesNotMatch(html, /Xác nhận đặt lịch|Tìm hồ sơ bệnh nhân/)
    assert.equal((html.match(/<main[ >]/g) || []).length, 1)
    assert.doesNotMatch(html, /admin-sidebar|Hủy lịch hẹn|Đánh dấu đã khám/)
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
})

test('appointment table exposes editing only for confirmed visits at least two hours away', async () => {
  const base = { appointmentId: 1, date: '2026-09-13', startTime: '08:00:00', endTime: '08:30:00', patientFullName: 'Nguyễn An', doctorFullName: 'Trần Minh', status: 'Confirmed' }
  const html = await render('/src/features/appointments/components/AppointmentsTable.jsx', {
    items: [base, { ...base, appointmentId: 2, startTime: '07:59:59' }, { ...base, appointmentId: 3, status: 'Cancelled' }],
    now: { date: '2026-09-13', time: '06:00:00' }, loading: false, onView() {}, onEdit() {},
  })
  assert.match(html, /aria-label="Sửa lịch hẹn #1" title=/)
  assert.match(html, /aria-label="Sửa lịch hẹn #2" disabled=""/)
  assert.match(html, /aria-label="Sửa lịch hẹn #3" disabled=""/)
})

for (const [file, props] of [
  ['specialties/components/SpecialtyForm', {}],
  ['doctors/components/DoctorForm', { specialties: [] }],
  ['patients/components/PatientForm', {}],
  ['shift-schedules/components/ShiftForm', { shifts: [] }],
  ['non-working-days/components/NonWorkingDayForm', { doctors: [], nonWorkingDays: [] }],
]) {
  test(`${file} renders a named native modal with visible save errors`, async () => {
    const html = await render(`/src/features/${file}.jsx`, {
      ...props, isSaving: false, onSave() {}, onCancel() {}, errorMessage: 'Không thể lưu. Hãy thử lại.',
    })
    assert.match(html, /<dialog[^>]+aria-labelledby=/)
    assert.equal((html.match(/<dialog/g) || []).length, 1)
    assert.match(html, /role="alert"/)
    assert.match(html, /Không thể lưu. Hãy thử lại./)
    assert.match(html, /<form/)
    assert.match(html, /type="submit"/)
  })
}

test('failed schedule load offers retry, not an editable empty schedule', async () => {
  const html = await render('/src/features/shift-schedules/components/WeeklySchedulePanel.jsx', {
    doctors: [{ doctorId: 1, fullName: 'Test doctor' }], shifts: [],
    selectedDoctorId: 1, selectedShiftIds: new Set(), isScheduleReady: false,
    isLoadingSchedule: false, isSaving: false, scheduleError: 'Tải lịch thất bại',
  })
  assert.match(html, /Tải lại lịch/)
  assert.match(html, /Tải lịch thất bại/)
  assert.doesNotMatch(html, /Lưu lịch tuần/)
  assert.doesNotMatch(html, /type="checkbox"/)
})

test('ready schedule shows selected shifts and can be saved', async () => {
  const html = await render('/src/features/shift-schedules/components/WeeklySchedulePanel.jsx', {
    doctors: [{ doctorId: 1, fullName: 'Test doctor' }],
    shifts: [{ shiftId: 1, dayOfWeek: 'Monday', name: 'Ca sáng', startTime: '08:00:00', endTime: '11:00:00', isActive: true }],
    selectedDoctorId: 1, selectedShiftIds: new Set([1]), isScheduleReady: true,
    isLoadingSchedule: false, isSaving: false,
  })
  assert.match(html, /checked=""/)
  assert.match(html, /Lưu lịch tuần/)
  assert.doesNotMatch(html, /Tải lại lịch/)
})

test('calendar renders populated, empty and loading states', async () => {
  const path = '/src/features/shift-schedules/components/WeeklyShiftCalendar.jsx'
  const shifts = [
    { shiftId: 1, dayOfWeek: 'Monday', name: 'Ca sáng', startTime: '08:00:00', endTime: '11:00:00', isActive: true },
    { shiftId: 2, dayOfWeek: 'Monday', name: 'Ca trùng', startTime: '09:00:00', endTime: '12:00:00', isActive: true },
  ]
  const html = await render(path, { shifts, isLoading: false })
  assert.equal((html.match(/<article/g) || []).length, 2)
  assert.match(html, /Trùng giờ/)
  assert.match(html, /width:calc\(50% - 8px\)/)
  assert.match(await render(path, { shifts: [], isLoading: false }), /Lịch tuần đang trống/)
  assert.match(await render(path, { shifts: [], isLoading: true }), /animate-pulse/)
})

test('month calendar handles leap day and multiple closure scopes', async () => {
  const html = await render('/src/features/non-working-days/components/NonWorkingDaysCalendar.jsx', {
    month: new Date(2028, 1, 1),
    nonWorkingDays: [
      { nonWorkingDayId: 1, date: '2028-02-29', doctorId: null },
      { nonWorkingDayId: 2, date: '2028-02-29', doctorId: 1, doctorFullName: 'Nguyễn An' },
    ],
  })
  assert.match(html, />29<\/span>/)
  assert.match(html, /Bệnh viện nghỉ/)
  assert.match(html, /Nguyễn An/)
  assert.match(html, /aria-label="Tháng trước"/)
})

test('search result empty state is distinct from an empty database', async () => {
  for (const [path, key] of [
    ['/src/features/specialties/components/SpecialtiesTable.jsx', 'specialties'],
    ['/src/features/doctors/components/DoctorsTable.jsx', 'doctors'],
    ['/src/features/patients/components/PatientsTable.jsx', 'patients'],
  ]) {
    const html = await render(path, { [key]: [], isLoading: false, emptyMessage: 'Không tìm thấy kết quả.' })
    assert.match(html, /Không tìm thấy kết quả./)
    assert.match(html, /<caption/)
  }
})

test('assistant renders one card per lookup tool, hides internal errors and never injects HTML', async () => {
  const sources = [
    { tool: 'get_specialties', data: { items: [{ specialtyId: 3, name: 'Tim mạch' }], hasMore: true } },
    { tool: 'get_specialties', data: { items: [{ specialtyId: 3, name: 'Tim mạch' }], hasMore: true } },
    { tool: 'get_doctors', data: { items: [{ doctorId: 5, fullName: 'BS. <img src=x onerror=alert(1)>', specialtyId: 3, specialtyName: 'Tim mạch', experience: 9 }], hasMore: false } },
    { tool: 'get_available_slots', data: { doctorId: 5, doctorName: 'BS. Minh', specialtyId: 3, specialtyName: 'Tim mạch', fromDate: '2026-10-07', toDate: '2026-10-07', items: [{ appointmentSlotId: 201, date: '2026-10-07', startTime: '08:00:00', endTime: '08:30:00' }], hasMore: false } },
    { tool: 'get_doctors', data: { error: { code: 'invalid_arguments', message: 'specialtyId phải là số nguyên dương.' } } },
    { tool: 'get_available_slots', data: { error: { code: 'doctor_unavailable', message: 'Bác sĩ không tồn tại hoặc không còn nhận lịch khám.' } } },
    { tool: 'future_tool', data: { items: [{ secret: 'raw-json' }] } },
  ]
  const html = await render('/src/features/chat/components/SourceCards.jsx', { sources })
  assert.equal((html.match(/class="chat-card"/g) || []).length, 3, 'duplicate specialty result is shown once')
  assert.match(html, /href="\/doctors\?specialty=3"/)
  assert.match(html, /href="\/appointments\?doctor=5"/)
  assert.match(html, /href="\/appointments\?doctor=5&amp;slot=201&amp;date=2026-10-07"/)
  assert.match(html, /Còn nhiều kết quả khác/)
  assert.match(html, /không còn nhận lịch khám/)
  assert.doesNotMatch(html, /số nguyên dương|raw-json|<img/)
  assert.equal(await render('/src/features/chat/components/SourceCards.jsx', { sources: [] }), '')
  const manySlots = Array.from({ length: 20 }, (_, index) => ({ appointmentSlotId: 300 + index, date: '2026-10-07', startTime: `${String(8 + Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}:00`, endTime: '00:00:00' }))
  const long = await render('/src/features/chat/components/SourceCards.jsx', { sources: [{ tool: 'get_available_slots', data: { doctorId: 5, doctorName: 'BS. Minh', specialtyName: 'Tim mạch', items: manySlots, hasMore: false } }] })
  assert.equal((long.match(/chat-chip--time/g) || []).length, 8)
  assert.match(long, /Xem thêm 12 giờ trống/)

  const reply = await render('/src/features/chat/components/ReplyText.jsx', { text: 'Có **2 bác sĩ**:\n- A\n- <script>x</script>' })
  assert.match(reply, /<strong>2 bác sĩ<\/strong>/)
  assert.match(reply, /<ul><li>A<\/li><li>&lt;script&gt;x&lt;\/script&gt;<\/li><\/ul>/)
})

test('assistant page shows suggestions before the first message', async () => {
  const html = await render('/src/features/chat/page/ChatPage.jsx')
  assert.match(html, /Bạn cần đặt lịch hay tra cứu gì\?/)
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1)
  assert.match(html, /<textarea[^>]*id="chat-input"/)
  assert.match(html, /role="log"/)
})

test('assistant action card: buttons only while Pending, before → value, failure reason', async () => {
  const action = {
    chatActionId: 'a1', type: 'RescheduleAppointment', status: 'Pending', title: 'Đổi lịch khám',
    details: [{ label: 'Giờ khám', before: '08:00 - 08:30', value: '09:00 - 09:30' }, { label: 'Bác sĩ', before: null, value: '<b>An</b>' }],
    expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(), completedAt: null, failureReason: null,
  }
  const pending = await render('/src/features/chat/components/ActionCard.jsx', { action, onDecide: () => {} })
  assert.match(pending, />Xác nhận</)
  assert.match(pending, />Hủy</)
  assert.match(pending, /chat-action-before">08:00 - 08:30</)
  assert.match(pending, /&lt;b&gt;An&lt;\/b&gt;/, 'details are rendered as text')

  const failed = await render('/src/features/chat/components/ActionCard.jsx', { action: { ...action, status: 'Failed', failureReason: 'Khung giờ vừa được người khác đặt.' }, onDecide: () => {} })
  assert.doesNotMatch(failed, />Xác nhận</)
  assert.match(failed, /Khung giờ vừa được người khác đặt\./)

  const expired = await render('/src/features/chat/components/ActionCard.jsx', { action: { ...action, expiresAt: new Date(Date.now() - 1000).toISOString() }, onDecide: () => {} })
  assert.doesNotMatch(expired, />Xác nhận</, 'countdown at zero shows the card as expired')
  assert.match(expired, /Đề xuất đã hết hạn/)
})
