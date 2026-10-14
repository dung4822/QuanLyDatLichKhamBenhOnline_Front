import { useEffect } from 'react'
import AdminLayout from './components/layout/AdminLayout'
import DoctorsPage from './features/doctors/page/DoctorsPage'
import HomePage from './features/home/page/HomePage'
import NonWorkingDaysPage from './features/non-working-days/page/NonWorkingDaysPage'
import PatientsPage from './features/patients/page/PatientsPage'
import AppointmentSlotsPage from './features/appointment-slots/page/AppointmentSlotsPage'
import ShiftSchedulesPage from './features/shift-schedules/page/ShiftSchedulesPage'
import SpecialtiesPage from './features/specialties/page/SpecialtiesPage'
import BookAppointmentPage from './features/appointments/page/BookAppointmentPage'
import AppointmentsPage from './features/appointments/page/AppointmentsPage'
import Brand from './components/layout/Brand'
import LoginPage from './features/auth/page/LoginPage'
import RegisterPage from './features/auth/page/RegisterPage'
import ProfilePage from './features/auth/page/ProfilePage'
import SecurityPage from './features/auth/page/SecurityPage'
import MyAppointmentsPage from './features/auth/page/MyAppointmentsPage'
import AccountsPage from './features/auth/page/AccountsPage'
import AccountLayout from './features/auth/components/AccountLayout'
import { useAuth } from './features/auth/useAuth'
import { canVisit, defaultDestination, loginDestination } from './features/auth/permissions'
import { handleInternalLink, navigate, useLocationPath } from './lib/navigation'
import { checkSessionExpiry } from './lib/session'
import { restoreSession } from './features/auth/api'
import PublicLayout from './features/auth/components/PublicLayout'
import DirectoryPage from './features/auth/page/DirectoryPage'
import ChatPage from './features/chat/page/ChatPage'
import ChatWidget from './features/chat/components/ChatWidget'
import DemoAccountsPage from './features/demo/DemoAccountsPage'

// Route map: thêm trang quản trị ở đây, không cần lặp lại khung layout.
const routes = {
  '/admin/appointments': { component: AppointmentsPage, title: 'Quản lý lịch hẹn' },
  '/admin/specialties': { component: SpecialtiesPage, title: 'Chuyên khoa' },
  '/admin/doctors': { component: DoctorsPage, title: 'Bác sĩ' },
  '/admin/patients': { component: PatientsPage, title: 'Bệnh nhân' },
  '/admin/appointment-slots': { component: AppointmentSlotsPage, title: 'Khung giờ khám' },
  '/admin/shift-schedules': { component: ShiftSchedulesPage, title: 'Ca & lịch tuần' },
  '/admin/non-working-days': { component: NonWorkingDaysPage, title: 'Ngày nghỉ' },
  '/admin/accounts': { component: AccountsPage, title: 'Quản lý tài khoản' },
  '/me/profile': { component: ProfilePage, title: 'Hồ sơ của tôi' },
  '/me/security': { component: SecurityPage, title: 'Bảo mật tài khoản' },
  '/me/appointments': { component: MyAppointmentsPage, title: 'Lịch hẹn của tôi' },
  '/me/assistant': { component: ChatPage, title: 'Trợ lý đặt lịch' },
  '/appointments': { component: BookAppointmentPage, title: 'Đặt lịch khám' },
  '/doctors': { component: DirectoryPage, title: 'Tìm bác sĩ', public: true },
  '/specialties': { component: DirectoryPage, title: 'Tìm bác sĩ', public: true },
  '/availability': { component: AppointmentSlotsPage, title: 'Giờ khám còn trống', public: true },
  '/demo-accounts': { component: DemoAccountsPage, title: 'Tài khoản dùng thử', public: true },
}

function Redirect({ to }) {
  useEffect(() => { navigate(to, { replace: true }) }, [to])
  return <p className="route-message" role="status">Đang chuyển đến không gian của bạn…</p>
}

function RouteMessage({ denied, role }) {
  return <main className="route-message"><Brand /><h1>{denied ? 'Khu vực này chưa được cấp quyền' : 'Trang bạn tìm không tồn tại'}</h1><p>{denied ? 'Vui lòng trở về không gian phù hợp với tài khoản của bạn.' : 'Đường dẫn có thể đã thay đổi. Hãy trở về trang chủ để tiếp tục.'}</p><a className="account-button account-button--primary" href={role ? defaultDestination(role) : '/'}>{role ? 'Về không gian của tôi' : 'Về trang chủ'}</a></main>
}

function App() {
  const location = useLocationPath()
  const [pathname, search] = location.split('?')
  const path = pathname.replace(/\/$/, '') || '/'
  const { account, role, isAuthenticated, isRestoring, version } = useAuth()
  const route = routes[path]
  const Page = route?.component
  const next = new URLSearchParams(search).get('next')
  const isAuthRoute = path === '/login' || path === '/register'
  const title = route && !route.public && !isAuthenticated ? 'Đăng nhập' : route?.title || (path === '/register' ? 'Tạo tài khoản' : path === '/login' ? 'Đăng nhập' : 'Đặt lịch khám trực tuyến')

  useEffect(() => {
    // Cookie đăng nhập (HttpOnly) vẫn còn sau khi tải lại trang: hỏi server để lấy lại hồ sơ.
    restoreSession()
    document.addEventListener('click', handleInternalLink)
    const timer = window.setInterval(checkSessionExpiry, 1000)
    window.addEventListener('focus', checkSessionExpiry)
    document.addEventListener('visibilitychange', checkSessionExpiry)
    return () => {
      document.removeEventListener('click', handleInternalLink)
      window.clearInterval(timer)
      window.removeEventListener('focus', checkSessionExpiry)
      document.removeEventListener('visibilitychange', checkSessionExpiry)
    }
  }, [])
  useEffect(() => {
    document.title = `${title} | MediCare+`
  }, [title])

  const page = renderPage()
  // Khung chat nổi trên mọi trang, trừ trang đăng nhập/đăng ký và trang trợ lý toàn màn hình.
  const showWidget = !isRestoring && !isAuthRoute && path !== '/me/assistant'
  return <>{page}{showWidget && <ChatWidget />}</>

  function renderPage() {
    if (path === '/') return <HomePage key={version} />
    if (isRestoring && (isAuthRoute || (Page && !route.public))) return <p className="route-message" role="status">Đang kiểm tra phiên đăng nhập…</p>
    if (isAuthRoute) {
      if (isAuthenticated) return <Redirect to={loginDestination(next, role)} />
      return path === '/register' ? <RegisterPage returnTo={next} /> : <LoginPage returnTo={next} />
    }
    if (!Page) return <RouteMessage role={role} />
    if (route.public) return <PublicLayout><Page key={`${location}/${version}`} /></PublicLayout>
    if (!isAuthenticated) return <LoginPage returnTo={location} />
    if (!canVisit(path, role)) return <RouteMessage denied role={role} />
    const content = <Page key={`${account.userAccountId}/${version}/${location}`} />
    if (path.startsWith('/admin/')) return <AdminLayout currentPath={path}>{content}</AdminLayout>
    if (path.startsWith('/me/')) return <AccountLayout path={path}>{content}</AccountLayout>
    return content
  }
}

export default App
