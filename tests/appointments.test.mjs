import assert from 'node:assert/strict'
import { test } from 'node:test'
import { allowedActions, appointmentError, canRescheduleAppointment, isRescheduleSlot, rescheduleRestriction, timestampLabel, validateDateRange } from '../src/features/appointments/utils.js'
import { mockFetch, problem } from './helpers/mockApi.mjs'
import { changeAppointmentStatus, createAppointment, findSubmittedAppointment, getAppointments, rescheduleAppointment } from '../src/features/appointments/api/appointmentsApi.js'

const confirmed = { date: '2026-09-13', startTime: '08:00:00', endTime: '08:30:00', status: 'Confirmed' }

test('rescheduling permits exactly two hours and closes one second later', () => {
  assert.equal(canRescheduleAppointment(confirmed, { date: confirmed.date, time: '05:59:59' }), true)
  assert.equal(canRescheduleAppointment(confirmed, { date: confirmed.date, time: '06:00:00' }), true)
  assert.equal(canRescheduleAppointment(confirmed, { date: confirmed.date, time: '06:00:01' }), false)
  assert.equal(canRescheduleAppointment(confirmed, { date: confirmed.date, time: '08:00:00' }), false)
  assert.equal(canRescheduleAppointment(confirmed, { date: '2026-09-14', time: '00:00:00' }), false)
  assert.match(rescheduleRestriction(confirmed, { date: confirmed.date, time: '06:00:01' }), /dưới 2 tiếng/)
  for (const status of ['Cancelled', 'Completed', 'NoShow']) {
    assert.equal(canRescheduleAppointment({ ...confirmed, status }, { date: '2026-09-12', time: '00:00:00' }), false)
  }
})

test('two-hour reschedule cutoff crosses midnight, leap days and years in Vietnam', () => {
  for (const [date, previous] of [['2026-09-13', '2026-09-12'], ['2028-03-01', '2028-02-29'], ['2027-01-01', '2026-12-31']]) {
    const appointment = { ...confirmed, date, startTime: '01:00:00' }
    assert.equal(canRescheduleAppointment(appointment, { date: previous, time: '23:00:00' }), true)
    assert.equal(canRescheduleAppointment(appointment, { date: previous, time: '23:00:01' }), false)
  }
})

test('the new slot can be less than two hours away but must be future, available and within seven days', () => {
  const now = { date: '2026-09-13', time: '06:00:00' }
  const appointment = { ...confirmed, appointmentSlotId: 105 }
  const slot = { appointmentSlotId: 110, doctorId: 99, date: now.date, startTime: '06:30:00', status: 'Available' }
  assert.equal(isRescheduleSlot(slot, appointment, now), true)
  assert.equal(isRescheduleSlot({ ...slot, appointmentSlotId: 105 }, appointment, now), false)
  assert.equal(isRescheduleSlot({ ...slot, startTime: '06:00:00' }, appointment, now), false)
  assert.equal(isRescheduleSlot({ ...slot, date: '2026-09-12' }, appointment, now), false)
  assert.equal(isRescheduleSlot({ ...slot, date: '2026-09-19' }, appointment, now), true)
  assert.equal(isRescheduleSlot({ ...slot, date: '2026-09-20' }, appointment, now), false)
  for (const status of ['Booked', 'Unavailable']) assert.equal(isRescheduleSlot({ ...slot, status }, appointment, now), false)
})

test('reschedule PATCH sends only the new numeric slot ID and preserves the returned appointment', async (t) => {
  const saved = { ...confirmed, appointmentId: 42, appointmentSlotId: 110, patientId: 12, doctorId: 99, reason: 'Lý do lúc đặt', createdAt: '2026-09-01T07:00:00Z' }
  let call
  mockFetch(t, async (url, options) => { call = { url, ...options }; return Response.json(saved) })
  assert.deepEqual(await rescheduleAppointment(42, '110'), saved)
  assert.equal(call.url, '/api/appointments/42/reschedule')
  assert.equal(call.method, 'PATCH')
  assert.equal(new Headers(call.headers).get('Content-Type'), 'application/json')
  assert.match(new Headers(call.headers).get('X-CSRF-TOKEN'), /^test-csrf-token/)
  assert.equal(call.credentials, 'include')
  assert.deepEqual(JSON.parse(call.body), { appointmentSlotId: 110 })
})

test('invalid reschedule slot IDs do not send requests', async (t) => {
  let calls = 0
  mockFetch(t, async () => { calls++; return Response.json({}) })
  for (const slotId of ['', 0, -1, 1.5, 'abc', null]) {
    await assert.rejects(rescheduleAppointment(42, slotId), (error) => error.status === 400 && !error.uncertain)
  }
  assert.equal(calls, 0)
})

test('reschedule conflicts retain server detail and do not automatically retry', async (t) => {
  let calls = 0
  mockFetch(t, async () => { calls++; return problem(409, { detail: 'Slot mới đã có người đặt.' }) })
  await assert.rejects(rescheduleAppointment(42, 110), (error) => error.status === 409 && !error.uncertain && appointmentError(error) === 'Slot mới đã có người đặt.')
  assert.equal(calls, 1)
})

test('lost or malformed reschedule responses require a fresh lookup before retrying', async (t) => {
  let calls = 0
  mockFetch(t, async () => {
    calls++
    if (calls === 1) throw new TypeError('Network lost')
    if (calls === 2) return new Response('', { status: 200 })
    if (calls === 3) return Response.json({ appointmentId: 42 })
    return Response.json({ detail: 'Server error' }, { status: 500 })
  })
  for (let i = 0; i < 4; i++) await assert.rejects(rescheduleAppointment(42, 110), (error) => error.uncertain === true)
  assert.equal(calls, 4)
})

test('actions honor exact start/end boundaries in Vietnam, including the active visit', () => {
  for (const [time, expected] of [
    ['07:59:59', ['cancel']], ['08:00:00', []], ['08:29:59', []], ['08:30:00', ['complete', 'no-show']],
  ]) assert.deepEqual(allowedActions(confirmed, { date: confirmed.date, time }), expected)
  assert.deepEqual(allowedActions(confirmed, { date: '2026-09-12', time: '23:59:59' }), ['cancel'])
  assert.deepEqual(allowedActions(confirmed, { date: '2026-09-14', time: '00:00:00' }), ['complete', 'no-show'])
  for (const status of ['Cancelled', 'Completed', 'NoShow']) {
    assert.deepEqual(allowedActions({ ...confirmed, status }, { date: '2026-09-14', time: '00:00:00' }), [])
  }
})

test('management permits historical/open dates and rejects reversed ranges', () => {
  assert.equal(validateDateRange({ fromDate: '2020-01-01', toDate: '2030-12-31' }), '')
  assert.equal(validateDateRange({ fromDate: '', toDate: '2020-01-01' }), '')
  assert.notEqual(validateDateRange({ fromDate: '2026-09-14', toDate: '2026-09-13' }), '')
  assert.match(timestampLabel('2026-09-12T17:30:00Z'), /00:30/)
  assert.match(timestampLabel('2026-09-12T17:30:00Z'), /13\/9\/26/)
})

test('conflicts show the server detail and validation errors remain visible', () => {
  assert.equal(appointmentError({ status: 409, problem: { detail: 'Bệnh nhân đã có lịch trùng giờ.', errors: {} } }), 'Bệnh nhân đã có lịch trùng giờ.')
  assert.equal(appointmentError({ status: 400, problem: { detail: 'Validation failed', errors: { Reason: ['Lý do quá dài.'] } } }), 'Lý do quá dài.')
  assert.match(appointmentError({ status: 404, problem: null }), /không còn tồn tại/)
  assert.match(appointmentError({ status: 0, problem: null }), /kết nối/)
})

test('API sends only booking IDs/reason and the documented PATCH bodies', async (t) => {
  const calls = []
  mockFetch(t, async (url, options) => {
    calls.push({ url, ...options })
    return Response.json({ appointmentId: 1 })
  })
  await createAppointment({ patientId: '12', appointmentSlotId: '105', reason: '  Khám lại  ', doctorId: 999, date: '2030-01-01' })
  assert.deepEqual(JSON.parse(calls[0].body), { patientId: 12, appointmentSlotId: 105, reason: 'Khám lại' })
  assert.equal(calls[0].method, 'POST')
  await changeAppointmentStatus(1, 'cancel', ' Bận việc ')
  assert.match(calls[1].url, /\/appointments\/1\/cancel$/)
  assert.deepEqual(JSON.parse(calls[1].body), { reason: 'Bận việc' })
  await changeAppointmentStatus(1, 'complete')
  await changeAppointmentStatus(1, 'no-show')
  for (const call of calls.slice(2)) { assert.equal(call.method, 'PATCH'); assert.equal(call.body, undefined) }
})

test('API preserves all AND filters and pagination, omitting empty filters', async (t) => {
  let requested
  mockFetch(t, async (url) => { requested = new URL(url, 'https://test.local'); return Response.json({ items: [], totalCount: 0, page: 3, pageSize: 10 }) })
  await getAppointments({ patientId: 12, doctorId: 5, specialtyId: 2, fromDate: '2020-01-01', toDate: '', status: 'Completed', page: 3, pageSize: 10, unexpected: 'ignore' })
  assert.deepEqual(Object.fromEntries(requested.searchParams), { patientId: '12', doctorId: '5', specialtyId: '2', fromDate: '2020-01-01', status: 'Completed', page: '3', pageSize: '10' })
})

test('ambiguous POST errors are never automatically retried', async (t) => {
  let calls = 0
  mockFetch(t, async () => { calls++; throw new TypeError('Network lost') })
  await assert.rejects(createAppointment({ patientId: 12, appointmentSlotId: 105 }), (error) => error.uncertain === true)
  assert.equal(calls, 1)
})

test('unreadable success and server failures also require reconciliation', async (t) => {
  const responses = [new Response('', { status: 201 }), Response.json({ title: 'Server error' }, { status: 500 }), Response.json({}, { status: 201 })]
  mockFetch(t, async () => responses.shift())
  for (let i = 0; i < 3; i++) await assert.rejects(createAppointment({ patientId: 12, appointmentSlotId: 105 }), (error) => error.uncertain === true)
})

test('lost-response lookup reads all result pages and ignores cancelled prior bookings', async (t) => {
  const urls = []
  mockFetch(t, async (url, options) => {
    urls.push(new URL(url, 'https://test.local'))
    assert.equal(options.method, 'GET')
    return Response.json({ items: urls.length === 1 ? [{ appointmentId: 1, appointmentSlotId: 105, status: 'Cancelled' }] : [{ appointmentId: 102, appointmentSlotId: 105, status: 'Confirmed' }], totalCount: 101 })
  })
  const result = await findSubmittedAppointment({ patientId: 12, appointmentSlotId: 105, date: '2026-09-13' })
  assert.equal(result.appointmentId, 102)
  assert.equal(urls.length, 2)
  assert.equal(urls[1].searchParams.get('page'), '2')
  assert.equal(urls[1].searchParams.get('patientId'), '12')
  assert.equal(urls[1].searchParams.get('fromDate'), '2026-09-13')
})
