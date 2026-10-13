import { ApiError, api } from '../../../lib/apiClient.js'

// Giới hạn khớp với validator ở backend.
export const MAX_MESSAGE_LENGTH = 4000
// Server có thể mất tới 60 giây (trợ lý tra cứu nhiều bước); chờ thêm một chút trước khi coi là timeout.
export const SEND_TIMEOUT_MS = 75_000

export const ACTION_STATUSES = ['Pending', 'Confirmed', 'Rejected', 'Expired', 'Superseded', 'Failed']

// Hợp đồng: docs/api/CHATS_API.md của backend (chỉ vai trò Patient).
// Hội thoại và thẻ xác nhận lưu ở server. Trợ lý KHÔNG tự ghi dữ liệu: nó chỉ tạo thẻ `action`,
// dữ liệu chỉ đổi khi người dùng bấm Xác nhận (confirmChatAction).

const text = (value) => (typeof value === 'string' ? value : '')

function toSession(data) {
  if (typeof data?.chatSessionId !== 'string' || !data.chatSessionId) throw new ApiError(502)
  return { chatSessionId: data.chatSessionId, title: text(data.title) || 'Cuộc trò chuyện mới', createdAt: text(data.createdAt), updatedAt: text(data.updatedAt) }
}

export function toAction(data) {
  if (!data) return null
  if (typeof data.chatActionId !== 'string' || !ACTION_STATUSES.includes(data.status)) throw new ApiError(502)
  return {
    chatActionId: data.chatActionId,
    type: text(data.type),
    status: data.status,
    title: text(data.title) || 'Thao tác',
    details: (Array.isArray(data.details) ? data.details : [])
      .filter((item) => typeof item?.label === 'string')
      .map((item) => ({ label: item.label, before: typeof item.before === 'string' ? item.before : null, value: text(item.value) })),
    expiresAt: text(data.expiresAt),
    completedAt: data.completedAt || null,
    failureReason: data.failureReason || null,
  }
}

function toTurn(data) {
  if (!Number.isInteger(data?.chatTurnId) || typeof data.reply !== 'string') throw new ApiError(502)
  return { chatTurnId: data.chatTurnId, message: text(data.message), reply: data.reply, createdAt: text(data.createdAt), action: toAction(data.action) }
}

export async function createChatSession() {
  return toSession(await api.post('/chats/sessions'))
}

export async function getChatSessions(signal) {
  const data = await api.get('/chats/sessions', { signal })
  if (!Array.isArray(data)) throw new ApiError(502)
  return data.map(toSession)
}

export async function getChatSession(sessionId, signal) {
  const data = await api.get(`/chats/sessions/${sessionId}`, { signal })
  if (!Array.isArray(data?.turns)) throw new ApiError(502)
  return { session: toSession(data.session), turns: data.turns.map(toTurn) }
}

// `pending` = { message, clientMessageId }. Gửi lại sau lỗi mạng/timeout/502/429 phải dùng ĐÚNG object cũ:
// server nhận ra clientMessageId và trả lại câu trả lời + thẻ cũ thay vì xử lý lần hai.
export async function sendChatMessage(sessionId, pending, signal) {
  const data = await api.post(`/chats/sessions/${sessionId}/messages`, { message: pending.message, clientMessageId: pending.clientMessageId }, { signal })
  if (typeof data?.reply !== 'string' || !Number.isInteger(data.chatTurnId)) throw new ApiError(502)
  return {
    chatTurnId: data.chatTurnId,
    reply: data.reply,
    action: toAction(data.action),
    sources: Array.isArray(data.sources) ? data.sources.filter((item) => typeof item?.tool === 'string') : [],
  }
}

export const newPendingMessage = (message) => ({ message: message.trim(), clientMessageId: crypto.randomUUID() })

export async function confirmChatAction(actionId) {
  return toAction(await api.post(`/chats/actions/${actionId}/confirm`))
}

export async function rejectChatAction(actionId) {
  return toAction(await api.post(`/chats/actions/${actionId}/reject`))
}
