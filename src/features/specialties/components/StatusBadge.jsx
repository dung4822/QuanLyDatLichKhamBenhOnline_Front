const statusStyles = {
  Active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Inactive: 'border-slate-200 bg-slate-100 text-slate-600',
}

function StatusBadge({ status }) {
  const isActive = status === 'Active'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        statusStyles[status] || statusStyles.Inactive
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {isActive ? 'Đang dùng' : 'Ngừng dùng'}
    </span>
  )
}

export default StatusBadge
