import { resetCsrfToken } from '../../src/lib/apiClient.js'

export const CSRF_TOKEN = 'test-csrf-token'

// Giả lập fetch: tự trả lời GET /api/auth/csrf, chỉ đưa các request nghiệp vụ cho `handler`.
// Trả về mảng `calls` (đã bỏ request CSRF) và số lần lấy CSRF qua `calls.csrfRequests`.
export function mockFetch(t, handler) {
  resetCsrfToken()
  const calls = []
  calls.csrfRequests = 0
  t.mock.method(globalThis, 'fetch', async (url, options = {}) => {
    if (url.endsWith('/auth/csrf')) {
      calls.csrfRequests += 1
      return Response.json({ requestToken: `${CSRF_TOKEN}-${calls.csrfRequests}` })
    }
    calls.push({ url, ...options })
    return handler(url, options, calls)
  })
  return calls
}

export const problem = (status, fields = {}) => Response.json(
  { type: 'about:blank', title: 'Lỗi', status, traceId: 'trace-test', ...fields },
  { status, headers: { 'Content-Type': 'application/problem+json' } },
)
