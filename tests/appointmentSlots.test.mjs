import assert from 'node:assert/strict'
import { test } from 'node:test'
import { clinicNow, clinicDays, isFutureSlot, slotError } from '../src/features/appointment-slots/utils.js'

test('Vietnam midnight changes the clinic date independently of the device timezone', () => {
  assert.deepEqual(clinicNow(new Date('2026-09-11T16:59:59Z')), { date: '2026-09-11', time: '23:59:59' })
  assert.deepEqual(clinicNow(new Date('2026-09-11T17:00:00Z')), { date: '2026-09-12', time: '00:00:00' })
})

test('seven-day inclusive window crosses month, leap day and year boundaries', () => {
  assert.deepEqual(clinicDays('2028-02-27'), ['2028-02-27', '2028-02-28', '2028-02-29', '2028-03-01', '2028-03-02', '2028-03-03', '2028-03-04'])
  assert.equal(clinicDays('2026-12-30').at(-1), '2027-01-05')
})

test('slots stop being selectable exactly at their start, and nonavailable slots stay hidden', () => {
  const slot = { date: '2026-09-11', startTime: '08:00:00', status: 'Available' }
  assert.equal(isFutureSlot(slot, { date: slot.date, time: '07:59:59' }), true)
  assert.equal(isFutureSlot(slot, { date: slot.date, time: '08:00:00' }), false)
  assert.equal(isFutureSlot(slot, { date: '2026-09-12', time: '00:00:00' }), false)
  assert.equal(isFutureSlot({ ...slot, status: 'Booked' }, { date: '2026-09-10', time: '00:00:00' }), false)
})

test('validation and non-JSON failures retain appropriate error states', () => {
  assert.equal(slotError({ status: 400, problem: { errors: { fromDate: ['Ngày không hợp lệ.'], dateRange: ['Ngoài phạm vi.'] } } }), 'Ngày không hợp lệ. Ngoài phạm vi.')
  assert.match(slotError({ status: 400, problem: null }), /Khoảng ngày không hợp lệ/)
  assert.match(slotError({ status: 500, problem: null }), /Không tải được/)
  assert.match(slotError({ status: 500, problem: { detail: 'Đã xảy ra lỗi khi xử lý yêu cầu.', errors: {} } }), /Không tải được/)
  assert.match(slotError({ status: 0, problem: null }), /kết nối/)
  assert.match(slotError({ status: 404 }), /chọn lại bác sĩ/)
})
