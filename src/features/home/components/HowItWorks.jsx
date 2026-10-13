const steps = [
  { title: 'Chọn bác sĩ', description: 'Lọc theo chuyên khoa hoặc tìm theo tên bác sĩ.' },
  { title: 'Chọn giờ trống', description: 'Xem lịch 7 ngày tới, chọn khung giờ 30 phút phù hợp.' },
  { title: 'Xác nhận', description: 'Đăng nhập và xác nhận. Lịch hẹn được ghi nhận ngay.' },
]

export default function HowItWorks() {
  return (
    <section id="about" className="home-section">
      <div className="home-container">
        <div className="section-heading"><div><h2 className="section-title">Đặt lịch trong 3 bước</h2></div></div>
        <ol className="how-grid">
          {steps.map(({ title, description }, index) => (
            <li key={title} className="how-step">
              <span className="how-step-number">{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
