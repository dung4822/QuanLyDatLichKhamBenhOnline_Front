import { Edit3, Trash2 } from 'lucide-react'
import { DAY_LABELS, formatShiftTime } from '../constants'

function LoadingRows() {
  return Array.from({ length: 4 }, (_, index) => (
    <tr key={index} className="animate-pulse border-b border-slate-100">
      {Array.from({ length: 5 }, (_, cellIndex) => (
        <td key={cellIndex} className="px-5 py-5">
          <div className="h-4 rounded bg-slate-100" />
        </td>
      ))}
    </tr>
  ))
}

function ShiftsTable({ shifts, isLoading, actionId, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full border-collapse text-left">
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr className="text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-4">Ngày</th>
              <th className="px-5 py-4">Tên ca</th>
              <th className="px-5 py-4">Khung giờ</th>
              <th className="px-5 py-4">Trạng thái</th>
              <th className="px-5 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <LoadingRows />}

            {!isLoading && shifts.length === 0 && (
              <tr>
                <td colSpan="5" className="px-5 py-14 text-center text-sm text-slate-500">
                  Chưa có ca làm việc nào. Hãy thêm ca đầu tiên.
                </td>
              </tr>
            )}

            {!isLoading &&
              shifts.map((shift) => {
                const isPending = actionId === shift.shiftId

                return (
                  <tr key={shift.shiftId} className="text-sm text-slate-600 transition hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-medium text-slate-600">{DAY_LABELS[shift.dayOfWeek]}</td>
                    <td className="px-5 py-4 font-semibold text-[#1D3557]">{shift.name}</td>
                    <td className="px-5 py-4 text-slate-500">{formatShiftTime(shift.startTime, shift.endTime)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${shift.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {shift.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(shift)}
                          disabled={actionId !== null}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(shift)}
                          disabled={actionId !== null}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {isPending ? 'Đang xóa...' : 'Xóa'}
                        </button>
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

export default ShiftsTable
