import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonth } from '../utils'

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function dateToString(year, monthIndex, day) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function startOfMonthGrid(year, monthIndex) {
  const sundayBasedDay = new Date(year, monthIndex, 1).getDay()
  return (sundayBasedDay + 6) % 7
}

function NonWorkingDaysCalendar({ month, nonWorkingDays, onPreviousMonth, onNextMonth }) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstWeekday = startOfMonthGrid(year, monthIndex)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const days = Array.from({ length: 42 }, (_, index) => index - firstWeekday + 1)
  const today = new Date()
  const todayString = dateToString(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-lg font-bold text-[#1D3557]">Lịch nghỉ theo tháng</h2>
          <p className="mt-1 text-sm text-slate-500">Xem nhanh ngày bệnh viện hoặc bác sĩ không nhận khám.</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPreviousMonth}
            aria-label="Tháng trước"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="w-36 text-center text-sm font-bold capitalize text-[#1D3557]">{formatMonth(month)}</p>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Tháng sau"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="px-2 py-2.5 text-center text-xs font-bold text-slate-500">{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const isCurrentMonthDay = day >= 1 && day <= daysInMonth
          const dateString = isCurrentMonthDay ? dateToString(year, monthIndex, day) : ''
          const dayItems = isCurrentMonthDay ? nonWorkingDays.filter((item) => item.date === dateString) : []
          const hasHospitalClosure = dayItems.some((item) => item.doctorId === null)
          const doctorItems = dayItems.filter((item) => item.doctorId !== null)
          const isToday = dateString === todayString

          return (
            <div
              key={`${day}-${index}`}
              className={`min-h-25 border-b border-r border-slate-100 p-1.5 sm:min-h-29 sm:p-2 ${
                isCurrentMonthDay ? 'bg-white' : 'bg-slate-50/50'
              }`}
            >
              {isCurrentMonthDay && (
                <>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday ? 'bg-[#1D3557] text-white' : 'text-slate-600'
                  }`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {hasHospitalClosure && (
                      <span title="Cả bệnh viện nghỉ" className="block truncate rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                        BV nghỉ
                      </span>
                    )}
                    {doctorItems.slice(0, hasHospitalClosure ? 1 : 2).map((item) => (
                      <span key={item.nonWorkingDayId} title={item.doctorFullName || 'Bác sĩ nghỉ'} className="block truncate rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">
                        {item.doctorFullName || `BS #${item.doctorId}`}
                      </span>
                    ))}
                    {doctorItems.length > (hasHospitalClosure ? 1 : 2) && (
                      <span className="block px-1.5 text-[10px] font-semibold text-slate-500">+{doctorItems.length - (hasHospitalClosure ? 1 : 2)} bác sĩ</span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-4 border-t border-slate-100 px-5 py-3 text-xs font-medium text-slate-500 sm:px-6">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-rose-400" />Cả bệnh viện nghỉ</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-violet-400" />Bác sĩ nghỉ</span>
      </div>
    </section>
  )
}

export default NonWorkingDaysCalendar
