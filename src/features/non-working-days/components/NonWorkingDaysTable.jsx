import { Building2, Edit3, LockKeyhole, Stethoscope, Trash2 } from 'lucide-react'
import { formatDate, getScopeLabel, isFutureDate } from '../utils'

function LoadingRows() {
  return Array.from({ length: 4 }, (_, index) => (
    <tr key={index} className="animate-pulse border-b border-slate-100">
      {Array.from({ length: 5 }, (_, cellIndex) => (
        <td key={cellIndex} className="px-5 py-5"><div className="h-4 rounded bg-slate-100" /></td>
      ))}
    </tr>
  ))
}

function NonWorkingDaysTable({ nonWorkingDays, isLoading, actionId, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto" role="region" aria-label="Danh sách ngày nghỉ, cuộn ngang để xem đầy đủ" tabIndex={0}>
        <table className="min-w-[920px] w-full border-collapse text-left">
          <caption className="sr-only">Danh sách ngày nghỉ</caption>
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr className="text-xs font-bold uppercase tracking-wide text-slate-500">
              <th scope="col" className="px-5 py-4">Ngày nghỉ</th>
              <th scope="col" className="px-5 py-4">Phạm vi</th>
              <th scope="col" className="px-5 py-4">Lý do</th>
              <th scope="col" className="px-5 py-4">Trạng thái</th>
              <th scope="col" className="px-5 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <LoadingRows />}

            {!isLoading && nonWorkingDays.length === 0 && (
              <tr><td colSpan="5" className="px-5 py-14 text-center text-sm text-slate-500">Chưa có lịch nghỉ nào được tạo.</td></tr>
            )}

            {!isLoading && nonWorkingDays.map((item) => {
              const isEditable = isFutureDate(item.date)
              const isPending = actionId === item.nonWorkingDayId
              const isHospitalClosure = item.doctorId === null

              return (
                <tr key={item.nonWorkingDayId} className="text-sm text-slate-600 transition hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-(--ink)">{formatDate(item.date)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${isHospitalClosure ? 'bg-rose-100 text-rose-700' : 'bg-violet-100 text-violet-700'}`}>
                        {isHospitalClosure ? <Building2 className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-700">{getScopeLabel(item)}</p>
                        <p className="text-xs text-slate-400">{isHospitalClosure ? 'Toàn bệnh viện' : 'Nghỉ cá nhân'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-sm px-5 py-4 leading-5 text-slate-500">{item.reason || <span className="text-slate-400">Chưa có lý do</span>}</td>
                  <td className="px-5 py-4">
                    {isEditable ? (
                      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Sắp tới</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"><LockKeyhole className="h-3 w-3" />Đã diễn ra</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {isEditable ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          disabled={actionId !== null}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Edit3 className="h-3.5 w-3.5" />Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          disabled={actionId !== null}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />{isPending ? 'Đang hủy...' : 'Hủy lịch'}
                        </button>
                      </div>
                    ) : (
                      <span className="block text-right text-xs font-medium text-slate-400">Đã khóa lịch sử</span>
                    )}
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

export default NonWorkingDaysTable
