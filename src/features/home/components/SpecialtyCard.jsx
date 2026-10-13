import { Baby, Bone, Brain, Ear, Eye, HeartPulse, Smile, Sparkles, Stethoscope } from 'lucide-react'

// Đoán biểu tượng theo tên chuyên khoa; không khớp thì dùng ống nghe.
const icons = [
  [/tim|mạch/i, HeartPulse], [/thần kinh|não/i, Brain], [/nhi/i, Baby], [/xương|khớp|chấn thương/i, Bone],
  [/mắt|nhãn/i, Eye], [/tai|mũi|họng/i, Ear], [/da liễu|da/i, Sparkles], [/răng|nha/i, Smile],
]

export default function SpecialtyCard({ id, name, doctorCount }) {
  const Icon = icons.find(([pattern]) => pattern.test(name))?.[1] || Stethoscope
  return (
    <a href={`/doctors?specialty=${id}`} className="specialty-card">
      <span className="specialty-icon"><Icon size={22} strokeWidth={1.8} aria-hidden="true" /></span>
      <span>
        <strong>{name}</strong>
        <small>{doctorCount} bác sĩ</small>
      </span>
    </a>
  )
}
