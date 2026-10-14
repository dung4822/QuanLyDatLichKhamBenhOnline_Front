import { useState } from 'react'
import { CalendarPlus, Menu, X } from 'lucide-react'
import Brand from '../Brand'
import { initials, useAuth } from '../../../features/auth/useAuth'
import { canBook, isStaff, roleLabels } from '../../../features/auth/permissions'
import { useLocationPath } from '../../../lib/navigation'

// Một header cho mọi trang công khai và trang cá nhân: liên kết thay đổi theo vai trò,
// nên người dùng luôn thấy đúng "việc tiếp theo" của mình ở cùng một chỗ.
function linksFor(role) {
  const links = [
    { label: 'Tìm bác sĩ', href: '/doctors' },
    { label: 'Giờ khám trống', href: '/availability' },
  ]
  if (!role) links.push({ label: 'Tài khoản dùng thử', href: '/demo-accounts' })
  if (role === 'Patient') links.push({ label: 'Lịch hẹn của tôi', href: '/me/appointments' })
  if (role === 'Doctor') links.push({ label: 'Lịch khám được giao', href: '/me/appointments' })
  if (isStaff(role)) links.push({ label: 'Quản lý phòng khám', href: '/admin/appointments' })
  return links
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, role, name } = useAuth()
  const path = useLocationPath().split('?')[0]
  const links = linksFor(role)
  const current = (href) => (path === href || (href === '/doctors' && path === '/specialties') ? 'page' : undefined)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Điều hướng chính">
          {links.map((link) => <a key={link.href} href={link.href} aria-current={current(link.href)}>{link.label}</a>)}
        </nav>
        <div className="header-actions">
          {isAuthenticated
            ? <a className="header-account" href="/me/profile" title="Hồ sơ của tôi"><span className="header-avatar" aria-hidden="true">{initials(name)}</span><span className="header-account-text"><strong>{name}</strong><small>{roleLabels[role]}</small></span></a>
            : <a className="header-login" href="/login">Đăng nhập</a>}
          {(!isAuthenticated || canBook(role)) && path !== '/appointments' && <a className="btn-primary btn-sm header-cta" href="/appointments"><CalendarPlus size={16} aria-hidden="true" />Đặt lịch khám</a>}
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Điều hướng trên di động"
          onClick={(event) => { if (event.target.closest('a')) closeMenu() }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              closeMenu()
              document.querySelector('.mobile-menu-toggle')?.focus()
            }
          }}
        >
          <a href="/" aria-current={path === '/' ? 'page' : undefined}>Trang chủ</a>
          {links.map((link) => <a key={link.href} href={link.href} aria-current={current(link.href)}>{link.label}</a>)}
          {isAuthenticated ? <a href="/me/profile">Hồ sơ của tôi</a> : <a href="/login">Đăng nhập</a>}
          {(!isAuthenticated || canBook(role)) && <a href="/appointments" className="btn-primary">Đặt lịch khám</a>}
        </nav>
      )}
    </header>
  )
}
