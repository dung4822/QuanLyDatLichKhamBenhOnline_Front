import { Edit3, Power, RotateCcw } from 'lucide-react'
import StatusBadge from './StatusBadge'

function formatDate(value) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function LoadingRows() {
  return Array.from({ length: 4 }, (_, index) => (
    <tr key={index} className="animate-pulse border-b border-slate-100">
      {Array.from({ length: 7 }, (_, cellIndex) => (
        <td key={cellIndex} className="px-5 py-5">
          <div className="h-4 rounded bg-slate-100" />
        </td>
      ))}
    </tr>
  ))
}

function SpecialtiesTable({ specialties, isLoading, actionId, onEdit, onDeactivate, onReactivate }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[960px] w-full border-collapse text-left">
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr className="text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-4">ID</th>
              <th className="px-5 py-4">Tên chuyên khoa</th>
              <th className="px-5 py-4">Mô tả</th>
              <th className="px-5 py-4">Trạng thái</th>
              <th className="px-5 py-4">Ngày tạo</th>
              <th className="px-5 py-4">Ngày cập nhật</th>
              <th className="px-5 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <LoadingRows />}

            {!isLoading && specialties.length === 0 && (
              <tr>
                <td colSpan="7" className="px-5 py-14 text-center text-sm text-slate-500">
                  Chưa có chuyên khoa nào. Hãy thêm chuyên khoa đầu tiên.
                </td>
              </tr>
            )}

            {!isLoading &&
              specialties.map((specialty) => {
                const isPending = actionId === specialty.specialtyId
                const isActive = specialty.status === 'Active'

                return (
                  <tr key={specialty.specialtyId} className="text-sm text-slate-600 transition hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-medium text-slate-500">#{specialty.specialtyId}</td>
                    <td className="px-5 py-4 font-semibold text-[#1D3557]">{specialty.name}</td>
                    <td className="max-w-xs px-5 py-4 leading-5 text-slate-500">
                      {specialty.description || <span className="text-slate-400">Chưa có mô tả</span>}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={specialty.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">{formatDate(specialty.createdAt)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">{formatDate(specialty.updatedAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(specialty)}
                          disabled={actionId !== null}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Sửa
                        </button>

                        {isActive ? (
                          <button
                            type="button"
                            onClick={() => onDeactivate(specialty)}
                            disabled={actionId !== null}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Power className="h-3.5 w-3.5" />
                            {isPending ? 'Đang xử lý...' : 'Ngừng dùng'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onReactivate(specialty)}
                            disabled={actionId !== null}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            {isPending ? 'Đang xử lý...' : 'Kích hoạt lại'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SpecialtiesTable
