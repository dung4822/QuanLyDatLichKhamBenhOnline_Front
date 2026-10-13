import Modal from '../../../components/ui/Modal'
import { getFieldErrors } from '../../../lib/apiClient'
import { useState } from 'react'
import { AlertCircle, Save } from 'lucide-react'
import { DAY_LABELS, WEEK_DAYS, toApiTime, toInputTime } from '../constants'

const EMPTY_FORM = {
  dayOfWeek: 'Monday',
  name: '',
  startTime: '',
  endTime: '',
  isActive: true,
}

function toFormValues(shift) {
  if (!shift) {
    return EMPTY_FORM
  }

  return {
    dayOfWeek: shift.dayOfWeek,
    name: shift.name || '',
    startTime: toInputTime(shift.startTime),
    endTime: toInputTime(shift.endTime),
    isActive: Boolean(shift.isActive),
  }
}

function validate(values) {
  const errors = {}
  const name = values.name.trim()

  if (!name) {
    errors.name = 'Tên ca là bắt buộc.'
  } else if (name.length > 100) {
    errors.name = 'Tên ca tối đa 100 ký tự.'
  }

  if (!values.startTime) {
    errors.startTime = 'Giờ bắt đầu là bắt buộc.'
  }

  if (!values.endTime) {
    errors.endTime = 'Giờ kết thúc là bắt buộc.'
  } else if (values.startTime && values.endTime <= values.startTime) {
    errors.endTime = 'Giờ kết thúc phải sau giờ bắt đầu.'
  }

  return errors
}

const SERVER_FIELDS = ['dayOfWeek', 'name', 'startTime', 'endTime', 'isActive']

function FieldError({ children, id }) {
  if (!children) {
    return null
  }

  return (
    <p id={id} role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
      <AlertCircle className="h-3.5 w-3.5" />
      {children}
    </p>
  )
}

function findOverlap(values, shifts, editingShiftId) {
  if (!values.startTime || !values.endTime) {
    return null
  }

  return shifts.find(
    (shift) =>
      shift.isActive &&
      shift.shiftId !== editingShiftId &&
      shift.dayOfWeek === values.dayOfWeek &&
      values.startTime < toInputTime(shift.endTime) &&
      values.endTime > toInputTime(shift.startTime),
  )
}

function ShiftForm({ shift, shifts, isSaving, onSave, onCancel, errorMessage }) {
  const [values, setValues] = useState(() => toFormValues(shift))
  const [errors, setErrors] = useState({})
  const isEditing = Boolean(shift)
  const overlapShift = findOverlap(values, shifts, shift?.shiftId)

  function updateField(event) {
    const { name, value, checked, type } = event.target
    const nextValue = type === 'checkbox' ? checked : value
    setValues((currentValues) => ({ ...currentValues, [name]: nextValue }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validate(values)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const payload = {
      dayOfWeek: values.dayOfWeek,
      name: values.name.trim(),
      startTime: toApiTime(values.startTime),
      endTime: toApiTime(values.endTime),
      isActive: values.isActive,
    }

    setErrors({})

    try {
      await onSave(payload)
    } catch (error) {
      const serverErrors = getFieldErrors(error, SERVER_FIELDS).fields
      if (Object.keys(serverErrors).length > 0) {
        setErrors(serverErrors)
      }
    }
  }

  const inputClassName = (fieldName) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:ring-3 disabled:cursor-not-allowed disabled:bg-slate-50 ${
      errors[fieldName]
        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
    }`

  return (
    <Modal
      title={isEditing ? 'Cập nhật ca làm việc' : 'Thêm ca làm việc'}
      description="Ca làm việc này sẽ lặp lại vào cùng một ngày mỗi tuần."
      isBusy={isSaving}
      onClose={onCancel}
      errorMessage={errorMessage}
    >
      {overlapShift && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-5 text-amber-800">
          Khung giờ này đang chồng với ca “{overlapShift.name}”. Hãy kiểm tra lại giờ bắt đầu và kết thúc trước khi lưu.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="shift-day" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Ngày trong tuần <span className="text-rose-600">*</span>
            </label>
            <select
              id="shift-day"
              name="dayOfWeek"
              aria-invalid={Boolean(errors.dayOfWeek)}
              aria-describedby={errors.dayOfWeek ? 'dayOfWeek-error' : undefined}
              value={values.dayOfWeek}
              onChange={updateField}
              disabled={isSaving}
              className={`${inputClassName('dayOfWeek')} bg-white`}
            >
              {WEEK_DAYS.map((day) => (
                <option key={day} value={day}>
                  {DAY_LABELS[day]}
                </option>
              ))}
            </select>
            <FieldError id="dayOfWeek-error">{errors.dayOfWeek}</FieldError>
          </div>

          <div>
            <label htmlFor="shift-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Tên ca <span className="text-rose-600">*</span>
            </label>
            <input
              id="shift-name"
              name="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
              value={values.name}
              onChange={updateField}
              maxLength={100}
              disabled={isSaving}
              placeholder="Ví dụ: Ca sáng"
              className={inputClassName('name')}
            />
            <FieldError id="name-error">{errors.name}</FieldError>
          </div>

          <div>
            <label htmlFor="shift-start" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Giờ bắt đầu <span className="text-rose-600">*</span>
            </label>
            <input
              id="shift-start"
              name="startTime"
              aria-invalid={Boolean(errors.startTime)}
              aria-describedby={errors.startTime ? 'startTime-error' : undefined}
              type="time"
              value={values.startTime}
              onChange={updateField}
              disabled={isSaving}
              className={inputClassName('startTime')}
            />
            <FieldError id="startTime-error">{errors.startTime}</FieldError>
          </div>

          <div>
            <label htmlFor="shift-end" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Giờ kết thúc <span className="text-rose-600">*</span>
            </label>
            <input
              id="shift-end"
              name="endTime"
              aria-invalid={Boolean(errors.endTime)}
              aria-describedby={errors.endTime ? 'endTime-error' : undefined}
              type="time"
              value={values.endTime}
              onChange={updateField}
              disabled={isSaving}
              className={inputClassName('endTime')}
            />
            <FieldError id="endTime-error">{errors.endTime}</FieldError>
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span>
            <span className="block text-sm font-semibold text-slate-700">Đang hoạt động</span>
            <span className="mt-0.5 block text-xs text-slate-500">Ca ngừng hoạt động vẫn hiển thị nhưng không thể được phân công mới.</span>
          </span>
          <input
            name="isActive"
            aria-invalid={Boolean(errors.isActive)}
            aria-describedby={errors.isActive ? 'isActive-error' : undefined}
            type="checkbox"
            checked={values.isActive}
            onChange={updateField}
            disabled={isSaving}
            className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
          />
        </label>
        <FieldError id="isActive-error">{errors.isActive}</FieldError>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--brand) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--brand-strong) disabled:cursor-wait disabled:opacity-70"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Thêm ca'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ShiftForm
