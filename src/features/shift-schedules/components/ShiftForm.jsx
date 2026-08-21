import { useState } from 'react'
import { AlertCircle, Save, X } from 'lucide-react'
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

function getServerValidationErrors(error) {
  const apiErrors = error?.data?.errors
  if (!apiErrors || typeof apiErrors !== 'object') {
    return {}
  }

  const fieldMap = {
    dayofweek: 'dayOfWeek',
    name: 'name',
    starttime: 'startTime',
    endtime: 'endTime',
    isactive: 'isActive',
  }

  return Object.entries(apiErrors).reduce((result, [key, messages]) => {
    const formKey = fieldMap[key.toLowerCase()]
    if (formKey) {
      result[formKey] = Array.isArray(messages) ? messages[0] : messages
    }
    return result
  }, {})
}

function FieldError({ children }) {
  if (!children) {
    return null
  }

  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
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

function ShiftForm({ shift, shifts, isSaving, onSave, onCancel }) {
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
      const serverErrors = getServerValidationErrors(error)
      if (Object.keys(serverErrors).length > 0) {
        setErrors(serverErrors)
      }
    }
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onCancel()
    }
  }

  const inputClassName = (fieldName) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:ring-3 disabled:cursor-not-allowed disabled:bg-slate-50 ${
      errors[fieldName]
        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
    }`

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
      onMouseDown={handleBackdropClick}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="shift-form-title"
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="shift-form-title" className="text-lg font-bold text-[#1D3557]">
              {isEditing ? 'Cập nhật ca làm việc' : 'Thêm ca làm việc'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Một ca là khuôn mẫu lặp lại hằng tuần, không phải lịch theo ngày cụ thể.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            aria-label="Đóng biểu mẫu"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {overlapShift && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-5 text-amber-800">
            Khung giờ này đang chồng với ca “{overlapShift.name}”. Backend chưa tự chặn overlap, hãy kiểm tra trước khi lưu.
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
              <FieldError>{errors.dayOfWeek}</FieldError>
            </div>

            <div>
              <label htmlFor="shift-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Tên ca <span className="text-rose-600">*</span>
              </label>
              <input
                id="shift-name"
                name="name"
                value={values.name}
                onChange={updateField}
                maxLength={100}
                disabled={isSaving}
                placeholder="Ví dụ: Ca sáng"
                className={inputClassName('name')}
              />
              <FieldError>{errors.name}</FieldError>
            </div>

            <div>
              <label htmlFor="shift-start" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Giờ bắt đầu <span className="text-rose-600">*</span>
              </label>
              <input
                id="shift-start"
                name="startTime"
                type="time"
                value={values.startTime}
                onChange={updateField}
                disabled={isSaving}
                className={inputClassName('startTime')}
              />
              <FieldError>{errors.startTime}</FieldError>
            </div>

            <div>
              <label htmlFor="shift-end" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Giờ kết thúc <span className="text-rose-600">*</span>
              </label>
              <input
                id="shift-end"
                name="endTime"
                type="time"
                value={values.endTime}
                onChange={updateField}
                disabled={isSaving}
                className={inputClassName('endTime')}
              />
              <FieldError>{errors.endTime}</FieldError>
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span>
              <span className="block text-sm font-semibold text-slate-700">Đang hoạt động</span>
              <span className="mt-0.5 block text-xs text-slate-500">Ca inactive vẫn hiển thị nhưng không thể được phân công mới.</span>
            </span>
            <input
              name="isActive"
              type="checkbox"
              checked={values.isActive}
              onChange={updateField}
              disabled={isSaving}
              className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
            />
          </label>

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
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1D3557] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#112237] disabled:cursor-wait disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Thêm ca'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ShiftForm
