import { useState } from 'react'
import { AlertCircle, Save, X } from 'lucide-react'

const EMPTY_FORM = {
  name: '',
  description: '',
  status: 'Active',
}

function toFormValues(specialty) {
  if (!specialty) {
    return EMPTY_FORM
  }

  return {
    name: specialty.name,
    description: specialty.description || '',
    status: specialty.status === 'Inactive' ? 'Inactive' : 'Active',
  }
}

function validate(values) {
  const errors = {}
  const name = values.name.trim()
  const description = values.description.trim()

  if (!name) {
    errors.name = 'Tên chuyên khoa là bắt buộc.'
  } else if (name.length > 50) {
    errors.name = 'Tên chuyên khoa tối đa 50 ký tự.'
  }

  if (description.length > 100) {
    errors.description = 'Mô tả tối đa 100 ký tự.'
  }

  return errors
}

function getServerValidationErrors(error) {
  const apiErrors = error?.data?.errors

  if (!apiErrors || typeof apiErrors !== 'object') {
    return {}
  }

  // ASP.NET có thể trả key là `Name` hoặc `name`, nên so sánh không phân biệt hoa/thường.
  return Object.entries(apiErrors).reduce((result, [key, messages]) => {
    const formKey = key.toLowerCase()
    if (formKey === 'name' || formKey === 'description' || formKey === 'status') {
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

function SpecialtyForm({ specialty, isSaving, onSave, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(specialty))
  const [errors, setErrors] = useState({})
  const isEditing = Boolean(specialty)

  function updateField(event) {
    const { name, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validate(values)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    // Chuẩn hoá ngay trước khi gửi: input rỗng phải thành `null` theo API contract.
    const payload = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      status: values.status,
    }

    setErrors({})

    try {
      await onSave(payload)
    } catch (error) {
      // Lỗi 400 từ ASP.NET được gắn đúng field; các lỗi khác hiển thị ở trang cha.
      const serverErrors = getServerValidationErrors(error)
      if (Object.keys(serverErrors).length > 0) {
        setErrors(serverErrors)
      }
    }
  }

  function handleBackdropClick(event) {
    // Chỉ đóng khi click đúng phần nền, không đóng khi người dùng click bên trong form.
    if (event.target === event.currentTarget) {
      onCancel()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
      onMouseDown={handleBackdropClick}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="specialty-form-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="specialty-form-title" className="text-lg font-bold text-[#1D3557]">
              {isEditing ? 'Cập nhật chuyên khoa' : 'Thêm chuyên khoa'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEditing ? 'Chỉnh sửa thông tin và lưu lại thay đổi.' : 'Điền thông tin cơ bản cho chuyên khoa mới.'}
            </p>
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
          <label htmlFor="specialty-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Tên chuyên khoa <span className="text-rose-600">*</span>
          </label>
          <input
            id="specialty-name"
            name="name"
            value={values.name}
            onChange={updateField}
            maxLength={50}
            disabled={isSaving}
            placeholder="Ví dụ: Da liễu"
            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-3 disabled:cursor-not-allowed disabled:bg-slate-50 ${
              errors.name
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
            }`}
          />
          <div className="flex items-start justify-between gap-3">
            <FieldError>{errors.name}</FieldError>
            <span className="mt-1.5 shrink-0 text-xs text-slate-400">{values.name.length}/50</span>
          </div>
        </div>

        <div>
          <label htmlFor="specialty-description" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Mô tả
          </label>
          <textarea
            id="specialty-description"
            name="description"
            value={values.description}
            onChange={updateField}
            maxLength={100}
            disabled={isSaving}
            rows={4}
            placeholder="Mô tả ngắn về phạm vi khám và điều trị."
            className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-3 disabled:cursor-not-allowed disabled:bg-slate-50 ${
              errors.description
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
            }`}
          />
          <div className="flex items-start justify-between gap-3">
            <FieldError>{errors.description}</FieldError>
            <span className="mt-1.5 shrink-0 text-xs text-slate-400">{values.description.length}/100</span>
          </div>
        </div>

        <div>
          <label htmlFor="specialty-status" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Trạng thái <span className="text-rose-600">*</span>
          </label>
          <select
            id="specialty-status"
            name="status"
            value={values.status}
            onChange={updateField}
            disabled={isSaving}
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:ring-3 disabled:cursor-not-allowed disabled:bg-slate-50 ${
              errors.status
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
            }`}
          >
            <option value="Active">Đang sử dụng</option>
            <option value="Inactive">Ngừng sử dụng</option>
          </select>
          <FieldError>{errors.status}</FieldError>
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
            {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Thêm chuyên khoa'}
          </button>
        </div>
        </form>
      </section>
    </div>
  )
}

export default SpecialtyForm
