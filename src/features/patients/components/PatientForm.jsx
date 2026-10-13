import { useState } from 'react'
import { getFieldErrors } from '../../../lib/apiClient'
import { AlertCircle, Save } from 'lucide-react'
import Modal from '../../../components/ui/Modal'

const EMPTY_FORM = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  phoneNumber: '',
  email: '',
  address: '',
}

function toFormValues(patient) {
  if (!patient) return EMPTY_FORM
  return {
    fullName: patient.fullName || '',
    dateOfBirth: patient.dateOfBirth || '',
    gender: patient.gender === 0 || patient.gender === 1 ? String(patient.gender) : '',
    phoneNumber: patient.phoneNumber || '',
    email: patient.email || '',
    address: patient.address || '',
  }
}

function validate(values) {
  const errors = {}
  const fullName = values.fullName.trim()
  const phoneNumber = values.phoneNumber.trim()
  const email = values.email.trim()
  const today = new Date()
  const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  if (fullName.length < 3 || fullName.length > 100) errors.fullName = 'Họ tên phải có từ 3 đến 100 ký tự.'
  if (!values.dateOfBirth) errors.dateOfBirth = 'Ngày sinh là bắt buộc.'
  else if (values.dateOfBirth > todayValue) errors.dateOfBirth = 'Ngày sinh không được sau hôm nay.'
  if (!['0', '1'].includes(values.gender)) errors.gender = 'Hãy chọn giới tính.'
  if (!phoneNumber) errors.phoneNumber = 'Số điện thoại là bắt buộc.'
  else if (phoneNumber.length > 20) errors.phoneNumber = 'Số điện thoại tối đa 20 ký tự.'
  if (email && email.length > 50) errors.email = 'Email tối đa 50 ký tự.'
  else if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Email chưa đúng định dạng.'
  if (values.address.trim().length > 255) errors.address = 'Địa chỉ tối đa 255 ký tự.'
  return errors
}

const SERVER_FIELDS = ['fullName', 'dateOfBirth', 'gender', 'phoneNumber', 'email', 'address']

function FieldError({ id, children }) {
  if (!children) return null
  return <p id={id} role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600"><AlertCircle className="h-3.5 w-3.5" />{children}</p>
}

export default function PatientForm({ patient, isSaving, onSave, onCancel, errorMessage }) {
  const [values, setValues] = useState(() => toFormValues(patient))
  const [errors, setErrors] = useState({})
  const [unmappedError, setUnmappedError] = useState('')
  const isEditing = Boolean(patient)

  function updateField(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setUnmappedError('')
    try {
      await onSave({
        fullName: values.fullName.trim(),
        dateOfBirth: values.dateOfBirth,
        gender: Number(values.gender),
        phoneNumber: values.phoneNumber.trim(),
        email: values.email.trim() || null,
        address: values.address.trim() || null,
      })
    } catch (error) {
      const serverErrors = getFieldErrors(error, SERVER_FIELDS)
      setErrors(serverErrors.fields)
      setUnmappedError(serverErrors.others.join(' '))
    }
  }

  const inputClass = (name) => `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-3 disabled:cursor-not-allowed disabled:bg-slate-100 ${errors[name] ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'}`

  return (
    <Modal
      title={isEditing ? 'Chỉnh sửa bệnh nhân' : 'Thêm bệnh nhân'}
      description={isEditing ? `Cập nhật thông tin của ${patient.fullName}.` : 'Tạo hồ sơ bệnh nhân mới trong hệ thống.'}
      isBusy={isSaving}
      errorMessage={unmappedError || errorMessage}
      onClose={onCancel}
      wide
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="patient-name" className="mb-1.5 block text-sm font-semibold">Họ và tên <span className="text-rose-600">*</span></label>
            <input id="patient-name" name="fullName" value={values.fullName} onChange={updateField} maxLength={100} disabled={isSaving} placeholder="Ví dụ: Nguyễn Văn An" aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'fullName-error' : undefined} className={inputClass('fullName')} />
            <FieldError id="fullName-error">{errors.fullName}</FieldError>
          </div>
          <div>
            <label htmlFor="patient-birth" className="mb-1.5 block text-sm font-semibold">Ngày sinh <span className="text-rose-600">*</span></label>
            <input id="patient-birth" name="dateOfBirth" type="date" value={values.dateOfBirth} onChange={updateField} disabled={isSaving} aria-invalid={Boolean(errors.dateOfBirth)} aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined} className={inputClass('dateOfBirth')} />
            <FieldError id="dateOfBirth-error">{errors.dateOfBirth}</FieldError>
          </div>
          <div>
            <label htmlFor="patient-gender" className="mb-1.5 block text-sm font-semibold">Giới tính <span className="text-rose-600">*</span></label>
            <select id="patient-gender" name="gender" value={values.gender} onChange={updateField} disabled={isSaving} aria-invalid={Boolean(errors.gender)} aria-describedby={errors.gender ? 'gender-error' : undefined} className={`${inputClass('gender')} bg-white`}>
              <option value="">Chọn giới tính</option><option value="0">Nam</option><option value="1">Nữ</option>
            </select>
            <FieldError id="gender-error">{errors.gender}</FieldError>
          </div>
          <div>
            <label htmlFor="patient-phone" className="mb-1.5 block text-sm font-semibold">Số điện thoại <span className="text-rose-600">*</span></label>
            <input id="patient-phone" name="phoneNumber" type="tel" value={values.phoneNumber} onChange={updateField} maxLength={20} disabled={isSaving} placeholder="0901234567" aria-invalid={Boolean(errors.phoneNumber)} aria-describedby={errors.phoneNumber ? 'phoneNumber-error' : undefined} className={inputClass('phoneNumber')} />
            <FieldError id="phoneNumber-error">{errors.phoneNumber}</FieldError>
          </div>
          <div>
            <label htmlFor="patient-email" className="mb-1.5 block text-sm font-semibold">Email</label>
            <input id="patient-email" name="email" type="email" value={values.email} onChange={updateField} maxLength={50} disabled={isSaving} placeholder="an@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} className={inputClass('email')} />
            <FieldError id="email-error">{errors.email}</FieldError>
          </div>
          <div className="sm:col-span-2">
            <div className="mb-1.5 flex items-center justify-between"><label htmlFor="patient-address" className="text-sm font-semibold">Địa chỉ</label><span className="text-xs text-slate-400">{values.address.length}/255</span></div>
            <textarea id="patient-address" name="address" value={values.address} onChange={updateField} maxLength={255} rows={3} disabled={isSaving} placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh" aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? 'address-error' : undefined} className={`${inputClass('address')} resize-none`} />
            <FieldError id="address-error">{errors.address}</FieldError>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={isSaving} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60">Hủy</button>
          <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--brand) px-4 py-2.5 text-sm font-semibold text-white hover:bg-(--brand-strong) disabled:cursor-wait disabled:opacity-70"><Save className="h-4 w-4" />{isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Thêm bệnh nhân'}</button>
        </div>
      </form>
    </Modal>
  )
}
