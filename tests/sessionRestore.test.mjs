import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getSession } from '../src/lib/session.js'
import { restoreSession } from '../src/features/auth/api.js'
import { mockFetch } from './helpers/mockApi.mjs'

const profile = {
  account: { userAccountId: 'test-patient', email: 'patient@example.test', displayName: 'Patient', role: 'Patient', isActive: true, patientId: 12, doctorId: null },
  patient: { patientId: 12, fullName: 'Patient' },
  doctor: null,
}

test('page reload restores the session from the HttpOnly cookie', async (t) => {
  assert.equal(getSession().status, 'unknown')
  const calls = mockFetch(t, async () => Response.json(profile))
  await Promise.all([restoreSession(), restoreSession()])
  assert.equal(calls.length, 1, 'concurrent restores share one request')
  assert.equal(calls[0].url, '/api/me/profile')
  assert.equal(calls[0].credentials, 'include')
  assert.equal(getSession().status, 'authenticated')
  assert.deepEqual(getSession().profile, profile)
  assert.equal(getSession().expiresAt, null)
})
