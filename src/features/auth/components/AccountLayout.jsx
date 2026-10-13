import { CalendarDays, LockKeyhole, MessageCircle, UserRound } from 'lucide-react'
import Header from '../../../components/layout/Header/Header'
import LogoutButton from './LogoutButton'
import { initials, useAuth } from '../useAuth'
import { canUseAssistant, isStaff, roleLabels } from '../permissions'

export default function AccountLayout({ path, children }) {
  const { name, role } = useAuth()
  const links = [
    { href: isStaff(role) ? '/admin/appointments' : '/me/appointments', label: role === 'Doctor' ? 'Lịch khám được giao' : isStaff(role) ? 'Quản lý lịch hẹn' : 'Lịch hẹn của tôi', icon: CalendarDays },
    ...(canUseAssistant(role) ? [{ href: '/me/assistant', label: 'Trợ lý đặt lịch', icon: MessageCircle }] : []),
    { href: '/me/profile', label: 'Hồ sơ của tôi', icon: UserRound },
    { href: '/me/security', label: 'Bảo mật tài khoản', icon: LockKeyhole },
  ]
  return <div className="account-shell">
    <a className="skip-link" href="#main-content">Đến nội dung chính</a>
    <Header />
    <div className="account-workspace">
      <aside className="account-sidebar">
        <div className="account-identity"><div className="account-avatar" aria-hidden="true">{initials(name)}</div><div><strong>{name}</strong><span>{roleLabels[role]}</span></div></div>
        <nav className="account-nav" aria-label="Điều hướng tài khoản">{links.map(({ href, label, icon: Icon }) => <a key={href} href={href} aria-current={path === href ? 'page' : undefined}><Icon size={18} aria-hidden="true" />{label}</a>)}</nav>
        <LogoutButton />
      </aside>
      <main id="main-content" className="account-content" tabIndex={-1}>{children}</main>
    </div>
  </div>
}
