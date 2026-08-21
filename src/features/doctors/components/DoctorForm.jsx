import { useRef, useState } from 'react'
import { AlertCircle, Save, Trash2, UserRound, X } from 'lucide-react'

const EMPTY_FORM = {
  fullName: '',
  phoneNumber: '',
  email: '',
  gender: '',
  address: '',
  careerStartDate: '',
  specialtyId: '',
}

const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_AVATAR_SIZE = 5 * 1024 * 1024

function toFormValues(doctor) {
  if (!doctor) {
    return EMPTY_FORM
  }

  return {
    fullName: doctor.fullName || '',
    phoneNumber: doctor.phoneNumber || '',
    email: doctor.email || '',
    gender: String(doctor.gender),
    address: doctor.address || '',
    careerStartDate: doctor.careerStartDate || '',
    // API hiện chưa trả specialtyId. Để tránh gửi nhầm dữ liệu, không tự đoán giá trị này.
    specialtyId: '',
  }
}

function validate(values) {
  const errors = {}
  const fullName = values.fullName.trim()
  const email = values.email.trim()
  const careerStartDate = values.careerStartDate
  const selectedDate = careerStartDate ? new Date(`${careerStartDate}T00:00:00`) : null
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (fullName.length < 3 || fullName.length > 100) {
    errors.fullName = 'Họ tên phải có từ 3 đến 100 ký tự.'
  }

  if (values.phoneNumber.trim().length > 20) {
    errors.phoneNumber = 'Số điện thoại tối đa 20 ký tự.'
  }

  if (email) {
    if (email.length > 50) {
      errors.email = 'Email tối đa 50 ký tự.'
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Email chưa đúng định dạng.'
    }
  }

  if (values.gender !== '0' && values.gender !== '1') {
    errors.gender = 'Hãy chọn giới tính.'
  }

  if (values.address.trim().length > 255) {
    errors.address = 'Địa chỉ tối đa 255 ký tự.'
  }

  if (!careerStartDate || Number.isNaN(selectedDate?.getTime())) {
    errors.careerStartDate = 'Ngày bắt đầu nghề là bắt buộc.'
  } else if (selectedDate > today) {
    errors.careerStartDate = 'Ngày bắt đầu nghề không được ở tương lai.'
  }

  if (!Number.isInteger(Number(values.specialtyId)) || Number(values.specialtyId) <= 0) {
    errors.specialtyId = 'Hãy chọn chuyên khoa.'
  }

  return errors
}

function getServerValidationErrors(error) {
  const apiErrors = error?.data?.errors
  if (!apiErrors || typeof apiErrors !== 'object') {
    return {}
  }

  const fieldMap = {
    fullname: 'fullName',
    phonenumber: 'phoneNumber',
    email: 'email',
    gender: 'gender',
    address: 'address',
    careerstartdate: 'careerStartDate',
    specialtyid: 'specialtyId',
    avatar: 'avatar',
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

function createDoctorFormData(values, avatarFile, shouldRemoveAvatar, isEditing) {
  const formData = new FormData()

  formData.append('fullName', values.fullName.trim())
  formData.append('phoneNumber', values.phoneNumber.trim())
  formData.append('email', values.email.trim())
  formData.append('gender', values.gender)
  formData.append('address', values.address.trim())
  formData.append('careerStartDate', values.careerStartDate)
  formData.append('specialtyId', values.specialtyId)

  if (avatarFile) {
    formData.append('avatar', avatarFile)
  }

  if (isEditing) {
    formData.append('removeAvatar', String(!avatarFile && shouldRemoveAvatar))
  }

  return formData
}

function DoctorForm({ doctor, specialties, isSaving, onSave, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(doctor))
  const [errors, setErrors] = useState({})
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(() => doctor?.avatarUrl || '')
  const [shouldRemoveAvatar, setShouldRemoveAvatar] = useState(false)
  const avatarInputRef = useRef(null)
  const isEditing = Boolean(doctor)
  const hasExistingAvatar = Boolean(doctor?.avatarUrl)

  function updateField(event) {
    const { name, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }))
  }

  function selectAvatar(event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      setErrors((currentErrors) => ({ ...currentErrors, avatar: 'Chỉ nhận ảnh JPEG, PNG hoặc WebP.' }))
      return
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setErrors((currentErrors) => ({ ...currentErrors, avatar: 'Ảnh đại diện tối đa 5 MB.' }))
      return
    }

    setAvatarFile(file)
    setShouldRemoveAvatar(false)
    setErrors((currentErrors) => ({ ...currentErrors, avatar: undefined }))

    // FileReader tạo preview ngay trên trình duyệt; ảnh chỉ được upload khi người dùng bấm Lưu.
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)
  }

  function removeAvatar() {
    setAvatarFile(null)
    setAvatarPreview('')
    setShouldRemoveAvatar(hasExistingAvatar)
    setErrors((currentErrors) => ({ ...currentErrors, avatar: undefined }))

    if (avatarInputRef.current) {
      avatarInputRef.current.value = ''
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validate(values)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})

    try {
      const formData = createDoctorFormData(values, avatarFile, shouldRemoveAvatar, isEditing)
      await onSave(formData)
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
    `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-3 disabled:cursor-not-allowed disabled:bg-slate-50 ${
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
        aria-labelledby="doctor-form-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="doctor-form-title" className="text-lg font-bold text-[#1D3557]">
              {isEditing ? 'Cập nhật bác sĩ' : 'Thêm bác sĩ'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isEditing ? 'Cập nhật thông tin hồ sơ bác sĩ.' : 'Điền thông tin hồ sơ bác sĩ mới.'}
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

        {isEditing && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-5 text-amber-800">
            API hiện chưa trả chuyên khoa của bác sĩ. Hãy chọn lại chuyên khoa chính xác trước khi lưu.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="doctor-full-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Họ và tên <span className="text-rose-600">*</span>
              </label>
              <input
                id="doctor-full-name"
                name="fullName"
                value={values.fullName}
                onChange={updateField}
                maxLength={100}
                disabled={isSaving}
                placeholder="Ví dụ: Nguyễn Văn An"
                className={inputClassName('fullName')}
              />
              <FieldError>{errors.fullName}</FieldError>
            </div>

            <div>
              <label htmlFor="doctor-gender" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Giới tính <span className="text-rose-600">*</span>
              </label>
              <select
                id="doctor-gender"
                name="gender"
                value={values.gender}
                onChange={updateField}
                disabled={isSaving}
                className={`${inputClassName('gender')} bg-white`}
              >
                <option value="">Chọn giới tính</option>
                <option value="0">Nam</option>
                <option value="1">Nữ</option>
              </select>
              <FieldError>{errors.gender}</FieldError>
            </div>

            <div>
              <label htmlFor="doctor-career-start" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Ngày bắt đầu nghề <span className="text-rose-600">*</span>
              </label>
              <input
                id="doctor-career-start"
                name="careerStartDate"
                type="date"
                value={values.careerStartDate}
                onChange={updateField}
                disabled={isSaving}
                className={inputClassName('careerStartDate')}
              />
              <FieldError>{errors.careerStartDate}</FieldError>
            </div>

            <div>
              <label htmlFor="doctor-phone" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Số điện thoại
              </label>
              <input
                id="doctor-phone"
                name="phoneNumber"
                value={values.phoneNumber}
                onChange={updateField}
                maxLength={20}
                disabled={isSaving}
                placeholder="0901234567"
                className={inputClassName('phoneNumber')}
              />
              <FieldError>{errors.phoneNumber}</FieldError>
            </div>

            <div>
              <label htmlFor="doctor-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                id="doctor-email"
                name="email"
                type="email"
                value={values.email}
                onChange={updateField}
                maxLength={50}
                disabled={isSaving}
                placeholder="doctor@hospital.vn"
                className={inputClassName('email')}
              />
              <FieldError>{errors.email}</FieldError>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="doctor-specialty" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Chuyên khoa <span className="text-rose-600">*</span>
              </label>
              <select
                id="doctor-specialty"
                name="specialtyId"
                value={values.specialtyId}
                onChange={updateField}
                disabled={isSaving}
                className={`${inputClassName('specialtyId')} bg-white`}
              >
                <option value="">Chọn chuyên khoa đang sử dụng</option>
                {specialties.map((specialty) => (
                  <option key={specialty.specialtyId} value={specialty.specialtyId}>
                    {specialty.name}
                  </option>
                ))}
              </select>
              <FieldError>{errors.specialtyId}</FieldError>
            </div>
          </div>

          <div>
            <label htmlFor="doctor-address" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Địa chỉ
            </label>
            <textarea
              id="doctor-address"
              name="address"
              value={values.address}
              onChange={updateField}
              maxLength={255}
              disabled={isSaving}
              rows={3}
              placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh"
              className={`${inputClassName('address')} resize-none`}
            />
            <div className="flex items-start justify-between gap-3">
              <FieldError>{errors.address}</FieldError>
              <span className="mt-1.5 shrink-0 text-xs text-slate-400">{values.address.length}/255</span>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-semibold text-slate-700">Ảnh đại diện</p>
            <div className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-blue-700">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Xem trước ảnh đại diện" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-7 w-7" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <input
                  ref={avatarInputRef}
                  id="doctor-avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={selectAvatar}
                  disabled={isSaving}
                  className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-200 disabled:cursor-not-allowed"
                />
                <p className="mt-1.5 text-xs text-slate-500">JPEG, PNG hoặc WebP, tối đa 5 MB.</p>
              </div>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Xóa ảnh
                </button>
              )}
            </div>
            <FieldError>{errors.avatar}</FieldError>
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
              {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Thêm bác sĩ'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default DoctorForm
