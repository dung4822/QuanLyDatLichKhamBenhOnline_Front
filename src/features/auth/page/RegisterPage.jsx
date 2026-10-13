import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2 } from 'lucide-react'
import Notice from '../../../components/ui/Notice'
import AuthLayout from '../components/AuthLayout'
import { Field, PasswordField, ProfileFields } from '../components/FormFields'
import { authError, login, register } from '../api'
import { loginDestination } from '../permissions'
import { navigate } from '../../../lib/navigation'
import { emptyProfile, profilePayload, profileValidation } from '../profileValues'

export default function RegisterPage({ returnTo }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [profile, setProfile] = useState(emptyProfile)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const pending = useRef(false)
  const heading = useRef(null)
  const loginLink = `/login${returnTo ? `?next=${encodeURIComponent(returnTo)}` : ''}`
  useEffect(() => { if (step === 2 || done) heading.current?.focus() }, [step, done])

  async function submit(event) {
    event.preventDefault()
    if (pending.current) return
    setError('')
    if (step === 1) {
      if (password !== confirm) { setError('Mật khẩu xác nhận chưa khớp. Vui lòng nhập lại.'); return }
      setStep(2)
      return
    }
    const invalid = profileValidation(profile)
    if (invalid) { setError(invalid); return }
    pending.current = true
    setBusy(true)
    try {
      await register({ email: email.trim(), password, profile: profilePayload(profile) })
      // Đăng nhập luôn bằng thông tin vừa nhập để người dùng không phải gõ lại.
      try {
        const account = await login(email, password)
        navigate(loginDestination(returnTo, account.role), { replace: true })
      } catch { setDone(true) }
      setPassword(''); setConfirm('')
    } catch (failure) { setError(authError(failure)) }
    finally { pending.current = false; setBusy(false) }
  }
  return <AuthLayout register>
    {done ? <div className="auth-complete"><CheckCircle2 size={54} /><h1 ref={heading} tabIndex={-1}>Sẵn sàng chăm sóc<br />sức khỏe của bạn.</h1><p>Tài khoản và hồ sơ bệnh nhân đã được tạo thành công. Đăng nhập để đặt lịch khám đầu tiên.</p><a href={loginLink} className="account-button account-button--primary account-button--full">Đến trang đăng nhập<ArrowRight size={18} /></a></div> : <>
      <h1 ref={heading} tabIndex={-1}>Tạo tài khoản của bạn.</h1><p className="auth-description">Một nơi để đặt lịch và theo dõi những lần khám.</p>
      <ol className="auth-steps" aria-label="Tiến trình đăng ký"><li aria-current={step === 1 ? 'step' : undefined}><span>{step > 1 ? <Check size={14} /> : '1'}</span>Tài khoản</li><li aria-current={step === 2 ? 'step' : undefined}><span>2</span>Thông tin cá nhân</li></ol>
      <Notice notice={error ? { type: 'error', message: error } : null} />
      <form className="account-form" onSubmit={submit} aria-busy={busy}>
        {step === 1 ? <><Field label="Email đăng nhập"><input type="email" autoComplete="username" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ban@example.com" /></Field><PasswordField value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={12} hint="Từ 12 đến 128 ký tự. Hãy chọn mật khẩu chỉ bạn biết." /><PasswordField label="Nhập lại mật khẩu" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" minLength={12} /></> : <><p className="account-info">Thông tin này tạo hồ sơ bệnh nhân mới cho bạn. Các mục có dấu * là bắt buộc.</p><ProfileFields values={profile} onChange={(event) => setProfile((current) => ({ ...current, [event.target.name]: event.target.value }))} disabled={busy} /></>}
        <div className="account-form-actions">{step === 2 && <button type="button" className="account-button" onClick={() => { setStep(1); setError('') }} disabled={busy}><ArrowLeft size={16} />Quay lại</button>}<button className="account-button account-button--primary" disabled={busy}>{busy ? 'Đang tạo tài khoản…' : step === 1 ? 'Tiếp tục' : 'Tạo tài khoản'}<ArrowRight size={17} /></button></div>
      </form><p className="auth-help">Đã có tài khoản? <a href={loginLink}>Đăng nhập</a></p>
    </>}
  </AuthLayout>
}
