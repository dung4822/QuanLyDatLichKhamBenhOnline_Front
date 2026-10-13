import assert from 'node:assert/strict'
import test from 'node:test'
import { layoutDayShifts, timeToMinutes } from '../src/features/shift-schedules/calendarLayout.js'

const shift = (shiftId, startTime, endTime) => ({ shiftId, startTime, endTime })

test('converts API times without depending on a timezone', () => {
  assert.equal(timeToMinutes('08:30:00'), 510)
  assert.equal(timeToMinutes('23:59'), 1439)
  assert.equal(timeToMinutes('00:00:00'), 0)
})

test('empty days have no cards', () => {
  assert.deepEqual(layoutDayShifts([]), [])
})

test('back-to-back shifts use the full column width', () => {
  const result = layoutDayShifts([shift(1, '08:00', '09:00'), shift(2, '09:00', '10:00')])
  assert.ok(result.every((item) => item.column === 0 && item.columnCount === 1))
})

test('overlapping chain shares a consistent set of lanes', () => {
  const result = layoutDayShifts([
    shift(1, '08:00', '10:00'),
    shift(2, '09:00', '11:00'),
    shift(3, '10:00', '12:00'),
  ])
  assert.deepEqual(result.map(({ column, columnCount }) => [column, columnCount]), [[0, 2], [1, 2], [0, 2]])
})

test('nested and identical shifts get separate lanes', () => {
  const result = layoutDayShifts([
    shift(1, '08:00', '18:00'),
    shift(2, '09:00', '10:00'),
    shift(3, '09:00', '10:00'),
    shift(4, '14:00', '15:00'),
  ])
  assert.deepEqual(result.map(({ column, columnCount }) => [column, columnCount]), [[0, 3], [1, 3], [2, 3], [1, 3]])
})

test('sorts without mutating the API array and resets lanes for a new group', () => {
  const input = [shift(3, '13:00', '14:00'), shift(2, '09:00', '11:00'), shift(1, '08:00', '10:00')]
  const copy = structuredClone(input)
  const result = layoutDayShifts(input)
  assert.deepEqual(input, copy)
  assert.equal(result[2].columnCount, 1)
  assert.equal(result[2].column, 0)
})

test('no overlapping pair occupies the same lane', () => {
  const input = Array.from({ length: 30 }, (_, index) => {
    const startMinute = 480 + (index * 17) % 300
    const endMinute = startMinute + 30 + index % 5 * 20
    const format = (minute) => `${Math.floor(minute / 60)}:${String(minute % 60).padStart(2, '0')}`
    return shift(index, format(startMinute), format(endMinute))
  })
  const result = layoutDayShifts(input)
  for (let i = 0; i < result.length; i++) {
    for (let j = i + 1; j < result.length; j++) {
      const a = result[i]
      const b = result[j]
      if (timeToMinutes(a.shift.startTime) < timeToMinutes(b.shift.endTime) && timeToMinutes(b.shift.startTime) < timeToMinutes(a.shift.endTime)) {
        assert.notEqual(a.column, b.column)
        assert.equal(a.columnCount, b.columnCount)
      }
    }
  }
})
