import { useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, RefreshCw, Stethoscope, UserRound } from 'lucide-react'
import Notice from '../../../components/ui/Notice'
import AppointmentDetailDialog from '../../appointments/components/AppointmentDetailDialog'
import RescheduleAppointmentDialog from '../../appointments/components/RescheduleAppointmentDialog'
import AppointmentStatus from '../../appointments/components/AppointmentStatus'
import { useAppointmentOptions, useClinicClock } from '../../appointments/hooks'
import { appointmentStatuses, shortDate, timeRange, validateDateRange } from '../../appointments/utils'
import { authError, getMyAppointments } from '../api'
import { useAuth } from '../useAuth'
import { Field } from '../components/FormFields'
import '../../appointments/appointments.css'

const emptyFilters = { fromDate: '', toDate: '', status: '' }
export default function MyAppointmentsPage() {
  const { role } = useAuth()
  const now = useClinicClock()
  const options = useAppointmentOptions()
  const [tab, setTab] = useState('upcoming')
  const [filters, setFilters] = useState(emptyFilters)
  const [draft, setDraft] = useState(emptyFilters)
  const [filterError, setFilterError] = useState('')
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState(null)
  const [detailId, setDetailId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [notice, setNotice] = useState(null)
  const query = tab === 'upcoming' ? { fromDate: now.date, status: 'Confirmed' } : tab === 'completed' ? { status: 'Completed' } : filters
  const key = JSON.stringify({ ...query, page, pageSize: 10, revision })
  const ready = result?.key === key
  const data = ready ? result.data : null
  const pages = Math.max(1, Math.ceil((data?.totalCount || 0) / 10))
  useEffect(() => {
    const controller = new AbortController()
    const { revision: unused, ...filters } = JSON.parse(key)
    void unused
    getMyAppointments(filters, controller.signal).then((data) => {
      if (controller.signal.aborted) return
      const lastPage = Math.max(1, Math.ceil(data.totalCount / 10))
      if (filters.page > lastPage) { setPage(lastPage); return }
      setResult({ key, data })
    }).catch((failure) => { if (!controller.signal.aborted) setResult({ key, error: authError(failure) }) })
    return () => controller.abort()
  }, [key])
  function updated(message) { setRevision((value) => value + 1); setNotice(message ? { type: 'success', message } : null) }
  function edit(id) { setDetailId(null); setEditId(id) }
  function detail(id) { setEditId(null); setDetailId(id) }
  return <>
    <header className="account-page-heading"><h1>{role === 'Doctor' ? 'Lịch khám được giao' : 'Lịch hẹn của tôi'}</h1><p>{role === 'Doctor' ? 'Theo dõi các lịch hẹn được phân công và ghi nhận kết quả khám.' : 'Xem lịch khám, điều chỉnh thời gian và theo dõi những lần thăm khám.'}</p></header>
    <Notice notice={detailId || editId ? null : notice} />
    <div className="my-visits-toolbar"><div className="my-visits-tabs" aria-label="Nhóm lịch hẹn">{[['upcoming', 'Từ hôm nay'], ['completed', 'Đã khám'], ['all', 'Tất cả lịch hẹn']].map(([value, label]) => <button type="button" key={value} aria-pressed={tab === value} onClick={() => { setTab(value); setPage(1); setFilterError('') }}>{label}</button>)}</div><button type="button" className="account-text-link" disabled={!ready} onClick={() => setRevision((value) => value + 1)}><RefreshCw size={13} className="inline mr-1" />Làm mới</button></div>
    {tab === 'all' && <form className="my-visits-filters" onSubmit={(event) => { event.preventDefault(); const error = validateDateRange(draft); setFilterError(error); if (!error) { setFilters(draft); setPage(1) } }}><Field label="Từ ngày"><input type="date" value={draft.fromDate} onChange={(event) => setDraft((current) => ({ ...current, fromDate: event.target.value }))} /></Field><Field label="Đến ngày"><input type="date" value={draft.toDate} onChange={(event) => setDraft((current) => ({ ...current, toDate: event.target.value }))} /></Field><Field label="Trạng thái"><select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}><option value="">Tất cả trạng thái</option>{Object.entries(appointmentStatuses).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</select></Field><button className="account-button">Áp dụng</button></form>}
    <Notice notice={filterError ? { type: 'error', message: filterError } : null} />
    {!ready ? <div className="account-loading" role="status" aria-label="Đang tải lịch hẹn"><div className="account-skeleton" /><div className="account-skeleton" /><span className="sr-only">Đang tải lịch hẹn…</span></div>
      : result.error ? <div className="account-empty" role="alert"><CalendarDays size={32} /><h2>Chưa tải được lịch hẹn</h2><p>{result.error}</p><button className="account-button" onClick={() => setRevision((value) => value + 1)}>Thử lại</button></div>
        : !data.items.length ? <div className="account-empty"><CalendarDays size={36} /><h2>{tab === 'upcoming' ? 'Chưa có lịch hẹn từ hôm nay' : 'Chưa có lịch hẹn phù hợp'}</h2><p>{role === 'Doctor' ? 'Lịch khám sẽ xuất hiện tại đây khi bạn được phân công.' : 'Khi bạn đặt lịch, thông tin buổi khám sẽ xuất hiện tại đây. Bạn cũng có thể thử bộ lọc khác.'}</p>{role === 'Patient' && <a className="account-button account-button--primary" href="/appointments">Đặt lịch khám<ArrowRight size={16} /></a>}</div>
          : data.items.map((item) => <article className="my-visit-card" key={item.appointmentId}><div className="my-visit-date"><strong>{item.date.slice(8, 10)}</strong><span>THÁNG {Number(item.date.slice(5, 7))}</span><span>{item.date.slice(0, 4)}</span></div><div className="my-visit-body"><h2>{role === 'Doctor' ? item.patientFullName : item.doctorFullName}</h2><p>{item.specialtyName} · Mã hẹn #{item.appointmentId}</p><div className="my-visit-meta"><span><Clock3 size={13} />{timeRange(item)}</span><span>{role === 'Doctor' ? <Stethoscope size={13} /> : <UserRound size={13} />}{role === 'Doctor' ? item.doctorFullName : item.patientFullName}</span></div></div><div className="my-visit-actions"><AppointmentStatus status={item.status} /><button className="account-button" aria-label={`Chi tiết lịch hẹn #${item.appointmentId} ngày ${shortDate(item.date)}`} onClick={() => detail(item.appointmentId)}>Xem chi tiết<ArrowRight size={14} /></button></div></article>)}
    {data && <div className="account-pagination"><p>{data.totalCount} lịch hẹn · Giờ Việt Nam</p><div><button className="account-button" aria-label="Trang trước" disabled={page === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={16} /></button><span>Trang {page} / {pages}</span><button className="account-button" aria-label="Trang sau" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}><ChevronRight size={16} /></button></div></div>}
    {detailId !== null && <AppointmentDetailDialog key={detailId} id={detailId} now={now} onClose={() => setDetailId(null)} onEdit={role === 'Patient' ? edit : undefined} onUpdated={updated} />}
    {editId !== null && role === 'Patient' && <RescheduleAppointmentDialog key={editId} id={editId} now={now} options={options} onClose={() => setEditId(null)} onView={detail} onUpdated={updated} />}
  </>
}
