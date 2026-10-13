import { useEffect, useState } from 'react'
import { getDoctors } from '../doctors/api/doctorsApi'
import { getSpecialties } from '../specialties/api/specialtiesApi'

// Trang chủ đọc một lần danh sách công khai (chuyên khoa + bác sĩ) và chia cho các khối.
// Lỗi không chặn trang: các khối dùng dữ liệu tự ẩn, lối tắt đặt lịch vẫn hoạt động.
export function useDirectory() {
  const [state, setState] = useState({ status: 'loading', specialties: [], doctors: [] })
  useEffect(() => {
    let active = true
    Promise.all([getSpecialties(), getDoctors()]).then(([specialties, doctors]) => {
      if (!active) return
      const open = (Array.isArray(specialties) ? specialties : []).filter((item) => item.status?.toLowerCase() === 'active')
      const listed = (Array.isArray(doctors) ? doctors : []).filter((item) => open.some((s) => s.specialtyId === item.specialtyId))
      setState({ status: 'ready', specialties: open.map((item) => ({ ...item, doctorCount: listed.filter((d) => d.specialtyId === item.specialtyId).length })), doctors: listed })
    }).catch(() => { if (active) setState({ status: 'error', specialties: [], doctors: [] }) })
    return () => { active = false }
  }, [])
  return state
}
