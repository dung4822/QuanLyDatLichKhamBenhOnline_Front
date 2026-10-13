import { useRef, useState } from 'react'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import Notice from '../../../components/ui/Notice'
import { PasswordField } from '../components/FormFields'
import { authError, changePassword } from '../api'
import { navigate } from '../../../lib/navigation'

export default function SecurityPage() {
  const [currentPassword, setCurrent] = useState('')
  const [newPassword, setNew] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  async function submit(event) {
    event.preventDefault()
    if (pending.current) return
    if (currentPassword === newPassword) { setError('Mật khẩu mới cần khác mật khẩu hiện tại.'); return }
    if (newPassword !== confirm) { setError('Mật khẩu xác nhận chưa khớp.'); return }
    pending.current = true; setBusy(true); setError('')
    try { await changePassword({ currentPassword, newPassword }); navigate('/login', { replace: true }) }
    catch (failure) { setError(authError(failure, 'password')) }
    finally { pending.current = false; setBusy(false) }
  }
  return <><header className="account-page-heading"><h1>Bảo mật tài khoản</h1><p>Giữ tài khoản an toàn bằng một mật khẩu riêng của bạn.</p></header><section className="account-panel account-security-panel"><div className="account-panel-heading"><span className="account-icon"><LockKeyhole size={21} /></span><div><h2>Đổi mật khẩu</h2><p>Chọn mật khẩu dễ nhớ với bạn, khó đoán với người khác.</p></div></div><Notice notice={error ? { type: 'error', message: error } : null} /><form onSubmit={submit} className="account-form" aria-busy={busy}><PasswordField label="Mật khẩu hiện tại" value={currentPassword} onChange={(event) => setCurrent(event.target.value)} autoComplete="current-password" disabled={busy} /><PasswordField label="Mật khẩu mới" value={newPassword} onChange={(event) => setNew(event.target.value)} autoComplete="new-password" minLength={12} hint="Từ 12 đến 128 ký tự, khác mật khẩu hiện tại." disabled={busy} /><PasswordField label="Nhập lại mật khẩu mới" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" minLength={12} disabled={busy} /><p className="account-info"><ShieldCheck size={18} />Sau khi đổi mật khẩu, tất cả phiên đăng nhập sẽ kết thúc. Bạn cần đăng nhập lại bằng mật khẩu mới.</p><div className="account-form-actions"><button className="account-button account-button--primary" disabled={busy}>{busy ? 'Đang cập nhật…' : 'Cập nhật mật khẩu'}<ShieldCheck size={17} /></button></div></form></section></>
}
