import { useEffect, useState } from 'react'
import { LogIn, MessageCircle, Minus, UsersRound, X } from 'lucide-react'
import ChatPage from '../page/ChatPage'
import { canUseAssistant } from '../../auth/permissions'
import { useAuth } from '../../auth/useAuth'
import '../chat.css'

// Nút chat nổi góc phải: bệnh nhân trò chuyện ngay tại trang đang xem; khách được mời đăng nhập.
// Sau lần mở đầu tiên khung chat được giữ lại (chỉ ẩn đi) để tin đang gửi không bị hủy khi thu nhỏ.
export default function ChatWidget() {
  const { account, role, isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Nhân viên/bác sĩ không dùng được trợ lý (API chỉ cho Patient).
  if (isAuthenticated && !canUseAssistant(role)) return null

  function toggle() {
    setMounted(true)
    setOpen((value) => !value)
  }

  return (
    <div className="chat-widget">
      {mounted && (
        <div className="chat-widget-panel" id="chat-widget-panel" role="dialog" aria-label="Trò chuyện với trợ lý" hidden={!open}>
          {isAuthenticated
            ? <ChatPage key={account.userAccountId} variant="widget" onClose={close} />
            : <GuestPanel onClose={close} />}
        </div>
      )}
      <button
        type="button"
        className="chat-launcher"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={mounted ? 'chat-widget-panel' : undefined}
        aria-label={open ? 'Đóng khung chat' : 'Mở trợ lý đặt lịch'}
      >
        {open ? <X size={26} aria-hidden="true" /> : <MessageCircle size={28} aria-hidden="true" />}
      </button>
    </div>
  )
}

function GuestPanel({ onClose }) {
  return (
    <div className="chat-page chat-page--widget">
      <header className="chat-widget-header">
        <span className="chat-widget-avatar"><MessageCircle size={18} aria-hidden="true" /></span>
        <div className="chat-widget-title">
          <h2>Trợ lý MediCare+</h2>
          <p><span className="chat-online" aria-hidden="true" />Đặt, đổi, hủy lịch bằng tin nhắn</p>
        </div>
        <div className="chat-heading-actions">
          <button type="button" className="chat-icon-button" title="Thu nhỏ" aria-label="Thu nhỏ khung chat" onClick={onClose}><Minus size={18} aria-hidden="true" /></button>
        </div>
      </header>
      <div className="chat-panel">
        <div className="chat-log">
          <div className="chat-row">
            <p className="chat-bubble">Xin chào! Mình là trợ lý đặt lịch khám của MediCare+.</p>
          </div>
          <div className="chat-row">
            <p className="chat-bubble">Bạn hãy đăng nhập bằng <strong>tài khoản bệnh nhân</strong> để mình tra cứu giờ trống và đặt, đổi, hủy lịch giúp bạn nhé.</p>
          </div>
          <div className="chat-guest-actions">
            <a className="account-button account-button--primary" href="/login?next=%2Fme%2Fassistant" onClick={onClose}><LogIn size={16} aria-hidden="true" />Đăng nhập</a>
            <a className="account-button" href="/demo-accounts" onClick={onClose}><UsersRound size={16} aria-hidden="true" />Xem tài khoản dùng thử</a>
          </div>
        </div>
      </div>
    </div>
  )
}
