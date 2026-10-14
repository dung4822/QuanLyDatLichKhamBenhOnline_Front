import { useRef, useState } from 'react'
import { ArrowRight, Hourglass, ShieldCheck } from 'lucide-react'
import Notice from '../../../components/ui/Notice'
import AuthLayout from '../components/AuthLayout'
import { Field, PasswordField } from '../components/FormFields'
import { authError, login } from '../api'
import { loginDestination } from '../permissions'
import { useAuth } from '../useAuth'
import { navigate } from '../../../lib/navigation'
import { DEMO_ACCOUNTS, findDemoAccount } from '../../demo/demoAccounts'
import '../../demo/demo.css'

// /login?demo=patient (từ trang tài khoản dùng thử) điền sẵn tài khoản demo; URL chỉ chứa tên vai trò.
const demoFromUrl = () => typeof window === 'undefined' ? null : findDemoAccount(new URLSearchParams(window.location.search).get('demo'))

export default function LoginPage({ returnTo }) {
  const { reason } = useAuth()
  const [email, setEmail] = useState(() => demoFromUrl()?.email || '')
  const [password, setPassword] = useState(() => demoFromUrl()?.password || '')
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
    <div className="demo-login-hint" role="note">
      <Hourglass size={16} aria-hidden="true" />
      <p>Lần đầu sử dụng có thể mất <strong>vài phút</strong> để máy chủ khởi động, nếu đăng nhập chậm hoặc lỗi hãy đợi rồi thử lại. Dùng thử nhanh: {DEMO_ACCOUNTS.map((demo, index) => <span key={demo.key}>{index > 0 && ' · '}<button type="button" className="account-text-link" onClick={() => { setEmail(demo.email); setPassword(demo.password) }} disabled={busy}>{demo.role}</button></span>)} (<a href="/demo-accounts">xem tất cả</a>)</p>
    </div>
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
