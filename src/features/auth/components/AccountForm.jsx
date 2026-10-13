import { useEffect, useRef, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import Modal from '../../../components/ui/Modal'
import { getPatients } from '../../patients/api/patientsApi'
import { getDoctors } from '../../doctors/api/doctorsApi'
import { Field, PasswordField } from './FormFields'
import { authError, createAccount, updateAccountAccess } from '../api'
import { roleLabels } from '../permissions'
import { useAuth } from '../useAuth'
import { clearSession } from '../../../lib/session'
import { navigate } from '../../../lib/navigation'

export default function AccountForm({ account, onClose, onSaved }) {
  const { account: currentAccount } = useAuth()
  const [values, setValues] = useState({ email: '', password: '', displayName: '', role: 'Patient', patientId: '', doctorId: '', isActive: true, ...account })
  const [profiles, setProfiles] = useState(null)
  const [revision, setRevision] = useState(0)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  const linkedRole = ['Patient', 'Doctor'].includes(values.role)
  const key = `${values.role}/${revision}`
  const ready = !linkedRole || profiles?.key === key
  const linkKey = values.role === 'Patient' ? 'patientId' : 'doctorId'
  const options = ready ? profiles?.items || [] : []
  const visible = options.filter((item) => String(item[linkKey]) === String(values[linkKey]) || `${item.fullName} ${item.phoneNumber || ''} ${item[linkKey]}`.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')))
  useEffect(() => {
    if (!linkedRole) return
    let active = true
    const request = values.role === 'Patient' ? getPatients : getDoctors
    request().then((items) => {
      if (!Array.isArray(items)) throw new Error('Invalid profiles')
      if (active) setProfiles({ key, items })
    }).catch((failure) => { if (active) setProfiles({ key, error: authError(failure) }) })
    return () => { active = false }
  }, [key, linkedRole, values.role])
  const change = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  async function submit(event) {
    event.preventDefault()
    if (pending.current || !ready) return
    if (linkedRole && !options.some((item) => String(item[linkKey]) === String(values[linkKey]))) { setError('Vui lòng chọn một hồ sơ còn tồn tại trong danh sách.'); return }
    if (!account && !values.displayName.trim()) { setError('Vui lòng nhập tên hiển thị.'); return }
    const access = { role: values.role, patientId: values.role === 'Patient' ? Number(values.patientId) : null, doctorId: values.role === 'Doctor' ? Number(values.doctorId) : null, isActive: values.isActive }
    pending.current = true; setBusy(true); setError('')
    try {
      if (account) await updateAccountAccess(account.userAccountId, access)
      else {
        const { isActive: unused, ...links } = access
        void unused
        await createAccount({ ...links, email: values.email.trim(), password: values.password, displayName: values.displayName.trim() })
      }
      if (account?.userAccountId === currentAccount?.userAccountId) {
        clearSession('Đã cập nhật quyền tài khoản của bạn. Vui lòng đăng nhập lại.')
        navigate('/login')
      } else onSaved(account ? 'Đã cập nhật quyền truy cập. Các phiên cũ của tài khoản đã kết thúc.' : linkedRole ? 'Đã tạo tài khoản và liên kết hồ sơ thành công.' : 'Đã tạo tài khoản nhân viên thành công.')
    } catch (failure) { setError(authError(failure)) }
    finally { pending.current = false; setBusy(false) }
  }
  return <Modal title={account ? 'Quyền truy cập tài khoản' : 'Tạo tài khoản mới'} description={account ? `${account.displayName} · ${account.email}` : 'Tạo tài khoản nhân viên hoặc liên kết với hồ sơ đã có.'} onClose={onClose} isBusy={busy} errorMessage={error}>
    <form className="account-form" onSubmit={submit} aria-busy={busy}>
      {!account && <><Field label="Tên hiển thị *"><input name="displayName" value={values.displayName} onChange={change} required maxLength={100} disabled={busy} placeholder="Nguyễn Văn An" /></Field><Field label="Email đăng nhập *"><input name="email" type="email" value={values.email} onChange={change} required maxLength={254} autoComplete="off" disabled={busy} placeholder="taikhoan@example.com" /></Field><PasswordField label="Mật khẩu ban đầu *" name="password" value={values.password} onChange={change} minLength={12} autoComplete="new-password" hint="Từ 12 đến 128 ký tự." disabled={busy} /></>}
      <Field label="Vai trò *"><select name="role" value={values.role} onChange={(event) => { setValues((current) => ({ ...current, role: event.target.value, patientId: '', doctorId: '' })); setSearch('') }} disabled={busy}>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
      {linkedRole && <>{!ready ? <p role="status" className="account-info">Đang tải hồ sơ có thể liên kết…</p> : profiles?.error ? <div role="alert" className="account-info">{profiles.error}<button type="button" className="account-text-link" onClick={() => setRevision((value) => value + 1)}>Thử lại</button></div> : <><Field label="Tìm hồ sơ"><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} disabled={busy} placeholder="Tên, số điện thoại hoặc mã hồ sơ" /></Field><Field label={`Hồ sơ ${values.role === 'Patient' ? 'bệnh nhân' : 'bác sĩ'} *`} hint="Hãy xác minh danh tính trước khi liên kết. Một hồ sơ chỉ dùng cho một tài khoản."><select required value={values[linkKey] || ''} name={linkKey} onChange={change} disabled={busy}><option value="">Chọn hồ sơ đã tồn tại</option>{values[linkKey] && !options.some((item) => String(item[linkKey]) === String(values[linkKey])) && <option value={values[linkKey]} disabled>Hồ sơ #{values[linkKey]} không còn khả dụng</option>}{visible.map((item) => <option value={item[linkKey]} key={item[linkKey]}>#{item[linkKey]} · {item.fullName}{item.phoneNumber ? ` · ${item.phoneNumber}` : ''}</option>)}</select></Field>{!visible.length && <p className="account-info">Không có hồ sơ phù hợp. Hãy tạo hồ sơ trong mục Bệnh nhân hoặc Bác sĩ trước.</p>}</>}</>}
      {account && <><label className="account-access-switch"><span>Cho phép tài khoản hoạt động</span><input type="checkbox" checked={values.isActive} onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.checked }))} disabled={busy} /></label><p className="account-info"><ShieldCheck size={18} />Lưu thay đổi sẽ kết thúc tất cả phiên đăng nhập của tài khoản này. {account.userAccountId === currentAccount?.userAccountId ? 'Bạn đang chỉnh sửa tài khoản của chính mình và sẽ cần đăng nhập lại.' : 'Người dùng cần đăng nhập lại với quyền mới.'}</p></>}
      <div className="account-form-actions"><button type="button" className="account-button" onClick={onClose} disabled={busy}>Hủy</button><button className="account-button account-button--primary" disabled={busy || !ready || (linkedRole && Boolean(profiles?.error))}>{busy ? 'Đang lưu…' : account ? 'Lưu quyền truy cập' : 'Tạo tài khoản'}</button></div>
    </form>
  </Modal>
}
