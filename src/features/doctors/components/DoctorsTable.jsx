import { Edit3, Trash2, UserRound } from 'lucide-react'

function formatCareerStartDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return '—'
  }

  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function getInitials(fullName) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function Avatar({ doctor }) {
  if (doctor.avatarUrl) {
    return <img src={doctor.avatarUrl} alt={`Ảnh của ${doctor.fullName}`} className="h-10 w-10 rounded-full object-cover" />
  }

  const initials = getInitials(doctor.fullName)
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
      {initials || <UserRound className="h-5 w-5" />}
    </span>
  )
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

function DoctorsTable({ doctors, isLoading, actionId, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full border-collapse text-left">
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr className="text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-4">Bác sĩ</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Điện thoại</th>
              <th className="px-5 py-4">Giới tính</th>
              <th className="px-5 py-4">Bắt đầu nghề</th>
              <th className="px-5 py-4">Kinh nghiệm</th>
              <th className="px-5 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <LoadingRows />}

            {!isLoading && doctors.length === 0 && (
              <tr>
                <td colSpan="7" className="px-5 py-14 text-center text-sm text-slate-500">
                  Chưa có bác sĩ nào. Hãy thêm hồ sơ bác sĩ đầu tiên.
                </td>
              </tr>
            )}

            {!isLoading &&
              doctors.map((doctor) => {
                const isPending = actionId === doctor.doctorId
                const isMale = Number(doctor.gender) === 0

                return (
                  <tr key={doctor.doctorId} className="text-sm text-slate-600 transition hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar doctor={doctor} />
                        <div>
                          <p className="font-semibold text-[#1D3557]">{doctor.fullName}</p>
                          <p className="mt-0.5 text-xs text-slate-400">Mã số #{doctor.doctorId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{doctor.email || '—'}</td>
                    <td className="px-5 py-4 text-slate-500">{doctor.phoneNumber || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isMale ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'}`}>
                        {isMale ? 'Nam' : 'Nữ'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">{formatCareerStartDate(doctor.careerStartDate)}</td>
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-600">
                      {Number.isFinite(doctor.experience) ? `${doctor.experience} năm` : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(doctor)}
                          disabled={actionId !== null}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(doctor)}
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

export default DoctorsTable
