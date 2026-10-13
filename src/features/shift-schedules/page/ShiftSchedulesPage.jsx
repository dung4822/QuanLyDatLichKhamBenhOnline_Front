import Notice from '../../../components/ui/Notice'
import { getErrorMessage, getFieldErrors } from '../../../lib/apiClient'
import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, ClipboardList, Plus, RefreshCw, Settings2 } from 'lucide-react'
import { getDoctors } from '../../doctors/api/doctorsApi'
import ShiftForm from '../components/ShiftForm'
import ShiftsTable from '../components/ShiftsTable'
import WeeklyShiftCalendar from '../components/WeeklyShiftCalendar'
import WeeklySchedulePanel from '../components/WeeklySchedulePanel'
import {
  createShift,
  deleteShift,
  getDoctorShifts,
  getShifts,
  replaceDoctorShifts,
  updateShift,
} from '../api/shiftsApi'

const ERROR_MESSAGES = {
  400: 'Dữ liệu ca làm việc chưa hợp lệ. Vui lòng kiểm tra các trường được đánh dấu.',
  404: 'Ca làm việc hoặc bác sĩ không tồn tại hoặc đã bị thay đổi.',
}

function getScheduleErrorMessage(error) {
  // Lỗi của danh sách ca (ShiftIds) là câu cụ thể nhất, nên ưu tiên hiển thị.
  const shiftIdsError = getFieldErrors(error, ['shiftIds']).fields.shiftIds
  if (shiftIdsError) return shiftIdsError
  return getErrorMessage(error, {
    400: 'Lịch tuần chứa dữ liệu không hợp lệ. Vui lòng kiểm tra lại các ca đã chọn.',
    404: 'Bác sĩ không tồn tại hoặc đã bị xóa.',
    500: 'Không thể lưu lịch tuần. Các checkbox vẫn được giữ nguyên để bạn thử lại.',
  })
}

function ShiftSchedulesPage() {
  const [activeTab, setActiveTab] = useState('schedule')
  const [shifts, setShifts] = useState([])
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [shiftsError, setShiftsError] = useState('')
  const [doctorsError, setDoctorsError] = useState('')
  const [notice, setNotice] = useState(null)
  const [isShiftFormOpen, setIsShiftFormOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState(null)
  const [isSavingShift, setIsSavingShift] = useState(false)
  const [shiftActionId, setShiftActionId] = useState(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState(null)
  const [selectedShiftIds, setSelectedShiftIds] = useState(() => new Set())
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false)
  const [isSavingSchedule, setIsSavingSchedule] = useState(false)
  const [scheduleError, setScheduleError] = useState('')
  const [isScheduleReady, setIsScheduleReady] = useState(false)

  const loadBaseData = useCallback(async () => {
    setIsLoading(true)
    setShiftsError('')
    setDoctorsError('')

    const [shiftsResult, doctorsResult] = await Promise.allSettled([getShifts(), getDoctors()])

    if (shiftsResult.status === 'fulfilled') {
      setShifts(Array.isArray(shiftsResult.value) ? shiftsResult.value : [])
    } else {
      setShiftsError(getErrorMessage(shiftsResult.reason, ERROR_MESSAGES))
    }

    if (doctorsResult.status === 'fulfilled') {
      setDoctors(Array.isArray(doctorsResult.value) ? doctorsResult.value : [])
    } else {
      setDoctorsError('Không tải được danh sách bác sĩ để chọn lịch tuần.')
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    const timerId = window.setTimeout(loadBaseData, 0)
    return () => window.clearTimeout(timerId)
  }, [loadBaseData])

  function openCreateShiftForm() {
    setSelectedShift(null)
    setNotice(null)
    setIsShiftFormOpen(true)
  }

  function openEditShiftForm(shift) {
    setSelectedShift(shift)
    setNotice(null)
    setIsShiftFormOpen(true)
  }

  function closeShiftForm() {
    if (!isSavingShift) {
      setIsShiftFormOpen(false)
      setSelectedShift(null)
    }
  }

  async function saveShift(values) {
    setIsSavingShift(true)
    setNotice(null)

    try {
      const savedShift = selectedShift
        ? await updateShift(selectedShift.shiftId, values)
        : await createShift(values)

      setShifts((currentShifts) => {
        if (!selectedShift) {
          return [...currentShifts, savedShift]
        }

        return currentShifts.map((shift) => (shift.shiftId === savedShift.shiftId ? savedShift : shift))
      })

      // Ca inactive không được gửi trong PUT lịch tuần, nên loại khỏi selection ngay khi vừa tắt ca.
      if (!savedShift.isActive) {
        setSelectedShiftIds((currentIds) => {
          const nextIds = new Set(currentIds)
          nextIds.delete(savedShift.shiftId)
          return nextIds
        })
      }

      setNotice({
        type: 'success',
        message: selectedShift ? 'Đã cập nhật ca làm việc.' : 'Đã thêm ca làm việc mới.',
      })
      setIsShiftFormOpen(false)
      setSelectedShift(null)
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, ERROR_MESSAGES) })
      throw error
    } finally {
      setIsSavingShift(false)
    }
  }

  async function removeShift(shift) {
    const shouldDelete = window.confirm(
      `Xóa ca “${shift.name}”? Nếu ca đang được phân công, bạn nên sửa trạng thái thành ngừng hoạt động thay vì xóa.`,
    )
    if (!shouldDelete) {
      return
    }

    setShiftActionId(shift.shiftId)
    setNotice(null)

    try {
      await deleteShift(shift.shiftId)
      setShifts((currentShifts) => currentShifts.filter((item) => item.shiftId !== shift.shiftId))
      setSelectedShiftIds((currentIds) => {
        const nextIds = new Set(currentIds)
        nextIds.delete(shift.shiftId)
        return nextIds
      })
      setNotice({ type: 'success', message: 'Đã xóa ca làm việc.' })
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, ERROR_MESSAGES) })
    } finally {
      setShiftActionId(null)
    }
  }

  async function loadDoctorSchedule(rawDoctorId) {
    const doctorId = Number(rawDoctorId)
    setIsScheduleReady(false)
    setNotice(null)
    setSelectedDoctorId(doctorId || null)
    setSelectedShiftIds(new Set())
    setScheduleError('')

    if (!doctorId) {
      return
    }

    setIsLoadingSchedule(true)

    try {
      // Khi đổi bác sĩ, nạp lại cả ca dùng chung và lịch của bác sĩ để checkbox dựa trên dữ liệu mới nhất.
      const [latestShifts, doctorShifts] = await Promise.all([getShifts(), getDoctorShifts(doctorId)])
      const normalizedShifts = Array.isArray(latestShifts) ? latestShifts : []
      setShifts(normalizedShifts)
      setShiftsError('')
      const activeShiftIds = new Set(normalizedShifts.filter((shift) => shift.isActive).map((shift) => shift.shiftId))

      // Lịch cũ có thể chứa ca vừa inactive. Không giữ các ID đó để tránh PUT bị 400.
      setSelectedShiftIds(new Set(doctorShifts.map((item) => item.shiftId).filter((shiftId) => activeShiftIds.has(shiftId))))
      setIsScheduleReady(true)
    } catch {
      setScheduleError('Không tải được lịch tuần. Chưa thể chỉnh sửa để tránh ghi đè lịch hiện có.')
    } finally {
      setIsLoadingSchedule(false)
    }
  }

  function toggleShift(shiftId) {
    setScheduleError('')
    setSelectedShiftIds((currentIds) => {
      const nextIds = new Set(currentIds)
      if (nextIds.has(shiftId)) {
        nextIds.delete(shiftId)
      } else {
        nextIds.add(shiftId)
      }
      return nextIds
    })
  }

  function selectAllActiveShifts() {
    setScheduleError('')
    setSelectedShiftIds(new Set(shifts.filter((shift) => shift.isActive).map((shift) => shift.shiftId)))
  }

  function clearSelectedShifts() {
    setScheduleError('')
    setSelectedShiftIds(new Set())
  }

  async function saveDoctorSchedule() {
    // Chỉ cho lưu khi đã đọc thành công lịch hiện tại của đúng bác sĩ.
    if (!selectedDoctorId || !isScheduleReady || isLoadingSchedule || isSavingSchedule) {
      return
    }

    const activeShiftIds = new Set(shifts.filter((shift) => shift.isActive).map((shift) => shift.shiftId))
    const shiftIds = [...selectedShiftIds].filter((shiftId) => activeShiftIds.has(shiftId))
    setIsSavingSchedule(true)
    setScheduleError('')
    setNotice(null)

    try {
      const savedDoctorShifts = await replaceDoctorShifts(selectedDoctorId, shiftIds)
      setSelectedShiftIds(new Set(savedDoctorShifts.map((item) => item.shiftId)))
      setNotice({ type: 'success', message: 'Đã lưu lịch tuần của bác sĩ.' })
    } catch (error) {
      // Không đổi selectedShiftIds khi lỗi để admin còn có thể sửa và lưu lại.
      setScheduleError(getScheduleErrorMessage(error))
    } finally {
      setIsSavingSchedule(false)
    }
  }

  return (
    <section className="admin-page">

      <div>
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(--ink) sm:text-3xl">Ca làm việc & lịch bác sĩ</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Thiết lập các ca dùng chung, sau đó phân công lịch lặp lại hằng tuần cho từng bác sĩ.
            </p>
          </div>
          {activeTab === 'shifts' && (
            <button
              type="button"
              onClick={openCreateShiftForm}
              disabled={isSavingShift || shiftActionId !== null}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--brand) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-(--brand-strong) disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Thêm ca làm việc
            </button>
          )}
        </div>

        <div role="group" aria-label="Chế độ xem lịch" className="mb-5 flex w-fit max-w-full rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            aria-pressed={activeTab === 'schedule'}
            disabled={isLoadingSchedule || isSavingSchedule || isSavingShift || shiftActionId !== null}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'schedule' ? 'bg-(--brand) text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            Lịch tuần bác sĩ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shifts')}
            aria-pressed={activeTab === 'shifts'}
            disabled={isLoadingSchedule || isSavingSchedule || isSavingShift || shiftActionId !== null}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'shifts' ? 'bg-(--brand) text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings2 className="h-4 w-4" />
            Ca làm việc
          </button>
        </div>

        <div className="space-y-5">
          <Notice notice={isShiftFormOpen ? null : notice} />

          {activeTab === 'shifts' && (
            <>
              {shiftsError ? (
                <section className="rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
                  <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
                  <h2 className="mt-3 font-bold text-(--ink)">Không tải được danh sách ca</h2>
                  <p className="mt-1 text-sm text-slate-500">{shiftsError}</p>
                  <button
                    type="button"
                    onClick={loadBaseData}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Thử tải lại
                  </button>
                </section>
              ) : (
                <div className="space-y-6">
                  <WeeklyShiftCalendar shifts={shifts} isLoading={isLoading} />
                  <div>
                    <h2 className="text-lg font-bold text-(--ink)">Danh sách chi tiết</h2>
                    <p className="mt-1 text-sm text-slate-500">Dùng bảng này khi cần sửa, tắt hoặc xóa một ca cụ thể.</p>
                  </div>
                  <ShiftsTable
                    shifts={shifts}
                    isLoading={isLoading}
                    actionId={shiftActionId}
                    onEdit={openEditShiftForm}
                    onDelete={removeShift}
                  />
                </div>
              )}
            </>
          )}

          {activeTab === 'schedule' && (
            <WeeklySchedulePanel
              doctors={doctors}
              shifts={shifts}
              selectedDoctorId={selectedDoctorId}
              selectedShiftIds={selectedShiftIds}
              isLoadingSchedule={isLoadingSchedule}
              isScheduleReady={isScheduleReady}
              onRetry={() => loadDoctorSchedule(selectedDoctorId)}
              isSaving={isSavingSchedule}
              scheduleError={scheduleError || shiftsError}
              doctorsError={doctorsError}
              onDoctorChange={loadDoctorSchedule}
              onToggleShift={toggleShift}
              onSelectAll={selectAllActiveShifts}
              onClearAll={clearSelectedShifts}
              onSave={saveDoctorSchedule}
            />
          )}
        </div>

        {isShiftFormOpen && (
          <ShiftForm
            key={selectedShift?.shiftId ?? 'new'}
            shift={selectedShift}
            shifts={shifts}
            isSaving={isSavingShift}
            onSave={saveShift}
            errorMessage={notice?.type === 'error' ? notice.message : ''}
            onCancel={closeShiftForm}
          />
        )}
      </div>
    </section>
  )
}

export default ShiftSchedulesPage
