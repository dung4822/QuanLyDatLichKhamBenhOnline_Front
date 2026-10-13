export function timeToMinutes(value) {
  const [hours = '0', minutes = '0'] = (value || '').split(':')
  return Number(hours) * 60 + Number(minutes)
}

// Interval partitioning: xếp ca vào cột trống đầu tiên, theo giờ bắt đầu.
// Các ca nối nhau thành một nhóm dùng cùng độ rộng, tránh card che nhau.
export function layoutDayShifts(shifts) {
  const sorted = [...shifts].sort((first, second) =>
    timeToMinutes(first.startTime) - timeToMinutes(second.startTime)
    || timeToMinutes(first.endTime) - timeToMinutes(second.endTime)
    || first.shiftId - second.shiftId,
  )
  const result = []
  let group = []
  let columnEnds = []
  let groupEnd = -1

  function finishGroup() {
    for (const item of group) {
      result.push({ ...item, columnCount: columnEnds.length })
    }
    group = []
    columnEnds = []
    groupEnd = -1
  }

  for (const shift of sorted) {
    const start = timeToMinutes(shift.startTime)
    const end = timeToMinutes(shift.endTime)
    // Ca kết thúc lúc 09:00 và ca bắt đầu lúc 09:00 không trùng nhau.
    if (start >= groupEnd) finishGroup()
    let column = columnEnds.findIndex((columnEnd) => columnEnd <= start)
    if (column === -1) column = columnEnds.length
    columnEnds[column] = end
    group.push({ shift, column })
    groupEnd = Math.max(groupEnd, end)
  }

  finishGroup()
  return result
}
