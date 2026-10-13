import { useState } from 'react'
import { AlertCircle, ArrowRight, CalendarClock, ChevronDown, Stethoscope, Tags } from 'lucide-react'
import { bookingUrl } from '../../appointments/bookingIntent'
import { dayLabel } from '../../appointment-slots/utils'

// Mỗi công cụ tra cứu của backend (ChatLookupService) có một component riêng.
// Lời văn của AI chỉ để đọc; ID và các nút thao tác LUÔN lấy từ `data` do backend trả,
// không bao giờ trích từ câu chữ của AI.
// Thêm công cụ mới ở backend = thêm một dòng vào SOURCE_CARDS.
const SOURCE_CARDS = {
  get_specialties: SpecialtiesCard,
  get_doctors: DoctorsCard,
  get_available_slots: SlotsCard,
}

// Lỗi do AI truyền sai tham số là chuyện nội bộ; người dùng chỉ cần thấy lỗi tra cứu thật.
// Một câu hỏi có thể trả về vài chục giờ trống; hiện trước một ít để thẻ không quá dài.
const INITIAL_SLOT_COUNT = 8

const HIDDEN_ERROR_CODES = new Set(['invalid_arguments', 'unsupported_tool'])

export default function SourceCards({ sources }) {
  // Mô hình có thể gọi cùng một công cụ với cùng kết quả nhiều lần trong một lượt.
  const seen = new Set()
  const cards = []
  sources.forEach((source, index) => {
    const key = `${source.tool}:${JSON.stringify(source.data)}`
    if (seen.has(key)) return
    seen.add(key)
    const error = source.data?.error
    if (error) {
      if (!HIDDEN_ERROR_CODES.has(error.code)) cards.push(<LookupError key={index} message={error.message} />)
      return
    }
    const Card = SOURCE_CARDS[source.tool]
    // Công cụ chưa có giao diện: bỏ qua thay vì in JSON thô cho người dùng.
    if (Card && Array.isArray(source.data?.items)) cards.push(<Card key={index} data={source.data} />)
  })
  if (!cards.length) return null
  return <div className="chat-sources" aria-label="Dữ liệu tra cứu từ hệ thống">{cards}</div>
}

function CardFrame({ icon: Icon, title, hasMore, children }) {
  return (
    <section className="chat-card">
      <header className="chat-card-header">
        <Icon size={15} aria-hidden="true" />
        <h3>{title}</h3>
        <span className="chat-card-badge">Dữ liệu từ phòng khám</span>
      </header>
      {children}
      {hasMore && <p className="chat-card-note">Còn nhiều kết quả khác. Hãy hỏi cụ thể hơn để thu hẹp danh sách.</p>}
    </section>
  )
}

function SpecialtiesCard({ data }) {
  return (
    <CardFrame icon={Tags} title="Chuyên khoa" hasMore={data.hasMore}>
      {data.items.length ? (
        <ul className="chat-chip-list">
          {data.items.map((item) => (
            <li key={item.specialtyId}>
              <a className="chat-chip" href={`/doctors?specialty=${item.specialtyId}`}>{item.name}</a>
            </li>
          ))}
        </ul>
      ) : <p className="chat-card-empty">Không tìm thấy chuyên khoa phù hợp.</p>}
    </CardFrame>
  )
}

function DoctorsCard({ data }) {
  return (
    <CardFrame icon={Stethoscope} title="Bác sĩ" hasMore={data.hasMore}>
      {data.items.length ? (
        <ul className="chat-doctor-list">
          {data.items.map((doctor) => (
            <li key={doctor.doctorId}>
              <div>
                <strong>{doctor.fullName}</strong>
                <span>{doctor.specialtyName}{Number.isFinite(doctor.experience) ? ` · ${doctor.experience} năm kinh nghiệm` : ''}</span>
              </div>
              <a className="chat-link" href={bookingUrl({ doctor: doctor.doctorId })}>
                Xem giờ trống<ArrowRight size={13} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      ) : <p className="chat-card-empty">Không tìm thấy bác sĩ phù hợp.</p>}
    </CardFrame>
  )
}

function SlotsCard({ data }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? data.items : data.items.slice(0, INITIAL_SLOT_COUNT)
  const hiddenCount = data.items.length - visible.length
  const byDate = new Map()
  for (const slot of visible) byDate.set(slot.date, [...(byDate.get(slot.date) || []), slot])
  return (
    <CardFrame icon={CalendarClock} title={`Giờ trống · ${data.doctorName}`} hasMore={data.hasMore}>
      <p className="chat-card-subtitle">{data.specialtyName} · Chọn một giờ để chuyển sang trang đặt lịch. Giờ chưa được giữ chỗ.</p>
      {byDate.size ? (
        <div className="chat-slot-days">
          {[...byDate].map(([date, slots]) => (
            <div key={date} className="chat-slot-day">
              <p>{dayLabel(date)}</p>
              <ul className="chat-chip-list">
                {slots.map((slot) => (
                  <li key={slot.appointmentSlotId}>
                    <a className="chat-chip chat-chip--time" href={bookingUrl({ doctor: data.doctorId, date, slot: slot.appointmentSlotId })}>
                      {slot.startTime.slice(0, 5)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : <p className="chat-card-empty">Bác sĩ không còn giờ trống trong khoảng ngày này.</p>}
      {hiddenCount > 0 && (
        <button type="button" className="chat-more" onClick={() => setExpanded(true)}>
          Xem thêm {hiddenCount} giờ trống<ChevronDown size={14} aria-hidden="true" />
        </button>
      )}
    </CardFrame>
  )
}

function LookupError({ message }) {
  return (
    <p className="chat-card chat-card--error" role="note">
      <AlertCircle size={15} aria-hidden="true" />{message || 'Chưa thể tra cứu dữ liệu lúc này.'}
    </p>
  )
}
