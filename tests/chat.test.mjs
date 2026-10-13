import assert from 'node:assert/strict'
import { test } from 'node:test'
import { confirmChatAction, createChatSession, getChatSession, newPendingMessage, rejectChatAction, sendChatMessage } from '../src/features/chat/api/chatApi.js'
import { parseReply } from '../src/features/chat/parseReply.js'
import { canVisit, loginDestination } from '../src/features/auth/permissions.js'
import { mockFetch, problem } from './helpers/mockApi.mjs'

const SESSION_ID = '7d0f3c1a-1111-4222-8333-944455556666'
const ACTION = {
  chatActionId: '0b6a4f0e-2a3b-4c5d-8e9f-1a2b3c4d5e6f',
  type: 'BookAppointment',
  status: 'Pending',
  title: 'Đặt lịch khám',
  details: [{ label: 'Bác sĩ', before: null, value: 'Nguyễn Văn An' }, { label: 'Giờ khám', before: '08:00 - 08:30', value: '09:00 - 09:30' }],
  expiresAt: '2026-10-07T03:10:00Z',
  completedAt: null,
  failureReason: null,
}

test('chat sends message to the session with clientMessageId and CSRF', async (t) => {
  const response = { chatSessionId: SESSION_ID, chatTurnId: 3, reply: 'Bạn kiểm tra thẻ nhé.', action: ACTION, sources: [{ tool: 'get_doctors', data: { items: [], hasMore: false } }, { data: {} }] }
  const calls = mockFetch(t, async () => Response.json(response))
  const pending = newPendingMessage('  Đặt bác sĩ An 9h  ')
  const result = await sendChatMessage(SESSION_ID, pending)
  assert.equal(calls[0].url, `/api/chats/sessions/${SESSION_ID}/messages`)
  assert.equal(calls[0].method, 'POST')
  assert.ok(calls[0].headers.get('X-CSRF-TOKEN'))
  assert.deepEqual(JSON.parse(calls[0].body), { message: 'Đặt bác sĩ An 9h', clientMessageId: pending.clientMessageId })
  assert.match(pending.clientMessageId, /^[0-9a-f-]{36}$/)
  assert.notEqual(pending.clientMessageId, '00000000-0000-0000-0000-000000000000')
  assert.equal(result.chatTurnId, 3)
  assert.equal(result.action.status, 'Pending')
  assert.deepEqual(result.action.details[1], { label: 'Giờ khám', before: '08:00 - 08:30', value: '09:00 - 09:30' })
  assert.equal(result.sources.length, 1, 'sources without a tool name are dropped')
})

test('retrying a message resends the same clientMessageId', async (t) => {
  const bodies = []
  mockFetch(t, async (url, options) => {
    bodies.push(JSON.parse(options.body))
    return bodies.length === 1 ? problem(502, { detail: 'Trợ lý phản hồi quá thời gian chờ.' }) : Response.json({ chatTurnId: 1, reply: 'Xong', action: null, sources: [] })
  })
  const pending = newPendingMessage('Xin chào')
  await assert.rejects(sendChatMessage(SESSION_ID, pending), { status: 502 })
  await sendChatMessage(SESSION_ID, pending)
  assert.equal(bodies[0].clientMessageId, bodies[1].clientMessageId)
})

test('chat sessions: create, load turns with action cards', async (t) => {
  const calls = mockFetch(t, async (url) => url.endsWith('/chats/sessions')
    ? Response.json({ chatSessionId: SESSION_ID, title: 'Cuộc trò chuyện mới', createdAt: '2026-10-07T03:00:00Z', updatedAt: '2026-10-07T03:00:00Z' }, { status: 201 })
    : Response.json({ session: { chatSessionId: SESSION_ID, title: 'Đặt bác sĩ An', createdAt: '', updatedAt: '' }, turns: [{ chatTurnId: 1, message: 'Đặt bác sĩ An', reply: 'Mời bạn xác nhận', createdAt: '', action: ACTION }, { chatTurnId: 2, message: 'Cảm ơn', reply: 'Không có gì', createdAt: '', action: null }] }))
  assert.equal((await createChatSession()).chatSessionId, SESSION_ID)
  const detail = await getChatSession(SESSION_ID)
  assert.equal(calls[1].url, `/api/chats/sessions/${SESSION_ID}`)
  assert.equal(detail.turns.length, 2)
  assert.equal(detail.turns[0].action.chatActionId, ACTION.chatActionId)
  assert.equal(detail.turns[1].action, null)
})

test('confirm/reject post without body and return the updated action', async (t) => {
  const calls = mockFetch(t, async (url) => Response.json({ ...ACTION, status: url.endsWith('/confirm') ? 'Confirmed' : 'Rejected', completedAt: '2026-10-07T03:02:41Z' }))
  assert.equal((await confirmChatAction(ACTION.chatActionId)).status, 'Confirmed')
  assert.equal((await rejectChatAction(ACTION.chatActionId)).status, 'Rejected')
  assert.equal(calls[0].url, `/api/chats/actions/${ACTION.chatActionId}/confirm`)
  assert.equal(calls[1].url, `/api/chats/actions/${ACTION.chatActionId}/reject`)
  assert.equal(calls[0].body, undefined)
  assert.ok(calls[0].headers.get('X-CSRF-TOKEN'))
  mockFetch(t, async () => problem(409, { detail: 'Khung giờ vừa được người khác đặt.' }))
  await assert.rejects(confirmChatAction(ACTION.chatActionId), (error) => error.status === 409 && /người khác/.test(error.message))
})

test('chat rejects malformed responses', async (t) => {
  mockFetch(t, async () => Response.json({ reply: 42 }))
  await assert.rejects(sendChatMessage(SESSION_ID, newPendingMessage('Xin chào')), { status: 502 })
  mockFetch(t, async () => Response.json({ chatTurnId: 1, reply: 'x', action: { chatActionId: 'a', status: 'Done' } }))
  await assert.rejects(sendChatMessage(SESSION_ID, newPendingMessage('Xin chào')), { status: 502 })
})

test('only patients can open the assistant', () => {
  for (const role of ['Patient', 'Doctor', 'Receptionist', 'Admin']) assert.equal(canVisit('/me/assistant', role), role === 'Patient')
  assert.equal(loginDestination('/me/assistant', 'Patient'), '/me/assistant')
  assert.equal(loginDestination('/me/assistant', 'Admin'), '/admin/appointments')
})

test('reply parser keeps paragraphs and bullet/numbered lists apart', () => {
  assert.deepEqual(parseReply('Có các khoa:\n- Nhi\n- Tim mạch\n\nBạn chọn khoa nào?\n1. Sáng\n2. Chiều'), [
    { type: 'paragraph', lines: ['Có các khoa:'] },
    { type: 'list', ordered: false, items: ['Nhi', 'Tim mạch'], closed: true },
    { type: 'paragraph', lines: ['Bạn chọn khoa nào?'] },
    { type: 'list', ordered: true, items: ['Sáng', 'Chiều'] },
  ])
})
