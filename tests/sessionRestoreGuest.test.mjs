import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getSession } from '../src/lib/session.js'
import { restoreSession } from '../src/features/auth/api.js'
import { mockFetch, problem } from './helpers/mockApi.mjs'

test('without a valid cookie the app falls back to guest without an error message', async (t) => {
  assert.equal(getSession().status, 'unknown')
  mockFetch(t, async () => problem(401))
  await restoreSession()
  assert.equal(getSession().status, 'guest')
  assert.equal(getSession().profile, null)
  assert.equal(getSession().reason, '')
})
