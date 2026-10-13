import Notice from '../../../components/ui/Notice'
import { getErrorMessage } from '../../../lib/apiClient'
import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, ClipboardList, Plus, RefreshCw } from 'lucide-react'
import { getDoctors } from '../../doctors/api/doctorsApi'
import {
  createNonWorkingDay,
  deleteNonWorkingDay,
  getNonWorkingDays,
  updateNonWorkingDay,
} from '../api/nonWorkingDaysApi'
import NonWorkingDayForm from '../components/NonWorkingDayForm'
import NonWorkingDaysCalendar from '../components/NonWorkingDaysCalendar'
import NonWorkingDaysTable from '../components/NonWorkingDaysTable'

const ERROR_MESSAGES = {
  400: 'Dữ liệu lịch nghỉ chưa hợp lệ. Vui lòng kiểm tra các trường được đánh dấu.',
  404: 'Lịch nghỉ hoặc bác sĩ không tồn tại hoặc đã bị thay đổi.',
}

function NonWorkingDaysPage() {
  const [nonWorkingDays, setNonWorkingDays] = useState([])
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [doctorsError, setDoctorsError] = useState('')
  const [notice, setNotice] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedNonWorkingDay, setSelectedNonWorkingDay] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [actionId, setActionId] = useState(null)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')
    setDoctorsError('')

    // Danh sách ngày nghỉ và bác sĩ không phụ thuộc nhau: vẫn cho tạo lịch nghỉ toàn viện nếu API bác sĩ lỗi.
    const [nonWorkingDaysResult, doctorsResult] = await Promise.allSettled([getNonWorkingDays(), getDoctors()])

    if (nonWorkingDaysResult.status === 'fulfilled') {
      setNonWorkingDays(Array.isArray(nonWorkingDaysResult.value) ? nonWorkingDaysResult.value : [])
    } else {
      setLoadError(getErrorMessage(nonWorkingDaysResult.reason, ERROR_MESSAGES))
    }

    if (doctorsResult.status === 'fulfilled') {
      setDoctors(Array.isArray(doctorsResult.value) ? doctorsResult.value : [])
    } else {
      setDoctorsError('Không tải được bác sĩ. Bạn vẫn có thể tạo lịch nghỉ cho toàn bệnh viện.')
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    const timerId = window.setTimeout(loadData, 0)
    return () => window.clearTimeout(timerId)
  }, [loadData])

  function openCreateForm() {
    setSelectedNonWorkingDay(null)
    setNotice(null)
    setIsFormOpen(true)
  }

  function openEditForm(nonWorkingDay) {
    setSelectedNonWorkingDay(nonWorkingDay)
    setNotice(null)
    setIsFormOpen(true)
  }

  function closeForm() {
    if (!isSaving) {
      setIsFormOpen(false)
      setSelectedNonWorkingDay(null)
    }
  }

  async function saveNonWorkingDay(values) {
    setIsSaving(true)
    setNotice(null)

    try {
      // Object từ server chứa doctorFullName, vì vậy UI không cần tự gắn tên bác sĩ sau khi lưu.
      const savedNonWorkingDay = selectedNonWorkingDay
        ? await updateNonWorkingDay(selectedNonWorkingDay.nonWorkingDayId, values)
        : await createNonWorkingDay(values)

      setNonWorkingDays((currentItems) => {
        if (!selectedNonWorkingDay) {
          return [...currentItems, savedNonWorkingDay].sort((first, second) => first.date.localeCompare(second.date))
        }

        return currentItems
          .map((item) => (item.nonWorkingDayId === savedNonWorkingDay.nonWorkingDayId ? savedNonWorkingDay : item))
          .sort((first, second) => first.date.localeCompare(second.date))
      })
      setNotice({
        type: 'success',
        message: selectedNonWorkingDay ? 'Đã cập nhật lịch nghỉ.' : 'Đã thêm lịch nghỉ mới.',
      })
      setIsFormOpen(false)
      setSelectedNonWorkingDay(null)
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, ERROR_MESSAGES) })
      // Ném lỗi lại để modal có thể gắn lỗi ASP.NET vào đúng field.
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  async function removeNonWorkingDay(nonWorkingDay) {
    const scope = nonWorkingDay.doctorId === null ? 'toàn bệnh viện' : `bác sĩ ${nonWorkingDay.doctorFullName || ''}`
    const shouldDelete = window.confirm(`Hủy lịch nghỉ ${scope} vào ngày ${nonWorkingDay.date}?`)
    if (!shouldDelete) {
      return
    }

    setActionId(nonWorkingDay.nonWorkingDayId)
    setNotice(null)

    try {
      await deleteNonWorkingDay(nonWorkingDay.nonWorkingDayId)
      // DELETE là soft delete; item đã hủy không còn được API GET trả về nên bỏ khỏi state hiện tại.
      setNonWorkingDays((currentItems) => currentItems.filter((item) => item.nonWorkingDayId !== nonWorkingDay.nonWorkingDayId))
      setNotice({ type: 'success', message: 'Đã hủy lịch nghỉ.' })
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, ERROR_MESSAGES) })
    } finally {
      setActionId(null)
    }
  }

  function goToPreviousMonth() {
    setCalendarMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  function goToNextMonth() {
    setCalendarMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  return (
    <section className="admin-page">

      <div>
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(--ink) sm:text-3xl">Ngày không làm việc</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Ghi nhận ngày nghỉ riêng của bác sĩ hoặc ngày cả bệnh viện không nhận khám.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            disabled={isSaving || actionId !== null}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--brand) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-(--brand-strong) disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Thêm lịch nghỉ
          </button>
        </div>

        <div className="space-y-6">
          <Notice notice={isFormOpen ? null : notice} />

          {doctorsError && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{doctorsError}</p>
            </div>
          )}

          {loadError ? (
            <section className="rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
              <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
              <h2 className="mt-3 font-bold text-(--ink)">Không tải được lịch nghỉ</h2>
              <p className="mt-1 text-sm text-slate-500">{loadError}</p>
              <button
                type="button"
                onClick={loadData}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Thử tải lại
              </button>
            </section>
          ) : (
            <>
              <NonWorkingDaysCalendar
                month={calendarMonth}
                nonWorkingDays={nonWorkingDays}
                onPreviousMonth={goToPreviousMonth}
                onNextMonth={goToNextMonth}
              />
              <div>
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-blue-700" />
                  <h2 className="text-lg font-bold text-(--ink)">Danh sách lịch nghỉ</h2>
                </div>
                <p className="mt-1 text-sm text-slate-500">Các ngày đã diễn ra được giữ để xem lịch sử và không còn được chỉnh sửa.</p>
              </div>
              <NonWorkingDaysTable
                nonWorkingDays={nonWorkingDays}
                isLoading={isLoading}
                actionId={actionId}
                onEdit={openEditForm}
                onDelete={removeNonWorkingDay}
              />
            </>
          )}
        </div>

        {isFormOpen && (
          <NonWorkingDayForm
            key={selectedNonWorkingDay?.nonWorkingDayId ?? 'new'}
            nonWorkingDay={selectedNonWorkingDay}
            doctors={doctors}
            nonWorkingDays={nonWorkingDays}
            isSaving={isSaving}
            onSave={saveNonWorkingDay}
            errorMessage={notice?.type === 'error' ? notice.message : ''}
            onCancel={closeForm}
          />
        )}
      </div>
    </section>
  )
}

export default NonWorkingDaysPage
