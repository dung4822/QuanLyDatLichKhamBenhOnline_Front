import { useCallback, useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '../../lib/apiClient'
import { refreshMyProfile } from '../auth/api'
import {
  MAX_MESSAGE_LENGTH, SEND_TIMEOUT_MS, confirmChatAction, createChatSession, getChatSession, getChatSessions,
  newPendingMessage, rejectChatAction, sendChatMessage,
} from './api/chatApi'

const CHAT_MESSAGES = {
  0: 'Mất kết nối tới máy chủ. Bấm "Gửi lại" khi mạng ổn định.',
  400: 'Tin nhắn chưa hợp lệ. Vui lòng rút gọn câu hỏi rồi thử lại.',
  403: 'Trợ lý chỉ dành cho tài khoản bệnh nhân.',
  429: 'Bạn gửi quá nhanh. Vui lòng chờ khoảng một phút rồi bấm "Gửi lại".',
  502: 'Trợ lý đang bận hoặc chưa phản hồi kịp. Vui lòng gửi lại.',
}
const TIMEOUT_MESSAGE = 'Trợ lý trả lời quá lâu. Bấm "Gửi lại" để nhận kết quả (yêu cầu sẽ không bị xử lý hai lần).'
const SESSION_GONE = 'Cuộc trò chuyện không còn tồn tại. Bấm "Gửi lại" để gửi tin nhắn này trong cuộc trò chuyện mới.'

const ACTION_MESSAGES = {
  404: 'Không tìm thấy đề xuất này. Cuộc trò chuyện đã được tải lại.',
  409: 'Đề xuất không còn hiệu lực. Cuộc trò chuyện đã được tải lại.',
}
const DONE_MESSAGES = {
  BookAppointment: 'Đã đặt lịch khám. Bạn có thể xem trong "Lịch hẹn của tôi".',
  CancelAppointment: 'Đã hủy lịch khám.',
  RescheduleAppointment: 'Đã đổi lịch khám. Bạn có thể xem trong "Lịch hẹn của tôi".',
  UpdateProfile: 'Đã cập nhật hồ sơ của bạn.',
}

// Lỗi mà gửi lại ĐÚNG clientMessageId là an toàn và có ích (server dựa vào id để không xử lý hai lần).
const RETRYABLE = new Set(['timeout', 0, 404, 429, 500, 502, 503, 504])

const storageKey = (accountId) => `medicare.chat.session.${accountId}`
function readStored(accountId) {
  try { return window.localStorage.getItem(storageKey(accountId)) } catch { return null }
}
function writeStored(accountId, sessionId) {
  try {
    if (sessionId) window.localStorage.setItem(storageKey(accountId), sessionId)
    else window.localStorage.removeItem(storageKey(accountId))
  } catch { /* trình duyệt chặn storage: chỉ mất khả năng tự mở lại cuộc trò chuyện */ }
}

const fromServerTurn = (turn) => ({ key: `turn-${turn.chatTurnId}`, message: turn.message, reply: turn.reply, action: turn.action, sources: [] })

// Server lưu hội thoại và thẻ xác nhận. Hook giữ:
// - `turns`: các lượt đang hiển thị (lượt đang gửi/lỗi chỉ có ở client, `reply` = null).
// - `error.retry`: đúng object { message, clientMessageId } của tin nhắn lỗi, để "Gửi lại" không tạo Guid mới.
export function useChat(accountId) {
  const [sessionId, setSessionId] = useState(null)
  const [sessions, setSessions] = useState([])
  const [turns, setTurns] = useState([])
  // Có cuộc trò chuyện đã lưu thì mở trang ở trạng thái đang tải.
  const [loading, setLoading] = useState(() => Boolean(readStored(accountId)))
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [busyActionId, setBusyActionId] = useState(null)
  const [actionFeedback, setActionFeedback] = useState(null)
  const sessionRef = useRef(null)
  const controller = useRef(null)
  const loadToken = useRef(0)

  const remember = useCallback((id) => {
    sessionRef.current = id
    setSessionId(id)
    writeStored(accountId, id)
  }, [accountId])

  const refreshSessions = useCallback(() => {
    getChatSessions().then(setSessions, () => { /* danh sách chỉ là tiện ích, lỗi thì giữ danh sách cũ */ })
  }, [])

  const loadSession = useCallback((id) => {
    const token = ++loadToken.current
    return getChatSession(id).then((detail) => {
      if (token !== loadToken.current) return
      remember(detail.session.chatSessionId)
      setTurns(detail.turns.map(fromServerTurn))
      setError(null)
      setLoading(false)
    }, (failure) => {
      if (token !== loadToken.current || failure?.name === 'AbortError') return
      if (failure?.status === 404) {
        // Cuộc trò chuyện đã mất (hoặc của tài khoản khác): bắt đầu cuộc mới khi người dùng gửi tin.
        remember(null)
        setTurns([])
      } else {
        setError({ message: getErrorMessage(failure, CHAT_MESSAGES), retry: null })
      }
      setLoading(false)
    })
  }, [remember])

  useEffect(() => {
    const stored = readStored(accountId)
    if (stored) loadSession(stored)
    refreshSessions()
    return () => {
      loadToken.current += 1
      controller.current?.abort()
    }
  }, [accountId, loadSession, refreshSessions])

  const send = useCallback(async (input) => {
    // Chuỗi = tin nhắn mới (Guid mới). Object = gửi lại tin nhắn lỗi với đúng Guid cũ.
    const pending = typeof input === 'string' ? newPendingMessage(input) : input
    if (!pending?.message || pending.message.length > MAX_MESSAGE_LENGTH || controller.current) return { sent: false }

    const current = new AbortController()
    controller.current = current
    let timedOut = false
    const timer = window.setTimeout(() => { timedOut = true; current.abort() }, SEND_TIMEOUT_MS)
    const key = `local-${pending.clientMessageId}`
    setTurns((items) => [...items.filter((item) => !item.failed), { key, message: pending.message, reply: null, action: null, sources: [] }])
    setError(null)
    setActionFeedback(null)
    setSending(true)
    try {
      let id = sessionRef.current
      if (!id) {
        id = (await createChatSession()).chatSessionId
        if (current.signal.aborted) throw new DOMException('Aborted', 'AbortError')
        remember(id)
      }
      const result = await sendChatMessage(id, pending, current.signal)
      setTurns((items) => items.map((item) => {
        if (item.key === key) return { key: `turn-${result.chatTurnId}`, message: pending.message, reply: result.reply, action: result.action, sources: result.sources }
        // Mỗi cuộc trò chuyện chỉ có một thẻ Pending: thẻ mới thay thẻ cũ.
        if (result.action && item.action?.status === 'Pending' && item.action.chatActionId !== result.action.chatActionId) {
          return { ...item, action: { ...item.action, status: 'Superseded' } }
        }
        return item
      }))
      refreshSessions()
      return { sent: true }
    } catch (failure) {
      if (failure?.name === 'AbortError' && !timedOut) return { sent: false }
      const status = timedOut ? 'timeout' : failure?.status ?? 0
      if (status === 404) remember(null)
      setTurns((items) => items.map((item) => (item.key === key ? { ...item, failed: true } : item)))
      setError({
        message: status === 'timeout' ? TIMEOUT_MESSAGE : status === 404 ? SESSION_GONE : getErrorMessage(failure, CHAT_MESSAGES),
        retry: RETRYABLE.has(status) ? pending : null,
      })
      // Lỗi không gửi lại được (VD tin nhắn sai định dạng): trang trả câu chữ về ô nhập để sửa.
      return { sent: false, editable: !RETRYABLE.has(status) }
    } finally {
      window.clearTimeout(timer)
      if (controller.current === current) controller.current = null
      setSending(false)
    }
  }, [refreshSessions, remember])

  const decide = useCallback(async (action, decision) => {
    if (busyActionId) return
    setBusyActionId(action.chatActionId)
    setActionFeedback(null)
    try {
      const updated = await (decision === 'confirm' ? confirmChatAction : rejectChatAction)(action.chatActionId)
      setTurns((items) => items.map((item) => (item.action?.chatActionId === updated.chatActionId ? { ...item, action: updated } : item)))
      if (updated.status === 'Confirmed') {
        setActionFeedback({ actionId: updated.chatActionId, tone: 'success', message: DONE_MESSAGES[updated.type] || 'Đã thực hiện.' })
        if (updated.type === 'UpdateProfile') refreshMyProfile().catch(() => {})
      }
    } catch (failure) {
      if (failure?.name === 'AbortError') return
      // Mất response: thẻ vẫn Pending trên màn hình, bấm lại an toàn (confirm idempotent ở server).
      setActionFeedback({ actionId: action.chatActionId, tone: 'error', message: getErrorMessage(failure, ACTION_MESSAGES) })
      if ((failure?.status === 404 || failure?.status === 409) && sessionRef.current) loadSession(sessionRef.current)
    } finally {
      setBusyActionId(null)
    }
  }, [busyActionId, loadSession])

  const startNew = useCallback(() => {
    controller.current?.abort()
    controller.current = null
    loadToken.current += 1
    remember(null)
    setTurns([])
    setError(null)
    setActionFeedback(null)
    setSending(false)
    setLoading(false)
  }, [remember])

  const open = useCallback((id) => {
    if (controller.current || id === sessionRef.current) return
    setActionFeedback(null)
    setTurns([])
    setLoading(true)
    loadSession(id)
  }, [loadSession])

  return {
    sessionId, sessions, turns, loading, sending, error, busyActionId, actionFeedback,
    send, retry: () => error?.retry && send(error.retry), decide, startNew, open,
  }
}
