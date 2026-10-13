import { Eye, Pencil, Trash2, UserRound } from 'lucide-react'

function formatDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '—'
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase()
}

function LoadingRows() {
  return Array.from({ length: 5 }, (_, row) => (
    <tr key={row} className="animate-pulse border-b border-slate-100">
      {Array.from({ length: 7 }, (_, cell) => <td key={cell} className="px-5 py-5"><div className="h-4 rounded bg-slate-100" /></td>)}
    </tr>
  ))
}

export default function PatientsTable({ patients, isLoading, actionId, onView, onEdit, onDelete, emptyMessage }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto" role="region" aria-label="Danh sách bệnh nhân, cuộn ngang để xem đầy đủ" tabIndex={0}>
        <table className="w-full min-w-[1080px] border-collapse text-left">
          <caption className="sr-only">Danh sách bệnh nhân</caption>
          <thead className="border-b border-slate-200 bg-slate-50/80"><tr className="text-xs font-bold uppercase tracking-wide text-slate-500">
            <th className="px-5 py-4">Bệnh nhân</th><th className="px-5 py-4">Ngày sinh</th><th className="px-5 py-4">Giới tính</th><th className="px-5 py-4">Điện thoại</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Mã hồ sơ</th><th className="px-5 py-4 text-right">Thao tác</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <LoadingRows />}
            {!isLoading && patients.length === 0 && <tr><td colSpan="7" className="px-5 py-16 text-center"><UserRound className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-3 text-sm text-slate-500">{emptyMessage || 'Chưa có bệnh nhân nào. Hãy thêm hồ sơ đầu tiên.'}</p></td></tr>}
            {!isLoading && patients.map((patient) => {
              const isPending = actionId === patient.patientId
              const isMale = Number(patient.gender) === 0
              return <tr key={patient.patientId} className="text-sm text-slate-600 hover:bg-slate-50/70">
                <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-xs font-bold text-cyan-700">{getInitials(patient.fullName) || <UserRound className="h-5 w-5" />}</span><p className="font-semibold text-(--ink)">{patient.fullName}</p></div></td>
                <td className="whitespace-nowrap px-5 py-4">{formatDate(patient.dateOfBirth)}</td>
                <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isMale ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'}`}>{isMale ? 'Nam' : 'Nữ'}</span></td>
                <td className="px-5 py-4">{patient.phoneNumber}</td><td className="px-5 py-4 text-slate-500">{patient.email || '—'}</td><td className="px-5 py-4 font-mono text-xs text-slate-500">#{patient.patientId}</td>
                <td className="px-5 py-4"><div className="flex justify-end gap-2">
                  <button type="button" onClick={() => onView(patient)} disabled={actionId !== null} aria-label={`Xem chi tiết ${patient.fullName}`} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 disabled:opacity-50"><Eye className="h-4 w-4" /></button>
                  <button type="button" onClick={() => onEdit(patient)} disabled={actionId !== null} aria-label={`Sửa ${patient.fullName}`} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={() => onDelete(patient)} disabled={actionId !== null} aria-label={`Xóa ${patient.fullName}`} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"><Trash2 className="h-4 w-4" />{isPending ? 'Đang xóa' : 'Xóa'}</button>
                </div></td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
