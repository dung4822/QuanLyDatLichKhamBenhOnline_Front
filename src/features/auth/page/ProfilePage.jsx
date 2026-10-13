import { useRef, useState } from 'react'
import { Check, Mail, ShieldCheck, UserRound } from 'lucide-react'
import Notice from '../../../components/ui/Notice'
import { useAuth } from '../useAuth'
import { roleLabels } from '../permissions'
import { ProfileFields } from '../components/FormFields'
import { authError, saveMyProfile } from '../api'
import { emptyProfile, profilePayload, profileValidation } from '../profileValues'

export default function ProfilePage() {
  const { profile, account, role } = useAuth()
  const [values, setValues] = useState(() => ({ ...emptyProfile, ...profile?.patient, gender: String(profile?.patient?.gender ?? '') }))
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  const changed = role === 'Patient' && JSON.stringify(profilePayload(values)) !== JSON.stringify(profilePayload({ ...emptyProfile, ...profile.patient }))
  async function submit(event) {
    event.preventDefault()
    if (pending.current) return
    const invalid = profileValidation(values)
    if (invalid) { setNotice({ type: 'error', message: invalid }); return }
    pending.current = true; setBusy(true); setNotice(null)
    try { await saveMyProfile(profilePayload(values)); setNotice({ type: 'success', message: 'Đã lưu thông tin cá nhân của bạn.' }) }
    catch (failure) { setNotice({ type: 'error', message: authError(failure) }) }
    finally { pending.current = false; setBusy(false) }
  }
  return <>
    <header className="account-page-heading"><h1>Hồ sơ của tôi</h1><p>Thông tin chính xác giúp mỗi lần thăm khám thuận tiện hơn.</p></header>
    <Notice notice={notice} />
    <section className="account-panel"><div className="account-panel-heading"><span className="account-icon"><UserRound size={21} /></span><div><h2>Thông tin cá nhân</h2><p>{role === 'Patient' ? 'Bạn có thể cập nhật thông tin liên hệ bên dưới.' : 'Thông tin được quản lý bởi phòng khám.'}</p></div>{profile?.patient && <span className="account-tag">Hồ sơ #{profile.patient.patientId}</span>}</div>
      {role === 'Patient' ? <form className="account-form" onSubmit={submit} aria-busy={busy}><ProfileFields values={values} onChange={(event) => { setValues((current) => ({ ...current, [event.target.name]: event.target.value })); setNotice(null) }} disabled={busy} /><div className="account-save-bar"><p>{changed ? 'Bạn có thay đổi chưa lưu.' : 'Thông tin hồ sơ hiện tại của bạn.'}</p><button type="submit" className="account-button account-button--primary" disabled={busy || !changed}><Check size={17} />{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</button></div></form>
        : <dl className="account-details">{Object.entries(profile.doctor ? { 'Họ và tên': profile.doctor.fullName, 'Chuyên khoa': profile.doctor.specialtyName, 'Số điện thoại': profile.doctor.phoneNumber, 'Email liên hệ': profile.doctor.email, 'Địa chỉ': profile.doctor.address, 'Kinh nghiệm': `${profile.doctor.experience} năm` } : { 'Tên hiển thị': account.displayName, 'Vai trò': roleLabels[role] }).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Chưa cung cấp'}</dd></div>)}</dl>}
    </section>
    <section className="account-panel account-login-summary"><span className="account-icon"><ShieldCheck size={21} /></span><div><h2>Tài khoản đăng nhập</h2><p><Mail size={15} />{account.email}</p><small>{roleLabels[role]} · Email đăng nhập được giữ riêng với thông tin liên hệ.</small></div><a href="/me/security" className="account-text-link">Đổi mật khẩu →</a></section>
  </>
}
