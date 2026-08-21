import DoctorsPage from './features/doctors/page/DoctorsPage'
import HomePage from './features/home/page/HomePage'
import NonWorkingDaysPage from './features/non-working-days/page/NonWorkingDaysPage'
import ShiftSchedulesPage from './features/shift-schedules/page/ShiftSchedulesPage'
import SpecialtiesPage from './features/specialties/page/SpecialtiesPage'

function App() {
  // Giữ landing page ở URL gốc; phần quản trị được tách route để dễ mở rộng sau này.
  if (window.location.pathname === '/admin/specialties') {
    return <SpecialtiesPage />
  }

  if (window.location.pathname === '/admin/doctors') {
    return <DoctorsPage />
  }

  if (window.location.pathname === '/admin/shift-schedules') {
    return <ShiftSchedulesPage />
  }

  if (window.location.pathname === '/admin/non-working-days') {
    return <NonWorkingDaysPage />
  }

  return <HomePage />
}

export default App
