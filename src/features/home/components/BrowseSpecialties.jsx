import { ArrowRight } from 'lucide-react'
import SpecialtyCard from './SpecialtyCard'

export default function BrowseSpecialties({ directory }) {
  if (directory.status === 'error' || (directory.status === 'ready' && !directory.specialties.length)) return null

  return (
    <section id="specialties" className="home-section">
      <div className="home-container">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Chuyên khoa</h2>
            <p>Chọn chuyên khoa để xem bác sĩ và giờ khám còn trống.</p>
          </div>
          <a href="/doctors" className="section-link">Xem tất cả bác sĩ <ArrowRight size={16} aria-hidden="true" /></a>
        </div>
        <div className="specialty-grid" aria-busy={directory.status === 'loading'}>
          {directory.status === 'loading'
            ? Array.from({ length: 4 }, (_, index) => <div key={index} className="specialty-card specialty-card--skeleton" />)
            : directory.specialties.slice(0, 8).map((item) => <SpecialtyCard key={item.specialtyId} id={item.specialtyId} name={item.name} doctorCount={item.doctorCount} />)}
        </div>
      </div>
    </section>
  )
}
