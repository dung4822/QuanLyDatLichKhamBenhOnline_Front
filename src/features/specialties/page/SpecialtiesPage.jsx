import SearchInput from '../../../components/ui/SearchInput'
import { getErrorMessage } from '../../../lib/apiClient'
import Notice from '../../../components/ui/Notice'
import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Plus, RefreshCw } from 'lucide-react'
import {
  createSpecialty,
  deleteSpecialty,
  getSpecialties,
  updateSpecialty,
} from '../api/specialtiesApi'
import SpecialtyForm from '../components/SpecialtyForm'
import SpecialtiesTable from '../components/SpecialtiesTable'

const ERROR_MESSAGES = {
  400: 'Dữ liệu chuyên khoa chưa hợp lệ. Vui lòng kiểm tra các trường được đánh dấu.',
  404: 'Chuyên khoa không tồn tại hoặc đã bị thay đổi.',
}

function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  // Derived state: lọc trực tiếp từ danh sách gốc, không lưu thêm một state dễ bị lệch.
  const query = searchTerm.trim().toLocaleLowerCase('vi')
  const visibleItems = specialties.filter((item) =>
    [item.name, item.description].some((value) => (value || '').toLocaleLowerCase('vi').includes(query)),
  )
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
      setLoadError(getErrorMessage(error, ERROR_MESSAGES))
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
      setNotice({ type: 'error', message: getErrorMessage(error, ERROR_MESSAGES) })
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
      setNotice({ type: 'error', message: getErrorMessage(error, ERROR_MESSAGES) })
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
            <h1 className="text-2xl font-bold tracking-tight text-(--ink) sm:text-3xl">Chuyên khoa</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Thêm, cập nhật hoặc ngừng sử dụng các chuyên khoa hiển thị trong hệ thống.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            disabled={isSaving || actionId !== null}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--brand) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-(--brand-strong) disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Thêm chuyên khoa
          </button>
        </div>

        <div className="space-y-5">
          <Notice notice={isFormOpen ? null : notice} />

          {!loadError && (
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              label="Tìm tên hoặc mô tả chuyên khoa…"
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
                onClick={loadSpecialties}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                Thử tải lại
              </button>
            </section>
          ) : (
            <SpecialtiesTable
              specialties={visibleItems}
              emptyMessage={query ? 'Không tìm thấy kết quả. Thử từ khóa khác hoặc xóa bộ lọc.' : undefined}
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
              errorMessage={notice?.type === 'error' ? notice.message : ''}
              onCancel={closeForm}
            />
          )}
        </div>
      </div>
    </section>
  )
}

export default SpecialtiesPage
