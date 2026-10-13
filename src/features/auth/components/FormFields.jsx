import { cloneElement, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { clinicNow } from '../../appointment-slots/utils'

export function Field({ label, hint, children, wide = false }) {
  const id = useId()
  return <div className={`account-field ${wide ? 'account-field--wide' : ''}`}><label htmlFor={id}>{label}</label>{cloneElement(children, { id, 'aria-describedby': hint ? `${id}-hint` : undefined })}{hint && <small id={`${id}-hint`}>{hint}</small>}</div>
}

export function PasswordField({ label = 'Mật khẩu', hint, ...props }) {
  const [visible, setVisible] = useState(false)
  const id = useId()
  return <div className="account-field"><label htmlFor={id}>{label}</label><div className="password-input"><input id={id} type={visible ? 'text' : 'password'} required maxLength={128} aria-describedby={hint ? `${id}-hint` : undefined} {...props} /><button type="button" aria-label={`${visible ? 'Ẩn' : 'Hiện'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible((value) => !value)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{hint && <small id={`${id}-hint`}>{hint}</small>}</div>
}

export function ProfileFields({ values, onChange, disabled = false }) {
  const field = (name) => ({ name, value: values[name] ?? '', onChange, disabled })
  return <div className="account-form-grid">
    <Field label="Họ và tên *" wide><input {...field('fullName')} autoComplete="name" required minLength={3} maxLength={100} placeholder="Nguyễn Văn An" /></Field>
    <Field label="Ngày sinh *"><input {...field('dateOfBirth')} type="date" required max={clinicNow().date} autoComplete="bday" /></Field>
    <Field label="Giới tính *"><select {...field('gender')} required><option value="">Chọn giới tính</option><option value="0">Nam</option><option value="1">Nữ</option></select></Field>
    <Field label="Số điện thoại *"><input {...field('phoneNumber')} type="tel" autoComplete="tel" required maxLength={20} placeholder="0901 234 567" /></Field>
    <Field label="Email liên hệ" hint="Có thể khác email đăng nhập."><input {...field('email')} type="email" autoComplete="email" maxLength={50} placeholder="ban@example.com" /></Field>
    <Field label="Địa chỉ" wide><textarea {...field('address')} autoComplete="street-address" rows={2} maxLength={255} placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố" /></Field>
  </div>
}
