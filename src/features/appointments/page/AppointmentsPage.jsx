import { useEffect, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Filter, RefreshCw } from 'lucide-react'
import Notice from '../../../components/ui/Notice'
import { clinicDays, clinicNow } from '../../appointment-slots/utils'
import { getAppointments } from '../api/appointmentsApi'
import AppointmentDetailDialog from '../components/AppointmentDetailDialog'
import AppointmentsTable from '../components/AppointmentsTable'
import RescheduleAppointmentDialog from '../components/RescheduleAppointmentDialog'
import { useAppointmentOptions, useClinicClock } from '../hooks'
import { appointmentError, appointmentStatuses, shortDate, validateDateRange } from '../utils'
import '../appointments.css'

function initialFilters() {
  const today = clinicNow().date
  return { patientId: '', doctorId: '', specialtyId: '', status: '', fromDate: today, toDate: today }
}

export default function AppointmentsPage() {
  const now = useClinicClock()
  const options = useAppointmentOptions()
  const [filters, setFilters] = useState(initialFilters)
  const [draft, setDraft] = useState(initialFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState(null)
  const [filterError, setFilterError] = useState('')
  const [notice, setNotice] = useState(null)
  const [detailId, setDetailId] = useState(null)
  const [editId, setEditId] = useState(null)
  // Bộ lọc chi tiết thu gọn mặc định: phần lớn thời gian chỉ cần "Hôm nay".
  const [showFilters, setShowFilters] = useState(false)
  const activeFilters = ['status', 'patientId', 'doctorId', 'specialtyId'].filter((name) => filters[name]).length
  const requestKey = JSON.stringify({ ...filters, page, pageSize, revision })
  const ready = result?.key === requestKey
  const data = ready ? result?.data : null
  const error = ready ? result?.error : ''
  const pageCount = Math.max(1, Math.ceil((data?.totalCount || 0) / pageSize))

  useEffect(() => {
    const controller = new AbortController()
    const { revision: ignoredRevision, ...query } = JSON.parse(requestKey)
    void ignoredRevision
    getAppointments(query, controller.signal).then((response) => {
      if (controller.signal.aborted) return
      const lastPage = Math.max(1, Math.ceil(response.totalCount / query.pageSize))
      if (query.page > lastPage) { setPage(lastPage); return }
      setResult({ key: requestKey, data: response })
    }).catch((failure) => {
      if (!controller.signal.aborted) setResult({ key: requestKey, error: appointmentError(failure) })
    })
    return () => controller.abort()
  }, [requestKey])

  function apply(next) {
    const invalid = validateDateRange(next)
    setFilterError(invalid)
    if (invalid) return
    setDraft(next)
    setFilters(next)
    setPage(1)
  }

  // Lọc ngay khi đổi lựa chọn; khoảng ngày sai chỉ báo lỗi, không gọi API.
  function changeField(event) {
    const next = { ...draft, [event.target.name]: event.target.value }
    setDraft(next)
    apply(next)
  }

  function reload() { setRevision((value) => value + 1) }

  function openEdit(id) {
    setDetailId(null)
    setEditId(id)
    setNotice(null)
  }

  function openDetail(id) {
    setEditId(null)
    setDetailId(id)
  }

  function handleUpdated(message) {
    reload()
    setNotice(message ? { type: 'success', message } : null)
  }

  return <section className="admin-page appointment-page appointment-management">
    <header className="appointment-page-heading"><div><h1>Quản lý lịch hẹn</h1><p>Theo dõi lịch khám, xem chi tiết và ghi nhận kết quả.</p></div></header>
    <Notice notice={detailId !== null || editId !== null ? null : notice} />
    <section className="appointment-filter-panel" aria-label="Bộ lọc lịch hẹn">
      <div className="appointment-filter-heading"><div className="appointment-quick-dates" role="group" aria-label="Khoảng thời gian nhanh"><button type="button" aria-pressed={filters.fromDate === now.date && filters.toDate === now.date} onClick={() => apply({ ...draft, fromDate: now.date, toDate: now.date })}>Hôm nay</button><button type="button" aria-pressed={filters.fromDate === now.date && filters.toDate === clinicDays(now.date).at(-1)} onClick={() => apply({ ...draft, fromDate: now.date, toDate: clinicDays(now.date).at(-1) })}>7 ngày tới</button><button type="button" aria-pressed={!filters.fromDate && !filters.toDate} onClick={() => apply({ ...draft, fromDate: '', toDate: '' })}>Tất cả thời gian</button></div><button type="button" className="appointment-text-button" aria-expanded={showFilters} aria-controls="appointment-filter-form" onClick={() => setShowFilters((open) => !open)}><Filter size={15} aria-hidden="true" />{showFilters ? 'Thu gọn bộ lọc' : 'Lọc chi tiết'}{activeFilters > 0 && <span className="appointment-filter-count">{activeFilters}</span>}</button></div>
      {showFilters && <form id="appointment-filter-form" onSubmit={(event) => { event.preventDefault(); apply(draft) }}>
        <div className="appointment-filter-fields">
          <label className="appointment-field"><span>Từ ngày</span><input type="date" name="fromDate" value={draft.fromDate} onChange={changeField} aria-invalid={Boolean(filterError)} aria-describedby={filterError ? 'appointment-filter-error' : undefined} /></label>
          <label className="appointment-field"><span>Đến ngày</span><input type="date" name="toDate" value={draft.toDate} onChange={changeField} aria-invalid={Boolean(filterError)} aria-describedby={filterError ? 'appointment-filter-error' : undefined} /></label>
          <label className="appointment-field"><span>Trạng thái</span><select name="status" value={draft.status} onChange={changeField}><option value="">Tất cả trạng thái</option>{Object.entries(appointmentStatuses).map(([value, info]) => <option key={value} value={value}>{info.label}</option>)}</select></label>
          <label className="appointment-field"><span>Bệnh nhân</span><select name="patientId" value={draft.patientId} disabled={options.loading || Boolean(options.error)} onChange={changeField}><option value="">Tất cả bệnh nhân</option>{options.patients.map((item) => <option key={item.patientId} value={item.patientId}>#{item.patientId} · {item.fullName}</option>)}</select></label>
          <label className="appointment-field"><span>Bác sĩ</span><select name="doctorId" value={draft.doctorId} disabled={options.loading || Boolean(options.error)} onChange={changeField}><option value="">Tất cả bác sĩ</option>{options.doctors.map((item) => <option key={item.doctorId} value={item.doctorId}>{item.fullName}</option>)}</select></label>
          <label className="appointment-field"><span>Chuyên khoa</span><select name="specialtyId" value={draft.specialtyId} disabled={options.loading || Boolean(options.error)} onChange={changeField}><option value="">Tất cả chuyên khoa</option>{options.specialties.map((item) => <option key={item.specialtyId} value={item.specialtyId}>{item.name}</option>)}</select></label>
        </div>
        {filterError && <p id="appointment-filter-error" className="appointment-selection-expired" role="alert">{filterError}</p>}
        {options.loading && <p className="appointment-footnote" role="status">Đang tải lựa chọn bộ lọc…</p>}
        {options.error && <div className="appointment-reference-error" role="alert"><p>{options.error} Bạn vẫn có thể lọc theo ngày và trạng thái.</p><button type="button" className="appointment-text-button" onClick={options.reload}>Tải lại lựa chọn</button></div>}
        <div className="appointment-filter-footer"><p>Danh sách cập nhật ngay khi bạn đổi bộ lọc.</p><div><button type="button" className="appointment-text-button" onClick={() => apply({ patientId: '', doctorId: '', specialtyId: '', status: '', fromDate: '', toDate: '' })}>Xóa bộ lọc</button></div></div>
      </form>}
    </section>
    <section className="appointment-list-panel">
      <div className="appointment-list-heading"><div><h2><CalendarDays size={18} aria-hidden="true" />Danh sách lịch hẹn{data && <span>{data.totalCount}</span>}</h2><p>{filters.fromDate || filters.toDate ? `${filters.fromDate ? shortDate(filters.fromDate) : 'Từ trước'} – ${filters.toDate ? shortDate(filters.toDate) : 'Về sau'}` : 'Tất cả thời gian'} · Giờ Việt Nam</p></div><button type="button" className="appointment-button" onClick={reload} disabled={!ready}><RefreshCw size={15} aria-hidden="true" />Tải lại</button></div>
      {error ? <div className="appointment-empty" role="alert"><h3>Không tải được danh sách lịch hẹn</h3><p>{error}</p><button type="button" className="appointment-button" onClick={reload}>Thử lại</button></div> : <AppointmentsTable items={data?.items || []} loading={!ready} onView={openDetail} onEdit={openEdit} now={now} />}
      <div className="appointment-pagination"><label>Hiển thị<select aria-label="Số lịch hẹn mỗi trang" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>{[10, 20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}</select><span>/ trang</span></label><p>{data ? data.totalCount > 0 ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, data.totalCount)} trong ${data.totalCount} lịch hẹn` : '0 lịch hẹn' : '—'}</p><div><button type="button" className="appointment-button" aria-label="Trang trước" disabled={!data || page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={17} /></button><span>Trang {page} / {data ? pageCount : '—'}</span><button type="button" className="appointment-button" aria-label="Trang sau" disabled={!data || page >= pageCount} onClick={() => setPage((value) => value + 1)}><ChevronRight size={17} /></button></div></div>
    </section>
    {detailId !== null && <AppointmentDetailDialog key={detailId} id={detailId} now={now} onClose={() => setDetailId(null)} onEdit={openEdit} onUpdated={handleUpdated} />}
    {editId !== null && <RescheduleAppointmentDialog key={editId} id={editId} now={now} options={options} onClose={() => setEditId(null)} onView={openDetail} onUpdated={handleUpdated} />}
  </section>
}
