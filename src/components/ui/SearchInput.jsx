import { Search, X } from 'lucide-react'

export default function SearchInput({ value, onChange, label, resultCount, disabled }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="search"
          aria-label={label}
          placeholder={label}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
        />
        {value && (
          <button type="button" onClick={() => onChange('')} disabled={disabled} aria-label="Xóa từ khóa tìm kiếm" className="absolute right-1.5 top-1.5 grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
            <X size={16} />
          </button>
        )}
      </div>
      <p role="status" className="text-xs text-slate-500">{disabled ? 'Đang tải danh sách…' : `${resultCount} kết quả`}</p>
    </div>
  )
}
