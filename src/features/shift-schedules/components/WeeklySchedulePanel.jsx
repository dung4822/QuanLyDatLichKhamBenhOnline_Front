import { Check, LoaderCircle, UsersRound } from 'lucide-react'
import { DAY_LABELS, WEEK_DAYS, formatShiftTime } from '../constants'

function WeeklySchedulePanel({
  doctors,
  shifts,
  selectedDoctorId,
  selectedShiftIds,
  isLoadingSchedule,
  isScheduleReady,
  onRetry,
  isSaving,
  scheduleError,
  doctorsError,
  onDoctorChange,
  onToggleShift,
  onSelectAll,
  onClearAll,
  onSave,
}) {
  const selectedDoctor = doctors.find((doctor) => doctor.doctorId === selectedDoctorId)
  const activeShiftCount = shifts.filter((shift) => shift.isActive).length
  const selectedShiftCount = [...selectedShiftIds].filter((shiftId) =>
    shifts.some((shift) => shift.shiftId === shiftId && shift.isActive),
  ).length
  const controlsDisabled = !selectedDoctorId || !isScheduleReady || isLoadingSchedule || isSaving

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 border-b border-slate-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
            <UsersRound className="h-4 w-4" />
            Lịch tuần lặp lại
          </div>
          <h2 className="text-xl font-bold text-(--ink)">Phân công ca cho bác sĩ</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Chọn toàn bộ các ca bác sĩ thường làm trong một tuần, rồi lưu một lần.
          </p>
        </div>
        <div className="w-full lg:w-80">
          <label htmlFor="schedule-doctor" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Chọn bác sĩ
          </label>
          <select
            id="schedule-doctor"
            value={selectedDoctorId || ''}
            onChange={(event) => onDoctorChange(event.target.value)}
            disabled={isSaving || isLoadingSchedule || Boolean(doctorsError)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="">Chọn bác sĩ để cấu hình</option>
            {doctors.map((doctor) => (
              <option key={doctor.doctorId} value={doctor.doctorId}>
                {doctor.fullName}
              </option>
            ))}
          </select>
          {doctorsError && <p className="mt-1.5 text-xs font-medium text-rose-600">{doctorsError}</p>}
        </div>
      </div>

      {!selectedDoctorId && !doctorsError && (
        <div className="py-14 text-center text-sm text-slate-500">Chọn một bác sĩ để xem và chỉnh lịch tuần.</div>
      )}

      {selectedDoctorId && isLoadingSchedule && (
        <div className="flex items-center justify-center gap-2 py-14 text-sm font-medium text-slate-500">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Đang tải lịch tuần...
        </div>
      )}

      {selectedDoctorId && !isLoadingSchedule && !isScheduleReady && (
        <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
          <p>{scheduleError || 'Chưa tải được lịch tuần. Hãy tải lại trước khi chỉnh sửa.'}</p>
          <button type="button" className="btn-secondary mt-4" onClick={onRetry}>Tải lại lịch</button>
        </div>
      )}

      {selectedDoctorId && !isLoadingSchedule && isScheduleReady && (
        <div className="pt-5">
          <div className="mb-5 flex flex-col gap-3 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-(--ink)">{selectedDoctor?.fullName}</span> đang có{' '}
              <span className="font-semibold text-blue-700">{selectedShiftCount}</span> ca được chọn.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onSelectAll}
                disabled={controlsDisabled || activeShiftCount === 0}
                className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Chọn tất cả ca đang dùng
              </button>
              <button
                type="button"
                onClick={onClearAll}
                disabled={controlsDisabled || selectedShiftCount === 0}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Bỏ chọn tất cả
              </button>
            </div>
          </div>

          {scheduleError && (
            <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {scheduleError}
            </div>
          )}

          {shifts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
              Chưa có ca làm việc để phân công. Hãy mở tab “Ca làm việc” để tạo ca trước.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {WEEK_DAYS.map((day) => {
                const dayShifts = shifts.filter((shift) => shift.dayOfWeek === day)

                return (
                  <section key={day} className="overflow-hidden rounded-xl border border-slate-200">
                    <h3 className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-(--ink)">
                      {DAY_LABELS[day]}
                    </h3>
                    <div className="divide-y divide-slate-100">
                      {dayShifts.length === 0 && <p className="px-4 py-5 text-sm text-slate-400">Chưa có ca</p>}

                      {dayShifts.map((shift) => {
                        const isActive = shift.isActive
                        const isChecked = isActive && selectedShiftIds.has(shift.shiftId)

                        return (
                          <label
                            key={shift.shiftId}
                            className={`flex gap-3 px-4 py-3 transition ${
                              isChecked ? 'cursor-pointer bg-blue-50/80' : isActive ? 'cursor-pointer hover:bg-blue-50/50' : 'cursor-not-allowed bg-slate-50/70 opacity-65'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => onToggleShift(shift.shiftId)}
                              disabled={!isActive || controlsDisabled}
                              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-700 focus:ring-blue-500 disabled:cursor-not-allowed"
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-slate-700">{shift.name}</span>
                              <span className="mt-0.5 block text-xs text-slate-500">{formatShiftTime(shift.startTime, shift.endTime)}</span>
                              {!isActive && <span className="mt-1 block text-xs font-medium text-slate-500">Ngừng hoạt động</span>}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </section>
                )
              })}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              Ca ngừng hoạt động không thể được chọn và sẽ không được gửi khi lưu lịch.
            </p>
            <button
              type="button"
              onClick={onSave}
              disabled={controlsDisabled}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--brand) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--brand-strong) disabled:cursor-wait disabled:opacity-70"
            >
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {isSaving ? 'Đang lưu lịch...' : 'Lưu lịch tuần'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default WeeklySchedulePanel
