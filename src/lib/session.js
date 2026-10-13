// Trạng thái đăng nhập phía trình duyệt.
// Cookie đăng nhập là HttpOnly nên JavaScript không đọc được và cũng không cần đọc:
// module này chỉ giữ hồ sơ đã được server xác nhận (GET /api/me/profile) và hạn phiên.
//
// status:
// - 'unknown': chưa hỏi server (lúc vừa tải trang, đang khôi phục phiên từ cookie).
// - 'authenticated': đã có hồ sơ hợp lệ.
// - 'guest': chưa đăng nhập hoặc phiên đã bị thu hồi.
//
// version tăng mỗi khi danh tính đổi (đăng nhập, đăng xuất, phiên hết hạn). API client dùng nó
// để bỏ qua response trễ của danh tính cũ và để biết khi nào phải lấy CSRF token mới.
const initialSnapshot = { status: 'unknown', profile: null, expiresAt: null, reason: '', version: 0 }
let snapshot = initialSnapshot
const listeners = new Set()

function publish(next) {
  snapshot = next
  listeners.forEach((listener) => listener())
}

export function subscribeSession(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
export const getSession = () => snapshot
// App không hydrate HTML render sẵn, nên snapshot phía server chính là trạng thái hiện tại.
export const getServerSession = () => snapshot

export function setSession(profile, expiresAt = null) {
  publish({ status: 'authenticated', profile, expiresAt, reason: '', version: snapshot.version + 1 })
}

export function updateSessionProfile(profile) {
  publish({ ...snapshot, profile })
}

export function clearSession(reason = '') {
  // Đang là khách thì không cần đổi version: tránh hủy oan các request công khai đang chạy.
  const identityChanged = snapshot.status === 'authenticated'
  publish({ status: 'guest', profile: null, expiresAt: null, reason, version: snapshot.version + (identityChanged ? 1 : 0) })
}

export function checkSessionExpiry() {
  // expiresAt chỉ biết được ngay sau khi đăng nhập; phiên khôi phục từ cookie sẽ do server báo 401.
  if (snapshot.profile && snapshot.expiresAt && Date.parse(snapshot.expiresAt) <= Date.now()) {
    clearSession('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
  }
}
