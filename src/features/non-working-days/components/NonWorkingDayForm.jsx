import { useState } from 'react'
import { AlertCircle, Building2, Save, Stethoscope, X } from 'lucide-react'
import { getTodayDateString, getTomorrowDateString } from '../utils'

const EMPTY_FORM = {
  date: '',
  scope: 'hospital',
  doctorId: '',
  reason: '',
}

function toFormValues(nonWorkingDay) {
  if (!nonWorkingDay) {
    return EMPTY_FORM
  }

  return {
    date: nonWorkingDay.date || '',
    scope: nonWorkingDay.doctorId === null ? 'hospital' : 'doctor',
    doctorId: nonWorkingDay.doctorId ? String(nonWorkingDay.doctorId) : '',
    reason: nonWorkingDay.reason || '',
  }
}

function validate(values, nonWorkingDays, editingId) {
  const errors = {}
  const today = getTodayDateString()
  const reason = values.reason.trim()

  if (!values.date) {
    errors.date = 'Ngày nghỉ là bắt buộc.'
  } else if (values.date <= today) {
    errors.date = 'Chỉ có thể tạo lịch nghỉ cho ngày trong tương lai.'
  }

  if (values.scope === 'doctor' && (!Number.isInteger(Number(values.doctorId)) || Number(values.doctorId) <= 0)) {
    errors.doctorId = 'Hãy chọn bác sĩ nghỉ.'
  }

  if (reason.length > 500) {
    errors.reason = 'Lý do tối đa 500 ký tự.'
  }

  const doctorId = values.scope === 'doctor' ? Number(values.doctorId) : null
  const hasDuplicate = nonWorkingDays.some(
    (item) => item.nonWorkingDayId !== editingId && item.date === values.date && item.doctorId === doctorId,
  )

  if (!errors.date && hasDuplicate) {
    errors.date = values.scope === 'hospital'
      ? 'Đã có lịch nghỉ toàn bệnh viện trong ngày này.'
      : 'Bác sĩ này đã có lịch nghỉ trong ngày này.'
  }

  return errors
}

function getServerValidationErrors(error) {
  const apiErrors = error?.data?.errors
  if (!apiErrors || typeof apiErrors !== 'object') {
    return {}
  }

  const fieldMap = { date: 'date', doctorid: 'doctorId', reason: 'reason' }

  return Object.entries(apiErrors).reduce((result, [key, messages]) => {
    const fieldName = fieldMap[key.toLowerCase()]
    if (fieldName) {
      result[fieldName] = Array.isArray(messages) ? messages[0] : messages
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

function NonWorkingDayForm({ nonWorkingDay, doctors, nonWorkingDays, isSaving, onSave, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(nonWorkingDay))
  const [errors, setErrors] = useState({})
  const isEditing = Boolean(nonWorkingDay)

  function updateField(event) {
    const { name, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }))
  }

  function changeScope(scope) {
    setValues((currentValues) => ({ ...currentValues, scope, doctorId: scope === 'hospital' ? '' : currentValues.doctorId }))
    setErrors((currentErrors) => ({ ...currentErrors, doctorId: undefined, date: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validate(values, nonWorkingDays, nonWorkingDay?.nonWorkingDayId)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const payload = {
      date: values.date,
      doctorId: values.scope === 'hospital' ? null : Number(values.doctorId),
      reason: values.reason.trim() || null,
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
        aria-labelledby="non-working-day-form-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="non-working-day-form-title" className="text-lg font-bold text-[#1D3557]">
              {isEditing ? 'Cập nhật lịch nghỉ' : 'Thêm lịch nghỉ'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Lịch nghỉ là ngoại lệ theo một ngày cụ thể, không làm thay đổi lịch tuần.</p>
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

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="non-working-date" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Ngày nghỉ <span className="text-rose-600">*</span>
            </label>
            <input
              id="non-working-date"
              name="date"
              type="date"
              min={getTomorrowDateString()}
              value={values.date}
              onChange={updateField}
              disabled={isSaving}
              className={inputClassName('date')}
            />
            <p className="mt-1.5 text-xs text-slate-500">Chỉ có thể tạo, sửa hoặc hủy lịch nghỉ cho ngày sau hôm nay.</p>
            <FieldError>{errors.date}</FieldError>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-700">Phạm vi nghỉ <span className="text-rose-600">*</span></legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => changeScope('hospital')}
                disabled={isSaving}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                  values.scope === 'hospital'
                    ? 'border-blue-300 bg-blue-50 ring-1 ring-blue-200'
                    : 'border-slate-200 hover:border-slate-300'
                } disabled:cursor-not-allowed`}
              >
                <Building2 className={`mt-0.5 h-5 w-5 ${values.scope === 'hospital' ? 'text-blue-700' : 'text-slate-400'}`} />
                <span>
                  <span className="block text-sm font-bold text-slate-700">Cả bệnh viện</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">Không bác sĩ nào có lịch nhận khám ngày này.</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => changeScope('doctor')}
                disabled={isSaving}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                  values.scope === 'doctor'
                    ? 'border-violet-300 bg-violet-50 ring-1 ring-violet-200'
                    : 'border-slate-200 hover:border-slate-300'
                } disabled:cursor-not-allowed`}
              >
                <Stethoscope className={`mt-0.5 h-5 w-5 ${values.scope === 'doctor' ? 'text-violet-700' : 'text-slate-400'}`} />
                <span>
                  <span className="block text-sm font-bold text-slate-700">Một bác sĩ</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">Chỉ bác sĩ được chọn không nhận khám ngày này.</span>
                </span>
              </button>
            </div>
          </fieldset>

          {values.scope === 'doctor' && (
            <div>
              <label htmlFor="non-working-doctor" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Bác sĩ nghỉ <span className="text-rose-600">*</span>
              </label>
              <select
                id="non-working-doctor"
                name="doctorId"
                value={values.doctorId}
                onChange={updateField}
                disabled={isSaving}
                className={`${inputClassName('doctorId')} bg-white`}
              >
                <option value="">Chọn bác sĩ</option>
                {doctors.map((doctor) => (
                  <option key={doctor.doctorId} value={doctor.doctorId}>
                    {doctor.fullName}
                  </option>
                ))}
              </select>
              <FieldError>{errors.doctorId}</FieldError>
            </div>
          )}

          <div>
            <label htmlFor="non-working-reason" className="mb-1.5 block text-sm font-semibold text-slate-700">Lý do</label>
            <textarea
              id="non-working-reason"
              name="reason"
              value={values.reason}
              onChange={updateField}
              maxLength={500}
              rows={4}
              disabled={isSaving}
              placeholder="Ví dụ: Quốc khánh, nghỉ phép, tham gia hội thảo..."
              className={`${inputClassName('reason')} resize-none`}
            />
            <div className="flex items-start justify-between gap-3">
              <FieldError>{errors.reason}</FieldError>
              <span className="mt-1.5 shrink-0 text-xs text-slate-400">{values.reason.length}/500</span>
            </div>
          </div>

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
              {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Thêm lịch nghỉ'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default NonWorkingDayForm
