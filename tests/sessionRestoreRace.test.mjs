import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getSession, setSession } from '../src/lib/session.js'
import { restoreSession } from '../src/features/auth/api.js'
import { mockFetch, problem } from './helpers/mockApi.mjs'

// File riêng: mỗi file test chạy trong process mới nên session bắt đầu ở trạng thái 'unknown',
// giống lúc người dùng vừa tải lại trang.
const account = { userAccountId: 'test-admin', email: 'admin@example.test', displayName: 'Admin', role: 'Admin', isActive: true, patientId: null, doctorId: null }

test('a login that finishes first is not overwritten by a late restore failure', async (t) => {
  assert.equal(getSession().status, 'unknown')
  let resolve
  mockFetch(t, () => new Promise((done) => { resolve = done }))
  const restoring = restoreSession()
  while (!resolve) await new Promise((done) => setTimeout(done, 0))
  setSession({ account, patient: null, doctor: null })
  resolve(problem(401))
  await restoring
  assert.equal(getSession().status, 'authenticated')
})

test('restore is skipped once the session state is known', async (t) => {
  const calls = mockFetch(t, async () => problem(401))
  await restoreSession()
  assert.equal(calls.length, 0)
  assert.equal(getSession().profile.account.userAccountId, 'test-admin')
})
