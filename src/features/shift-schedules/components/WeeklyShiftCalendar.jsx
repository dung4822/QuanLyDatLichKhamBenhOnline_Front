import { AlertTriangle, CalendarDays } from 'lucide-react'
import { DAY_LABELS, WEEK_DAYS, formatShiftTime } from '../constants'

const HOUR_HEIGHT = 68
const MIN_EVENT_HEIGHT = 46

function timeToMinutes(value) {
  const [hours = '0', minutes = '0'] = (value || '').split(':')
  return Number(hours) * 60 + Number(minutes)
}

function getCalendarBounds(shifts) {
  if (shifts.length === 0) {
    return { startMinute: 8 * 60, endMinute: 18 * 60 }
  }

  const earliestStart = Math.min(...shifts.map((shift) => timeToMinutes(shift.startTime)))
  const latestEnd = Math.max(...shifts.map((shift) => timeToMinutes(shift.endTime)))

  // Lịch luôn có một khoảng đệm để card đầu/cuối không dính sát mép và dễ quan sát hơn.
  const startMinute = Math.max(0, Math.min(8 * 60, Math.floor((earliestStart - 30) / 60) * 60))
  const endMinute = Math.min(24 * 60, Math.max(18 * 60, Math.ceil((latestEnd + 30) / 60) * 60))

  return { startMinute, endMinute }
}

function isOverlapping(shift, otherShift) {
  if (shift.shiftId === otherShift.shiftId) {
    return true
  }

  return timeToMinutes(shift.startTime) < timeToMinutes(otherShift.endTime) && timeToMinutes(shift.endTime) > timeToMinutes(otherShift.startTime)
}

function getEventStyle(shift, dayShifts, startMinute) {
  const conflicts = dayShifts
    .filter((otherShift) => isOverlapping(shift, otherShift))
    .sort((firstShift, secondShift) => timeToMinutes(firstShift.startTime) - timeToMinutes(secondShift.startTime))
  const conflictIndex = conflicts.findIndex((otherShift) => otherShift.shiftId === shift.shiftId)
  const columnWidth = 100 / conflicts.length
  const top = (timeToMinutes(shift.startTime) - startMinute) * (HOUR_HEIGHT / 60)
  const height = Math.max(
    MIN_EVENT_HEIGHT,
    (timeToMinutes(shift.endTime) - timeToMinutes(shift.startTime)) * (HOUR_HEIGHT / 60),
  )

  return {
    hasOverlap: conflicts.length > 1,
    style: {
      top: `${top}px`,
      left: `calc(${conflictIndex * columnWidth}% + 4px)`,
      width: `calc(${columnWidth}% - 8px)`,
      height: `${height}px`,
    },
  }
}

function WeeklyShiftCalendar({ shifts, isLoading }) {
  if (isLoading) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="h-5 w-52 animate-pulse rounded bg-slate-100" />
        <div className="mt-5 h-96 animate-pulse rounded-xl bg-slate-50" />
      </section>
    )
  }

  if (shifts.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm">
        <CalendarDays className="mx-auto h-8 w-8 text-slate-400" />
        <h2 className="mt-3 font-bold text-[#1D3557]">Lịch tuần đang trống</h2>
        <p className="mt-1 text-sm text-slate-500">Thêm ca làm việc đầu tiên để xem chúng hiển thị trên lịch.</p>
      </section>
    )
  }

  const { startMinute, endMinute } = getCalendarBounds(shifts)
  const hourMarks = Array.from({ length: (endMinute - startMinute) / 60 + 1 }, (_, index) => startMinute + index * 60)
  const calendarHeight = ((endMinute - startMinute) / 60) * HOUR_HEIGHT
  const gridStyle = { gridTemplateColumns: '72px repeat(7, minmax(132px, 1fr))' }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
            <CalendarDays className="h-4 w-4" />
            Lịch nhìn nhanh
          </div>
          <h2 className="text-xl font-bold text-[#1D3557]">Ca làm việc trong tuần</h2>
          <p className="mt-1 text-sm text-slate-500">Các ca được đặt theo đúng khung giờ để dễ phát hiện chỗ trống hoặc trùng nhau.</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-blue-500" />Đang hoạt động</span>
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-slate-400" />Ngừng hoạt động</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1020px]">
          <div className="grid border-b border-slate-200" style={gridStyle}>
            <div className="border-r border-slate-200 px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-400">Giờ</div>
            {WEEK_DAYS.map((day) => (
              <div key={day} className="border-r border-slate-200 px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500 last:border-r-0">
                {DAY_LABELS[day]}
              </div>
            ))}
          </div>

          <div className="grid" style={gridStyle}>
            <div className="relative border-r border-slate-200 bg-slate-50/50" style={{ height: `${calendarHeight}px` }}>
              {hourMarks.map((minute, index) => (
                <span
                  key={minute}
                  style={{ top: `${index * HOUR_HEIGHT - 8}px` }}
                  className="absolute right-3 text-xs font-medium text-slate-400"
                >
                  {String(Math.floor(minute / 60)).padStart(2, '0')}:00
                </span>
              ))}
            </div>

            {WEEK_DAYS.map((day) => {
              const dayShifts = shifts.filter((shift) => shift.dayOfWeek === day)

              return (
                <div key={day} className="relative border-r border-slate-200 last:border-r-0" style={{ height: `${calendarHeight}px` }}>
                  {hourMarks.map((minute, index) => (
                    <div
                      key={minute}
                      style={{ top: `${index * HOUR_HEIGHT}px` }}
                      className="absolute left-0 right-0 border-t border-slate-100"
                    />
                  ))}

                  {dayShifts.map((shift) => {
                    const { hasOverlap, style } = getEventStyle(shift, dayShifts, startMinute)

                    return (
                      <article
                        key={shift.shiftId}
                        style={style}
                        title={`${shift.name}: ${formatShiftTime(shift.startTime, shift.endTime)}`}
                        className={`absolute overflow-hidden rounded-lg border p-2 text-left shadow-sm ${
                          shift.isActive
                            ? hasOverlap
                              ? 'border-amber-300 bg-amber-50 text-amber-900'
                              : 'border-blue-200 bg-blue-50 text-blue-900'
                            : 'border-dashed border-slate-300 bg-slate-100 text-slate-500'
                        }`}
                      >
                        <p className="truncate text-xs font-bold">{shift.name}</p>
                        <p className="mt-0.5 text-[11px] font-medium opacity-80">{formatShiftTime(shift.startTime, shift.endTime)}</p>
                        {hasOverlap && (
                          <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-amber-700">
                            <AlertTriangle className="h-3 w-3" />
                            Trùng giờ
                          </p>
                        )}
                      </article>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default WeeklyShiftCalendar
