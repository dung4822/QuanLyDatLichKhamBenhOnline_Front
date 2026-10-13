import SearchInput from '../../../components/ui/SearchInput'
import { getErrorMessage } from '../../../lib/apiClient'
import Notice from '../../../components/ui/Notice'
import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Plus, RefreshCw } from 'lucide-react'
import { getSpecialties } from '../../specialties/api/specialtiesApi'
import { createDoctor, deleteDoctor, getDoctors, updateDoctor } from '../api/doctorsApi'
import DoctorForm from '../components/DoctorForm'
import DoctorsTable from '../components/DoctorsTable'

const ERROR_MESSAGES = {
  400: 'Dữ liệu bác sĩ chưa hợp lệ. Vui lòng kiểm tra các trường được đánh dấu.',
  404: 'Bác sĩ không tồn tại hoặc đã bị xóa.',
  413: 'Ảnh đại diện quá lớn. Vui lòng chọn ảnh tối đa 5 MB.',
}

function DoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  // Derived state: lọc trực tiếp từ danh sách gốc, không lưu thêm một state dễ bị lệch.
  const query = searchTerm.trim().toLocaleLowerCase('vi')
  const visibleItems = doctors.filter((item) =>
    [item.fullName, item.email, item.phoneNumber].some((value) => (value || '').toLocaleLowerCase('vi').includes(query)),
  )
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [specialtiesError, setSpecialtiesError] = useState('')
  const [notice, setNotice] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [actionId, setActionId] = useState(null)

  const activeSpecialties = specialties.filter((specialty) => specialty.status === 'Active')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')
    setSpecialtiesError('')

    // Hai danh sách độc lập: lỗi chuyên khoa không nên làm mất bảng bác sĩ đã tải được.
    const [doctorsResult, specialtiesResult] = await Promise.allSettled([getDoctors(), getSpecialties()])

    if (doctorsResult.status === 'fulfilled') {
      setDoctors(Array.isArray(doctorsResult.value) ? doctorsResult.value : [])
    } else {
      setLoadError(getErrorMessage(doctorsResult.reason, ERROR_MESSAGES))
    }

    if (specialtiesResult.status === 'fulfilled') {
      setSpecialties(Array.isArray(specialtiesResult.value) ? specialtiesResult.value : [])
    } else {
      setSpecialtiesError('Không tải được chuyên khoa, nên chưa thể thêm hoặc sửa bác sĩ.')
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    const timerId = window.setTimeout(loadData, 0)
    return () => window.clearTimeout(timerId)
  }, [loadData])

  function canOpenForm() {
    if (activeSpecialties.length === 0) {
      setNotice({
        type: 'error',
        message: specialtiesError || 'Cần có ít nhất một chuyên khoa đang sử dụng trước khi tạo hồ sơ bác sĩ.',
      })
      return false
    }

    return true
  }

  function openCreateForm() {
    if (!canOpenForm()) {
      return
    }

    setSelectedDoctor(null)
    setNotice(null)
    setIsFormOpen(true)
  }

  function openEditForm(doctor) {
    if (!canOpenForm()) {
      return
    }

    setSelectedDoctor(doctor)
    setNotice(null)
    setIsFormOpen(true)
  }

  function closeForm() {
    if (!isSaving) {
      setIsFormOpen(false)
      setSelectedDoctor(null)
    }
  }

  async function saveDoctor(formData) {
    setIsSaving(true)
    setNotice(null)

    try {
      // Chỉ cập nhật state bằng object server trả về, vì experience được backend tự tính.
      const savedDoctor = selectedDoctor
        ? await updateDoctor(selectedDoctor.doctorId, formData)
        : await createDoctor(formData)

      setDoctors((currentDoctors) => {
        if (!selectedDoctor) {
          return [savedDoctor, ...currentDoctors]
        }

        return currentDoctors.map((doctor) =>
          doctor.doctorId === savedDoctor.doctorId ? savedDoctor : doctor,
        )
      })
      setNotice({
        type: 'success',
        message: selectedDoctor ? 'Đã cập nhật hồ sơ bác sĩ.' : 'Đã thêm bác sĩ mới.',
      })
      setIsFormOpen(false)
      setSelectedDoctor(null)
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, ERROR_MESSAGES) })
      // Để form có thể gắn lỗi validation 400 vào đúng input.
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  async function removeDoctor(doctor) {
    const shouldDelete = window.confirm(`Xóa bác sĩ “${doctor.fullName}”? Thao tác này sẽ ngừng hiển thị hồ sơ trong danh sách.`)
    if (!shouldDelete) {
      return
    }

    setActionId(doctor.doctorId)
    setNotice(null)

    try {
      await deleteDoctor(doctor.doctorId)

      // DELETE trả 204; theo contract, item đã soft-delete sẽ không xuất hiện trong GET danh sách.
      setDoctors((currentDoctors) => currentDoctors.filter((item) => item.doctorId !== doctor.doctorId))
      setNotice({ type: 'success', message: 'Đã xóa bác sĩ khỏi danh sách.' })
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, ERROR_MESSAGES) })
    } finally {
      setActionId(null)
    }
  }

  return (
    <section className="admin-page">

      <div>
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-(--ink) sm:text-3xl">Bác sĩ</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Quản lý hồ sơ, thông tin liên hệ và ảnh đại diện của bác sĩ trong hệ thống.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            disabled={isSaving || actionId !== null}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--brand) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-(--brand-strong) disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Thêm bác sĩ
          </button>
        </div>

        <div className="space-y-5">
          <Notice notice={isFormOpen ? null : notice} />

          {specialtiesError && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{specialtiesError}</p>
            </div>
          )}

          {!loadError && (
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              label="Tìm tên, email hoặc số điện thoại…"
              resultCount={visibleItems.length}
              disabled={isLoading}
            />
          )}

          {loadError ? (
            <section className="rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
              <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
              <h2 className="mt-3 font-bold text-(--ink)">Không tải được danh sách</h2>
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
            <DoctorsTable
              doctors={visibleItems}
              emptyMessage={query ? 'Không tìm thấy kết quả. Thử từ khóa khác hoặc xóa bộ lọc.' : undefined}
              isLoading={isLoading}
              actionId={actionId}
              onEdit={openEditForm}
              onDelete={removeDoctor}
            />
          )}

          {isFormOpen && (
            <DoctorForm
              key={selectedDoctor?.doctorId ?? 'new'}
              doctor={selectedDoctor}
              specialties={activeSpecialties}
              isSaving={isSaving}
              onSave={saveDoctor}
              errorMessage={notice?.type === 'error' ? notice.message : ''}
              onCancel={closeForm}
            />
          )}
        </div>
      </div>
    </section>
  )
}

export default DoctorsPage
