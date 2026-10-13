import { Mail, MapPin, Phone } from 'lucide-react'
import Brand from '../Brand'

export default function Footer() {
  return (
    <footer id="contact" className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-grid">
          <div><Brand /><p className="footer-description">Đặt lịch khám trực tuyến, theo dõi lịch hẹn và hồ sơ của bạn ở một nơi.</p></div>
          <div><h2>Khám phá</h2><a href="/doctors">Tìm bác sĩ</a><a href="/availability">Giờ khám trống</a><a href="/appointments">Đặt lịch khám</a></div>
          <div><h2>Liên hệ</h2><a href="tel:+919876543210"><Phone size={15} aria-hidden="true" />+91 98765 43210</a><a href="mailto:care@medicareplus.com"><Mail size={15} aria-hidden="true" />care@medicareplus.com</a><p className="footer-address"><MapPin size={15} aria-hidden="true" />123 Health Way, Medical District, New Delhi</p></div>
        </div>
        <div className="footer-bottom"><p>© {new Date().getFullYear()} MediCare+ · Dự án học tập, thông tin liên hệ là dữ liệu mẫu.</p><a href="/admin/appointments">Dành cho nhân viên</a></div>
      </div>
    </footer>
  )
}
