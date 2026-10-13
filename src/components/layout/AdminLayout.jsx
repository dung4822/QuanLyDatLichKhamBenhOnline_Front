import { useState } from 'react'
import { CalendarCheck2, CalendarDays, CalendarOff, CalendarPlus, Clock3, Layers2, Menu, ShieldCheck, Stethoscope, UsersRound, X } from 'lucide-react'
import Brand from './Brand'
import { initials, useAuth } from '../../features/auth/useAuth'
import { canBook, canVisit, roleLabels } from '../../features/auth/permissions'
import LogoutButton from '../../features/auth/components/LogoutButton'

// Nhóm theo tần suất dùng: việc hằng ngày ở trên, cấu hình ít khi đụng tới ở dưới.
const groups = [
  { label: 'Hằng ngày', items: [
    { href: '/admin/appointments', label: 'Lịch hẹn', icon: CalendarCheck2 },
    { href: '/admin/patients', label: 'Bệnh nhân', icon: UsersRound },
  ] },
  { label: 'Lịch làm việc', items: [
    { href: '/admin/appointment-slots', label: 'Khung giờ khám', icon: Clock3 },
    { href: '/admin/shift-schedules', label: 'Ca & lịch tuần', icon: CalendarDays },
    { href: '/admin/non-working-days', label: 'Ngày nghỉ', icon: CalendarOff },
  ] },
  { label: 'Danh mục', items: [
    { href: '/admin/specialties', label: 'Chuyên khoa', icon: Layers2 },
    { href: '/admin/doctors', label: 'Bác sĩ', icon: Stethoscope },
  ] },
  { label: 'Hệ thống', items: [
    { href: '/admin/accounts', label: 'Tài khoản & quyền', icon: ShieldCheck },
  ] },
]

// Composition: layout chỉ lo khung trang; children vẫn sở hữu dữ liệu và nghiệp vụ.
export default function AdminLayout({ currentPath, children }) {
  const { role, name } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const visibleGroups = groups.map((group) => ({ ...group, items: group.items.filter((item) => canVisit(item.href, role)) })).filter((group) => group.items.length)
  const currentGroup = visibleGroups.find((group) => group.items.some((item) => item.href === currentPath))
  const currentPage = currentGroup?.items.find((item) => item.href === currentPath)

  return (
    <div className="admin-shell">
      <a className="skip-link" href="#main-content">Đến nội dung chính</a>
      <aside className="admin-sidebar" data-open={menuOpen || undefined}>
        <div className="admin-sidebar-top">
          <Brand />
          <button type="button" className="admin-menu-toggle" aria-expanded={menuOpen} aria-controls="admin-navigation" aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav id="admin-navigation" className="admin-nav" aria-label="Điều hướng quản trị" onClick={(event) => { if (event.target.closest('a')) setMenuOpen(false) }}>
          {visibleGroups.map((group) => (
            <div key={group.label} className="admin-nav-group">
              <p>{group.label}</p>
              {group.items.map(({ href, label, icon: Icon }) => (
                <a key={href} href={href} aria-current={currentPath === href ? 'page' : undefined}>
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <div className="admin-user">
          <a href="/me/profile" className="admin-user-card" title="Hồ sơ của tôi">
            <span className="admin-avatar" aria-hidden="true">{initials(name)}</span>
            <span><strong>{name}</strong><small>{roleLabels[role]}</small></span>
          </a>
          <LogoutButton />
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="workspace-header">
          <p className="workspace-crumbs">{currentGroup?.label} <span aria-hidden="true">/</span> <strong>{currentPage?.label}</strong></p>
          <div className="workspace-actions">
            <a href="/" className="workspace-link">Xem trang chủ</a>
            {canBook(role) && <a href="/appointments" className="btn-primary btn-sm"><CalendarPlus size={16} aria-hidden="true" />Đặt lịch mới</a>}
          </div>
        </header>
        <main id="main-content" className="admin-content" tabIndex={-1}>{children}</main>
      </div>
    </div>
  )
}
