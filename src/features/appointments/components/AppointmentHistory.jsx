import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, History } from 'lucide-react'
import { getAppointmentHistory } from '../api/appointmentsApi'
import { roleLabels } from '../../auth/permissions'
import { appointmentError, appointmentStatuses, shortDate, timeRange, timestampLabel } from '../utils'

const actions = { Created: 'Đã đặt lịch khám', Rescheduled: 'Đã thay đổi lịch khám', Cancelled: 'Đã hủy lịch hẹn', Completed: 'Đã hoàn tất buổi khám', NoShow: 'Đã ghi nhận không đến' }
function Snapshot({ value, label }) {
  if (!value) return null
  return <div><span>{label}</span>{shortDate(value.date)} · {timeRange(value)}<br />{value.doctorFullName} · {value.specialtyName}<br />{appointmentStatuses[value.status]?.label || value.status}{value.cancellationReason && <p>Lý do hủy: {value.cancellationReason}</p>}</div>
}
export default function AppointmentHistory({ id }) {
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState(null)
  const key = `${id}/${page}/${revision}`
  const ready = result?.key === key
  useEffect(() => {
    const controller = new AbortController()
    getAppointmentHistory(id, page, controller.signal).then((items) => {
      if (!controller.signal.aborted) setResult({ key, items })
    }).catch((failure) => { if (!controller.signal.aborted) setResult({ key, error: appointmentError(failure) }) })
    return () => controller.abort()
  }, [id, page, key])
  return <section className="appointment-history"><h3><History size={16} />Lịch sử lịch hẹn</h3>{!ready ? <p className="appointment-footnote" role="status">Đang tải lịch sử…</p> : result.error ? <div role="alert"><p className="appointment-footnote">{result.error}</p><button className="account-text-link" onClick={() => setRevision((value) => value + 1)}>Thử lại</button></div> : !result.items.length ? <p className="appointment-footnote">{page === 1 ? 'Chưa có hoạt động được ghi nhận. Lịch hẹn cũ chỉ có lịch sử từ những thay đổi mới.' : 'Bạn đã xem hết lịch sử.'}</p> : <ol className="history-list">{result.items.map((item) => <li key={item.appointmentHistoryId}><div className="history-entry-title"><strong>{actions[item.action] || item.action}</strong><time dateTime={item.occurredAt}>{timestampLabel(item.occurredAt)}</time></div><p>{item.actorDisplayName} · {roleLabels[item.actorRole] || item.actorRole}</p><div className="history-change"><Snapshot value={item.before} label="Trước" /><Snapshot value={item.after} label={item.before ? 'Sau' : 'Lịch khám'} /></div></li>)}</ol>}{ready && !result.error && (page > 1 || result.items.length === 10) && <div className="account-pagination"><span>Mới nhất trước · Trang {page}</span><div><button className="account-button" aria-label="Lịch sử mới hơn" disabled={page === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={14} /></button><button className="account-button" aria-label="Lịch sử cũ hơn" disabled={result.items.length < 10} onClick={() => setPage((value) => value + 1)}><ChevronRight size={14} /></button></div></div>}</section>
}
