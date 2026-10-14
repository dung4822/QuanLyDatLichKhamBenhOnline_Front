import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Bot, History, Maximize2, MessageSquarePlus, Minus, SendHorizontal, Sparkles } from 'lucide-react'
import ActionCard from '../components/ActionCard'
import ReplyText from '../components/ReplyText'
import SourceCards from '../components/SourceCards'
import { MAX_MESSAGE_LENGTH } from '../api/chatApi'
import { useChat } from '../useChat'
import { useAuth } from '../../auth/useAuth'
import '../chat.css'

const SUGGESTIONS = [
  'Ngày mai còn giờ khám Nội tổng quát nào không?',
  'Đặt giúp mình lịch khám sớm nhất với bác sĩ Tim mạch',
  'Mình có lịch hẹn nào sắp tới? Hủy giúp mình lịch gần nhất',
]

const sessionDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// variant="widget": cùng logic, giao diện khung chat nổi kiểu tin nhắn (ChatWidget).
export default function ChatPage({ variant = 'page', onClose }) {
  const widget = variant === 'widget'
  const { account } = useAuth()
  const { sessionId, sessions, turns, loading, sending, error, busyActionId, actionFeedback, send, retry, decide, startNew, open } = useChat(account?.userAccountId)
  const [draft, setDraft] = useState('')
  const [slow, setSlow] = useState(false)
  const log = useRef(null)
  const input = useRef(null)
  const history = useRef(null)
  const inputId = widget ? 'chat-widget-input' : 'chat-input'
  const tooLong = draft.length > MAX_MESSAGE_LENGTH
  const lastAction = turns.at(-1)?.action

  useEffect(() => {
    // Chỉ cuộn khung chat, không kéo cả trang theo.
    const element = log.current
    if (element) element.scrollTop = element.scrollHeight
  }, [turns.length, sending, error, lastAction?.status])

  useEffect(() => {
    // Máy chủ miễn phí có thể đang "ngủ": báo cho người dùng biết nếu chờ lâu.
    if (!sending) return undefined
    const timer = window.setTimeout(() => setSlow(true), 8000)
    return () => { window.clearTimeout(timer); setSlow(false) }
  }, [sending])

  async function submit(text = draft) {
    if (sending || loading || !text.trim() || text.length > MAX_MESSAGE_LENGTH) return
    setDraft('')
    const result = await send(text)
    if (result.editable) setDraft((current) => current || text)
    input.current?.focus()
  }

  function onKeyDown(event) {
    // Enter để gửi, Shift+Enter để xuống dòng; bỏ qua khi đang gõ dấu tiếng Việt (IME).
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  function newChat() {
    startNew()
    setDraft('')
    input.current?.focus()
  }

  function choose(id) {
    if (history.current) history.current.open = false
    open(id)
  }

  const historyMenu = sessions.length > 0 && (
    <details ref={history} className="chat-history">
      {widget
        ? <summary className="chat-icon-button" title="Cuộc trò chuyện gần đây" aria-label="Cuộc trò chuyện gần đây"><History size={17} aria-hidden="true" /></summary>
        : <summary className="account-button"><History size={15} aria-hidden="true" />Gần đây</summary>}
      <ul>
        {sessions.map((session) => (
          <li key={session.chatSessionId}>
            <button type="button" onClick={() => choose(session.chatSessionId)} disabled={sending} aria-current={session.chatSessionId === sessionId || undefined}>
              <strong>{session.title}</strong>
              <span>{sessionDate(session.updatedAt)}</span>
            </button>
          </li>
        ))}
      </ul>
    </details>
  )

  return (
    <div className={widget ? 'chat-page chat-page--widget' : 'chat-page'}>
      {widget ? (
        <header className="chat-widget-header">
          <span className="chat-widget-avatar"><Bot size={18} aria-hidden="true" /></span>
          <div className="chat-widget-title">
            <h2>Trợ lý MediCare+</h2>
            <p><span className="chat-online" aria-hidden="true" />Đặt, đổi, hủy lịch bằng tin nhắn</p>
          </div>
          <div className="chat-heading-actions">
            {historyMenu}
            {(turns.length > 0 || sessionId) && (
              <button type="button" className="chat-icon-button" title="Cuộc trò chuyện mới" aria-label="Cuộc trò chuyện mới" onClick={newChat}>
                <MessageSquarePlus size={17} aria-hidden="true" />
              </button>
            )}
            <a className="chat-icon-button" href="/me/assistant" title="Mở toàn trang" aria-label="Mở trợ lý toàn trang" onClick={onClose}><Maximize2 size={16} aria-hidden="true" /></a>
            <button type="button" className="chat-icon-button" title="Thu nhỏ" aria-label="Thu nhỏ khung chat" onClick={onClose}><Minus size={18} aria-hidden="true" /></button>
          </div>
        </header>
      ) : (
        <header className="account-page-heading account-heading-row">
          <div>
            <h1>Trợ lý đặt lịch khám</h1>
            <p>Tra cứu bác sĩ, giờ trống và nhờ trợ lý đặt, đổi, hủy lịch hoặc sửa hồ sơ. Trợ lý chuẩn bị sẵn thông tin, bạn chỉ cần bấm <strong>Xác nhận</strong>.</p>
          </div>
          <div className="chat-heading-actions">
            {historyMenu}
            {(turns.length > 0 || sessionId) && (
              <button type="button" className="account-button" onClick={newChat}>
                <MessageSquarePlus size={15} aria-hidden="true" />Cuộc trò chuyện mới
              </button>
            )}
          </div>
        </header>
      )}

      <section className="chat-panel" aria-label="Cuộc trò chuyện với trợ lý">
        <div ref={log} className="chat-log" role="log" aria-live="polite" aria-busy={sending || loading}>
          {loading && <p className="chat-loading" role="status">Đang tải cuộc trò chuyện…</p>}

          {!loading && !turns.length && (
            <div className="chat-welcome">
              <span className="chat-avatar chat-avatar--large"><Sparkles size={22} aria-hidden="true" /></span>
              {widget ? <h3>Xin chào! Mình có thể giúp gì cho bạn?</h3> : <h2>Bạn cần đặt lịch hay tra cứu gì?</h2>}
              <p>Hãy nói bằng tiếng Việt tự nhiên. Khi cần đặt, đổi hoặc hủy lịch, trợ lý sẽ gửi một thẻ để bạn kiểm tra và bấm Xác nhận.</p>
              <div className="chat-suggestions">
                {SUGGESTIONS.map((text) => (
                  <button key={text} type="button" onClick={() => submit(text)} disabled={sending}>{text}</button>
                ))}
              </div>
            </div>
          )}

          {turns.map((turn) => (
            <div key={turn.key} className="chat-turn">
              <div className={`chat-row chat-row--user${turn.failed ? ' chat-row--failed' : ''}`}>
                <p className="chat-bubble chat-bubble--user">{turn.message}</p>
              </div>
              {turn.reply !== null && (
                <div className="chat-row">
                  <span className="chat-avatar"><Bot size={16} aria-hidden="true" /></span>
                  <div className="chat-assistant">
                    <div className="chat-bubble"><ReplyText text={turn.reply} /></div>
                    {turn.action && (
                      <ActionCard
                        action={turn.action}
                        busy={busyActionId === turn.action.chatActionId}
                        disabled={Boolean(busyActionId) || sending}
                        feedback={actionFeedback?.actionId === turn.action.chatActionId ? actionFeedback : null}
                        onDecide={decide}
                      />
                    )}
                    <SourceCards sources={turn.sources} />
                  </div>
                </div>
              )}
            </div>
          ))}

          {sending && (
            <div className="chat-row" role="status">
              <span className="chat-avatar"><Bot size={16} aria-hidden="true" /></span>
              <div className="chat-assistant">
                <p className="chat-bubble chat-typing"><span /><span /><span /><span className="sr-only">Trợ lý đang trả lời…</span></p>
                {slow && <p className="chat-slow">Máy chủ có thể đang khởi động lại, lần đầu có thể mất vài phút. Bạn vui lòng đợi nhé…</p>}
              </div>
            </div>
          )}

          {error && (
            <div className="chat-error" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <p>{error.message}</p>
              {error.retry && <button type="button" className="account-text-link" onClick={retry} disabled={sending}>Gửi lại</button>}
            </div>
          )}
        </div>

        <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); submit() }}>
          <label className="sr-only" htmlFor={inputId}>Tin nhắn cho trợ lý</label>
          <textarea
            id={inputId}
            ref={input}
            rows={widget ? 1 : 2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={widget ? 'Nhập tin nhắn…' : 'Ví dụ: Đặt cho mình bác sĩ An 9h sáng mai, mình bị đau đầu'}
            aria-invalid={tooLong}
            aria-describedby={widget ? undefined : 'chat-input-hint'}
          />
          {widget && (
            <button className="chat-send" disabled={sending || loading || !draft.trim() || tooLong} aria-label="Gửi tin nhắn" title="Gửi">
              <SendHorizontal size={18} aria-hidden="true" />
            </button>
          )}
          {!widget && <div className="chat-composer-footer">
            <span id="chat-input-hint" className={tooLong ? 'chat-count chat-count--over' : 'chat-count'}>
              {tooLong ? `Tối đa ${MAX_MESSAGE_LENGTH.toLocaleString('vi-VN')} ký tự · ` : 'Enter để gửi · Shift+Enter xuống dòng · '}
              {draft.length.toLocaleString('vi-VN')}/{MAX_MESSAGE_LENGTH.toLocaleString('vi-VN')}
            </span>
            {/* Khóa gửi khi tin trước chưa có kết quả. */}
            <button className="account-button account-button--primary" disabled={sending || loading || !draft.trim() || tooLong}>
              {sending ? 'Đang gửi…' : 'Gửi'}<SendHorizontal size={15} aria-hidden="true" />
            </button>
          </div>}
          {widget && tooLong && <p className="chat-count chat-count--over chat-widget-limit">Tối đa {MAX_MESSAGE_LENGTH.toLocaleString('vi-VN')} ký tự ({draft.length.toLocaleString('vi-VN')})</p>}
        </form>
      </section>
      <p className="chat-disclaimer">{widget ? 'Trợ lý không chẩn đoán hay kê đơn. Khẩn cấp hãy gọi 115.' : <>Trợ lý không chẩn đoán hay kê đơn. Lịch hẹn chỉ được tạo, đổi hoặc hủy khi bạn bấm Xác nhận. Với triệu chứng khẩn cấp, hãy gọi 115.</>}</p>
    </div>
  )
}
