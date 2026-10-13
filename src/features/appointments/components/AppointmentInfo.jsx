import AppointmentStatus from './AppointmentStatus'
import { shortDate, timeRange, timestampLabel } from '../utils'

export default function AppointmentInfo({ appointment, history = false }) {
  return <div className="appointment-info">
    <div className="appointment-info-heading"><span className="appointment-code">Lịch hẹn #{appointment.appointmentId}</span><AppointmentStatus status={appointment.status} /></div>
    <p className="appointment-info-time">{timeRange(appointment)}</p>
    <p className="appointment-muted">Ngày {shortDate(appointment.date)} · Giờ Việt Nam</p>
    <dl className="appointment-details">
      <div><dt>Bệnh nhân</dt><dd>{appointment.patientFullName}</dd></div>
      <div><dt>Điện thoại lúc đặt</dt><dd>{appointment.patientPhoneNumber || 'Chưa cung cấp'}</dd></div>
      <div><dt>Bác sĩ</dt><dd>{appointment.doctorFullName}</dd></div>
      <div><dt>Chuyên khoa</dt><dd>{appointment.specialtyName}</dd></div>
      <div className="appointment-details-wide"><dt>Lý do khám</dt><dd>{appointment.reason || 'Không cung cấp'}</dd></div>
      {history && <>
        <div><dt>Ngày tạo</dt><dd>{timestampLabel(appointment.createdAt)}</dd></div>
        <div><dt>Cập nhật gần nhất</dt><dd>{timestampLabel(appointment.updatedAt)}</dd></div>
        {appointment.status === 'Cancelled' && <><div><dt>Thời điểm hủy</dt><dd>{timestampLabel(appointment.cancelledAt)}</dd></div><div className="appointment-details-wide"><dt>Lý do hủy</dt><dd>{appointment.cancellationReason || 'Không cung cấp'}</dd></div></>}
      </>}
    </dl>
    {history && <p className="appointment-footnote">Thông tin bệnh nhân được ghi nhận lúc đặt; bác sĩ và giờ khám theo lịch hiện tại.</p>}
  </div>
}
