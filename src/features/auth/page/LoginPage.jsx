import { useRef, useState } from 'react'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import Notice from '../../../components/ui/Notice'
import AuthLayout from '../components/AuthLayout'
import { Field, PasswordField } from '../components/FormFields'
import { authError, login } from '../api'
import { loginDestination } from '../permissions'
import { useAuth } from '../useAuth'
import { navigate } from '../../../lib/navigation'

export default function LoginPage({ returnTo }) {
  const { reason } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(false)
  async function submit(event) {
    event.preventDefault()
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    try {
      const account = await login(email, password)
      setPassword('')
      navigate(loginDestination(returnTo, account.role), { replace: true })
    } catch (failure) { setError(authError(failure, 'login')) }
    finally { pending.current = false; setBusy(false) }
  }
  return <AuthLayout>
    <h1>Chào mừng trở lại.</h1>
    <p className="auth-description">Đăng nhập để tiếp tục chăm sóc sức khỏe<br className="desktop-break" /> và quản lý lịch hẹn của bạn.</p>
    {reason && !error && <p className="account-info" role="status">{reason}</p>}
    <Notice notice={error ? { type: 'error', message: error } : null} />
    <form className="account-form" onSubmit={submit} aria-busy={busy}>
      <Field label="Email đăng nhập"><input type="email" autoComplete="username" name="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ban@example.com" required maxLength={254} disabled={busy} /></Field>
      <PasswordField value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" name="password" placeholder="Nhập mật khẩu của bạn" disabled={busy} />
      <button className="account-button account-button--primary account-button--full" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}<ArrowRight size={18} /></button>
    </form>
    <p className="auth-help">Cần hỗ trợ đăng nhập? <a href="/#contact">Liên hệ phòng khám</a></p>
    <div className="auth-divider"><span>Lần đầu đến với MediCare+?</span></div>
    <a className="account-button account-button--full" href={`/register${returnTo ? `?next=${encodeURIComponent(returnTo)}` : ''}`}>Tạo tài khoản bệnh nhân<ArrowRight size={16} /></a>
    <p className="auth-privacy"><ShieldCheck size={15} />Thông tin của bạn được bảo vệ và giữ riêng tư.</p>
  </AuthLayout>
}
