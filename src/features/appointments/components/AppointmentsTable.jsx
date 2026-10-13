import { ArrowUpRight, CalendarDays, Pencil } from 'lucide-react'
import AppointmentStatus from './AppointmentStatus'
import { canRescheduleAppointment, rescheduleRestriction, shortDate, timeRange } from '../utils'

export default function AppointmentsTable({ items, loading, onView, onEdit, now }) {
  return <div className="appointment-table-scroll" role="region" aria-label="Danh sách lịch hẹn, cuộn ngang để xem đầy đủ" tabIndex={0} aria-busy={loading}>
    <table className="appointment-table"><caption className="sr-only">Danh sách lịch hẹn theo bộ lọc đang áp dụng</caption><thead><tr>{['Mã hẹn', 'Ngày / giờ khám', 'Bệnh nhân', 'Điện thoại lúc đặt', 'Bác sĩ / Chuyên khoa', 'Lý do khám', 'Trạng thái', 'Thao tác'].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>
      {loading ? <tr><td colSpan={8}><div className="appointment-empty" role="status"><p>Đang tải danh sách lịch hẹn…</p></div></td></tr>
        : !items.length ? <tr><td colSpan={8}><div className="appointment-empty"><CalendarDays size={28} aria-hidden="true" /><h3>Không có lịch hẹn phù hợp</h3><p>Thử thay đổi bộ lọc hoặc chọn khoảng thời gian khác.</p></div></td></tr>
          : items.map((item) => <tr key={item.appointmentId}>
            <td><span className="appointment-code">#{item.appointmentId}</span></td>
            <td><strong className="appointment-nowrap">{shortDate(item.date)}</strong><span className="appointment-cell-secondary appointment-nowrap">{timeRange(item)}</span></td>
            <td><strong>{item.patientFullName}</strong><span className="appointment-cell-secondary">Hồ sơ #{item.patientId}</span></td>
            <td className="appointment-nowrap">{item.patientPhoneNumber || '—'}</td>
            <td><strong>{item.doctorFullName}</strong><span className="appointment-cell-secondary">{item.specialtyName}</span></td>
            <td><p className="appointment-reason-preview" title={item.reason || ''}>{item.reason || '—'}</p></td>
            <td><AppointmentStatus status={item.status} /></td>
            <td><div className="appointment-row-actions"><button type="button" className="appointment-text-button appointment-nowrap" aria-label={`Chi tiết lịch hẹn #${item.appointmentId}`} onClick={() => onView(item.appointmentId)}>Chi tiết<ArrowUpRight size={15} aria-hidden="true" /></button>
              {onEdit && <button type="button" className="appointment-text-button appointment-nowrap" aria-label={`Sửa lịch hẹn #${item.appointmentId}`} disabled={!canRescheduleAppointment(item, now)} title={rescheduleRestriction(item, now) || 'Đổi bác sĩ, ngày hoặc giờ khám'} onClick={() => onEdit(item.appointmentId)}><Pencil size={14} aria-hidden="true" />Sửa</button>}
            </div></td>
          </tr>)}
    </tbody></table>
  </div>
}
