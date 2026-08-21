import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, ClipboardList, Plus, RefreshCw, Stethoscope } from 'lucide-react'
import {
  createSpecialty,
  deleteSpecialty,
  getSpecialties,
  updateSpecialty,
} from '../api/specialtiesApi'
import SpecialtyForm from '../components/SpecialtyForm'
import SpecialtiesTable from '../components/SpecialtiesTable'

function getErrorMessage(error) {
  if (error?.status === 400) {
    return 'Tên chuyên khoa đã tồn tại hoặc dữ liệu không hợp lệ.'
  }

  if (error?.status === 404) {
    return 'Chuyên khoa không tồn tại hoặc đã bị thay đổi.'
  }

  return 'Không thể kết nối hoặc xử lý yêu cầu. Vui lòng thử lại.'
}

function Notice({ notice }) {
  if (!notice) {
    return null
  }

  const isSuccess = notice.type === 'success'
  const Icon = isSuccess ? CheckCircle2 : AlertCircle

  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-rose-200 bg-rose-50 text-rose-700'
      }`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <p>{notice.message}</p>
    </div>
  )
}

function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [actionId, setActionId] = useState(null)

  const loadSpecialties = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const data = await getSpecialties()
      setSpecialties(data)
    } catch (error) {
      setLoadError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Đưa lần tải đầu tiên sang lượt xử lý kế tiếp để effect chỉ quản lý vòng đời tải dữ liệu.
    const timerId = window.setTimeout(loadSpecialties, 0)
    return () => window.clearTimeout(timerId)
  }, [loadSpecialties])

  function openCreateForm() {
    setSelectedSpecialty(null)
    setNotice(null)
    setIsFormOpen(true)
  }

  function openEditForm(specialty) {
    setSelectedSpecialty(specialty)
    setNotice(null)
    setIsFormOpen(true)
  }

  function closeForm() {
    if (!isSaving) {
      setIsFormOpen(false)
      setSelectedSpecialty(null)
    }
  }

  async function saveSpecialty(values) {
    setIsSaving(true)
    setNotice(null)

    try {
      // Luôn dùng object backend trả về để state phía client khớp dữ liệu thật trên server.
      const savedSpecialty = selectedSpecialty
        ? await updateSpecialty(selectedSpecialty.specialtyId, values)
        : await createSpecialty(values)

      setSpecialties((currentSpecialties) => {
        if (!selectedSpecialty) {
          return [savedSpecialty, ...currentSpecialties]
        }

        return currentSpecialties.map((specialty) =>
          specialty.specialtyId === savedSpecialty.specialtyId ? savedSpecialty : specialty,
        )
      })
      setNotice({
        type: 'success',
        message: selectedSpecialty ? 'Đã cập nhật chuyên khoa.' : 'Đã thêm chuyên khoa mới.',
      })
      setIsFormOpen(false)
      setSelectedSpecialty(null)
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error) })
      // Form cần nhận lại lỗi để gắn lỗi 400 vào đúng ô nhập liệu.
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  async function deactivateSpecialty(specialty) {
    const shouldDeactivate = window.confirm(
      `Ngừng sử dụng chuyên khoa “${specialty.name}”? Bạn có thể kích hoạt lại sau bằng nút trong bảng.`,
    )

    if (!shouldDeactivate) {
      return
    }

    setActionId(specialty.specialtyId)
    setNotice(null)

    try {
      await deleteSpecialty(specialty.specialtyId)

      // DELETE trả 204, không có object mới. Cập nhật theo đúng soft-delete contract của API.
      setSpecialties((currentSpecialties) =>
        currentSpecialties.map((item) =>
          item.specialtyId === specialty.specialtyId
            ? { ...item, status: 'Inactive', updatedAt: new Date().toISOString() }
            : item,
        ),
      )
      setNotice({ type: 'success', message: 'Chuyên khoa đã được ngừng sử dụng.' })
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error) })
    } finally {
      setActionId(null)
    }
  }

  async function reactivateSpecialty(specialty) {
    setActionId(specialty.specialtyId)
    setNotice(null)

    try {
      // API không có endpoint “activate”, nên dùng PUT và gửi đủ 3 field bắt buộc.
      const updatedSpecialty = await updateSpecialty(specialty.specialtyId, {
        name: specialty.name,
        description: specialty.description,
        status: 'Active',
      })
      setSpecialties((currentSpecialties) =>
        currentSpecialties.map((item) =>
          item.specialtyId === updatedSpecialty.specialtyId ? updatedSpecialty : item,
        ),
      )
      setNotice({ type: 'success', message: 'Chuyên khoa đã được kích hoạt lại.' })
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error) })
    } finally {
      setActionId(null)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-700">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D3557] text-white shadow-sm">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold text-[#1D3557]">MediCare+</p>
              <p className="text-xs font-medium text-slate-500">Khu vực quản trị</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:inline-flex">
              Danh mục hệ thống
            </span>
            <a
              href="/"
              className="text-sm font-semibold text-slate-500 transition hover:text-blue-700"
            >
              Về trang chủ
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
              <ClipboardList className="h-4 w-4" />
              Quản lý danh mục
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1D3557] sm:text-3xl">Chuyên khoa</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Thêm, cập nhật hoặc ngừng sử dụng các chuyên khoa hiển thị trong hệ thống.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            disabled={isSaving || actionId !== null}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1D3557] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#112237] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Thêm chuyên khoa
          </button>
        </div>

        <div className="space-y-5">
          <Notice notice={notice} />

          {loadError ? (
            <section className="rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
              <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
              <h2 className="mt-3 font-bold text-[#1D3557]">Không tải được danh sách</h2>
              <p className="mt-1 text-sm text-slate-500">{loadError}</p>
              <button
                type="button"
                onClick={loadSpecialties}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Thử tải lại
              </button>
            </section>
          ) : (
            <SpecialtiesTable
              specialties={specialties}
              isLoading={isLoading}
              actionId={actionId}
              onEdit={openEditForm}
              onDeactivate={deactivateSpecialty}
              onReactivate={reactivateSpecialty}
            />
          )}

          {isFormOpen && (
            <SpecialtyForm
              key={selectedSpecialty?.specialtyId ?? 'new'}
              specialty={selectedSpecialty}
              isSaving={isSaving}
              onSave={saveSpecialty}
              onCancel={closeForm}
            />
          )}
        </div>
      </div>
    </main>
  )
}

export default SpecialtiesPage
