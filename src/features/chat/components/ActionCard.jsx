import { useEffect, useState } from 'react'
import { AlertCircle, ArrowRight, CalendarCheck2, CalendarClock, CalendarX2, Check, CheckCircle2, Clock3, UserRoundPen, X } from 'lucide-react'

const ICONS = {
  BookAppointment: CalendarCheck2,
  CancelAppointment: CalendarX2,
  RescheduleAppointment: CalendarClock,
  UpdateProfile: UserRoundPen,
}

const STATUS_TEXT = {
  Confirmed: 'Đã thực hiện',
  Rejected: 'Bạn đã hủy đề xuất này',
  Expired: 'Đề xuất đã hết hạn, hãy nhờ trợ lý tạo lại',
  Superseded: 'Đã được thay bằng đề xuất mới hơn',
}

const LINKS = {
  BookAppointment: { href: '/me/appointments', label: 'Xem lịch hẹn của tôi' },
  RescheduleAppointment: { href: '/me/appointments', label: 'Xem lịch hẹn của tôi' },
  CancelAppointment: { href: '/me/appointments', label: 'Xem lịch hẹn của tôi' },
  UpdateProfile: { href: '/me/profile', label: 'Xem hồ sơ' },
}

const secondsLeft = (expiresAt) => Math.max(0, Math.ceil((Date.parse(expiresAt) - Date.now()) / 1000))

function useCountdown(expiresAt, active) {
  const [left, setLeft] = useState(() => secondsLeft(expiresAt))
  useEffect(() => {
    if (!active) return undefined
    const tick = () => setLeft(secondsLeft(expiresAt))
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [expiresAt, active])
  return left
}

// Thẻ xác nhận thao tác do trợ lý đề xuất. Nội dung `details` do backend định dạng sẵn từ DB,
// trạng thái chỉ lấy từ `action.status` (không suy ra từ lời văn của AI).
// Dữ liệu chỉ thay đổi khi người dùng bấm "Xác nhận" ở đây.
export default function ActionCard({ action, busy, disabled, feedback, onDecide }) {
  const pending = action.status === 'Pending'
  const left = useCountdown(action.expiresAt, pending)
  // Hết giờ ở UI thì hiển thị như Expired; server vẫn là nơi quyết định (bấm muộn sẽ nhận 409).
  const status = pending && Number.isFinite(Date.parse(action.expiresAt)) && left === 0 ? 'Expired' : action.status
  const Icon = ICONS[action.type] || CalendarCheck2
  const link = status === 'Confirmed' ? LINKS[action.type] : null

  return (
    <section className={`chat-action chat-action--${status.toLowerCase()}`} aria-label={action.title}>
      <header className="chat-action-header">
        <Icon size={16} aria-hidden="true" />
        <h3>{action.title}</h3>
        {status === 'Pending' && (
          <span className="chat-action-timer" aria-label={`Còn ${Math.floor(left / 60)} phút ${left % 60} giây để xác nhận`}>
            <Clock3 size={13} aria-hidden="true" />{`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`}
          </span>
        )}
      </header>

      <dl className="chat-action-details">
        {action.details.map((item, index) => (
          <div key={`${item.label}-${index}`}>
            <dt>{item.label}</dt>
            <dd>
              {item.before !== null && <><span className="chat-action-before">{item.before}</span><ArrowRight size={13} aria-label="đổi thành" /></>}
              <span>{item.value}</span>
            </dd>
          </div>
        ))}
      </dl>

      {status === 'Pending' ? (
        <div className="chat-action-buttons">
          <button type="button" className="account-button" onClick={() => onDecide(action, 'reject')} disabled={busy || disabled}>
            <X size={15} aria-hidden="true" />Hủy
          </button>
          <button type="button" className="account-button account-button--primary" onClick={() => onDecide(action, 'confirm')} disabled={busy || disabled}>
            <Check size={15} aria-hidden="true" />{busy ? 'Đang thực hiện…' : 'Xác nhận'}
          </button>
        </div>
      ) : (
        <p className="chat-action-status" role="status">
          {status === 'Failed' ? <AlertCircle size={15} aria-hidden="true" /> : status === 'Confirmed' ? <CheckCircle2 size={15} aria-hidden="true" /> : null}
          {status === 'Failed' ? action.failureReason || 'Không thể thực hiện thao tác này.' : STATUS_TEXT[status]}
          {link && <a className="chat-link" href={link.href}>{link.label}<ArrowRight size={13} aria-hidden="true" /></a>}
        </p>
      )}

      {/* Lỗi mạng khi bấm: thẻ vẫn Pending, bấm lại an toàn. 409 đã tải lại thẻ (Failed/Expired) nên không lặp lại lý do. */}
      {feedback && feedback.tone === 'error' && status === 'Pending' && <p className="chat-action-feedback" role="alert">{feedback.message}</p>}
      {feedback && feedback.tone === 'success' && <p className="chat-action-feedback chat-action-feedback--success" role="status">{feedback.message}</p>}
    </section>
  )
}
