import { ArrowLeft, CalendarCheck2, Clock3, ShieldCheck } from 'lucide-react'
import Brand from '../../../components/layout/Brand'
import careImage from '../../../assets/backgroundhomeheroic.png'

const benefits = [
  { icon: CalendarCheck2, text: 'Đặt lịch với bác sĩ bạn chọn, xác nhận ngay' },
  { icon: Clock3, text: 'Đổi giờ hoặc hủy lịch khi kế hoạch thay đổi' },
  { icon: ShieldCheck, text: 'Hồ sơ sức khỏe được giữ riêng tư' },
]

export default function AuthLayout({ children, register = false }) {
  return <div className="auth-shell">
    <a className="skip-link" href="#main-content">Đến nội dung chính</a>
    <header className="auth-header"><Brand /><a href="/" className="account-back"><ArrowLeft size={16} />Về trang chủ</a></header>
    <main id="main-content" className="auth-main" tabIndex={-1}>
      <section className="auth-story" aria-label="Lợi ích khi có tài khoản">
        <h2>Một tài khoản cho mọi lần khám.</h2>
        <ul className="auth-benefits">{benefits.map(({ icon: Icon, text }) => <li key={text}><Icon size={18} aria-hidden="true" />{text}</li>)}</ul>
        <div className="auth-image"><img src={careImage} alt="Bác sĩ đang tư vấn cho bệnh nhân" /></div>
      </section>
      <section className={`auth-card ${register ? 'auth-card--register' : ''}`}>{children}</section>
    </main>
    <footer className="auth-footer"><p>© {new Date().getFullYear()} MediCare+</p><a href="/#contact">Liên hệ phòng khám</a></footer>
  </div>
}
