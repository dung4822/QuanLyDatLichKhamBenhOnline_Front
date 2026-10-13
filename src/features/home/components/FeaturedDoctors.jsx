import { ArrowRight } from 'lucide-react'
import DoctorCard from './DoctorCard'

export default function FeaturedDoctors({ directory }) {
  if (directory.status !== 'ready' || !directory.doctors.length) return null
  // Ưu tiên bác sĩ nhiều kinh nghiệm để người mới có điểm bắt đầu.
  const doctors = [...directory.doctors].sort((a, b) => (b.experience || 0) - (a.experience || 0)).slice(0, 4)

  return (
    <section id="doctors" className="home-section home-section--tinted">
      <div className="home-container">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Bác sĩ của chúng tôi</h2>
            <p>Đặt lịch trực tiếp với bác sĩ bạn tin tưởng.</p>
          </div>
          <a href="/doctors" className="section-link">Xem tất cả <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
        <div className="doctor-grid">
          {doctors.map((doctor) => <DoctorCard key={doctor.doctorId} doctor={doctor} />)}
        </div>
      </div>
    </section>
  )
}
