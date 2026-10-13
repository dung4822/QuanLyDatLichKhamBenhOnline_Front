import { useState } from 'react'
import { ArrowRight, Check, Search } from 'lucide-react'
import heroImage from '../../../assets/backgroundhomeheroic.png'
import { useAuth } from '../../auth/useAuth'
import { defaultDestination } from '../../auth/permissions'
import { navigate } from '../../../lib/navigation'

const facts = ['Xác nhận ngay khi đặt', 'Mỗi lượt khám 30 phút', 'Đổi giờ hoặc hủy khi cần']

export default function HomeHeroSection({ directory }) {
  const { isAuthenticated, name, role } = useAuth()
  const [specialty, setSpecialty] = useState('')

  return (
    <section id="home" className="home-hero">
      <div className="hero-grid">
        <div className="hero-copy">
          {isAuthenticated && <a className="hero-greeting" href={defaultDestination(role)}>Chào {name} · Xem lịch hẹn của bạn <ArrowRight size={15} aria-hidden="true" /></a>}
          <h1>Đặt lịch khám nhanh, đúng bác sĩ.</h1>
          <p className="hero-description">Chọn chuyên khoa, xem giờ còn trống và xác nhận lịch khám chỉ trong vài phút.</p>
          {/* Lối tắt quan trọng nhất của trang: một lựa chọn, một nút. */}
          <form className="hero-finder" onSubmit={(event) => { event.preventDefault(); navigate(specialty ? `/doctors?specialty=${specialty}` : '/doctors') }}>
            <label>
              <span>Bạn muốn khám chuyên khoa nào?</span>
              <select value={specialty} onChange={(event) => setSpecialty(event.target.value)} disabled={directory.status === 'loading'}>
                <option value="">{directory.status === 'loading' ? 'Đang tải chuyên khoa…' : 'Tất cả chuyên khoa'}</option>
                {directory.specialties.map((item) => <option key={item.specialtyId} value={item.specialtyId}>{item.name}</option>)}
              </select>
            </label>
            <button type="submit" className="btn-primary"><Search size={17} aria-hidden="true" />Tìm bác sĩ</button>
          </form>
          <a className="hero-alt-link" href="/availability">Hoặc xem tất cả giờ khám còn trống <ArrowRight size={15} aria-hidden="true" /></a>
          <ul className="hero-facts">{facts.map((fact) => <li key={fact}><Check size={16} aria-hidden="true" />{fact}</li>)}</ul>
        </div>
        <div className="hero-visual">
          <img src={heroImage} alt="Bác sĩ đang lắng nghe bệnh nhân trong buổi tư vấn" width="1448" height="1086" fetchPriority="high" />
        </div>
      </div>
    </section>
  )
}
