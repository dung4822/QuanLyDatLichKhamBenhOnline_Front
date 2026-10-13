import { bookingUrl } from '../../appointments/bookingIntent'
import { initials } from '../../auth/useAuth'

export default function DoctorCard({ doctor }) {
  return (
    <article className="doctor-card">
      <span className="doctor-avatar" aria-hidden="true">{initials(doctor.fullName.replace(/^(BS|ThS|TS|PGS)\.?\s*/i, ''))}</span>
      <h3>{doctor.fullName}</h3>
      <p>{doctor.specialtyName}{doctor.experience ? ` · ${doctor.experience} năm kinh nghiệm` : ''}</p>
      <a className="btn-secondary btn-sm" href={bookingUrl({ doctor: doctor.doctorId })}>Đặt lịch</a>
    </article>
  )
}
