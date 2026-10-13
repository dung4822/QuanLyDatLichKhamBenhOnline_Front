import { useEffect, useState } from 'react'
import { Clock3, Search, Stethoscope } from 'lucide-react'
import { getDoctors } from '../../doctors/api/doctorsApi'
import { getSpecialties } from '../../specialties/api/specialtiesApi'
import { bookingUrl } from '../../appointments/bookingIntent'
import { initials } from '../useAuth'
import { authError } from '../api'

export default function DirectoryPage() {
  const [result, setResult] = useState(null)
  const [revision, setRevision] = useState(0)
  // Cho phép mở sẵn bộ lọc từ link, ví dụ thẻ chuyên khoa ở trang chủ hoặc trợ lý: /doctors?specialty=3
  const [specialty, setSpecialty] = useState(() => typeof window === 'undefined' ? '' : (new URLSearchParams(window.location.search).get('specialty') || '').replace(/\D/g, ''))
  const [search, setSearch] = useState('')
  const ready = result?.revision === revision
  const query = search.trim().toLocaleLowerCase('vi')
  const doctors = ready ? (result.doctors || []).filter((item) => (!specialty || String(item.specialtyId) === specialty) && (!query || [item.fullName, item.specialtyName].some((value) => value?.toLocaleLowerCase('vi').includes(query)))) : []
  const count = (id) => (result?.doctors || []).filter((item) => item.specialtyId === id).length

  useEffect(() => {
    let active = true
    Promise.all([getDoctors(), getSpecialties()]).then(([doctors, specialties]) => {
      if (!Array.isArray(doctors) || !Array.isArray(specialties)) throw new Error('Invalid directory')
      const activeSpecialties = specialties.filter((item) => item.status?.toLowerCase() === 'active')
      if (active) setResult({ revision, specialties: activeSpecialties, doctors: doctors.filter((item) => activeSpecialties.some((s) => s.specialtyId === item.specialtyId)) })
    }).catch((failure) => { if (active) setResult({ revision, error: authError(failure) }) })
    return () => { active = false }
  }, [revision])

  function pickSpecialty(value) {
    setSpecialty(value)
    // Giữ bộ lọc trên URL để có thể chia sẻ hoặc quay lại đúng chỗ.
    window.history.replaceState({}, '', value ? `/doctors?specialty=${value}` : '/doctors')
  }

  return <>
    <header className="account-page-heading"><h1>Tìm bác sĩ</h1><p>Chọn chuyên khoa hoặc gõ tên bác sĩ, sau đó đặt lịch ngay. Bạn chỉ cần đăng nhập ở bước xác nhận.</p></header>
    <div className="directory-filters">
      <label className="directory-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Tìm bác sĩ</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên bác sĩ hoặc chuyên khoa…" /></label>
      {ready && !result.error && <div className="chip-row" role="group" aria-label="Lọc theo chuyên khoa">
        <button type="button" className="chip" aria-pressed={!specialty} onClick={() => pickSpecialty('')}>Tất cả<span>{result.doctors.length}</span></button>
        {result.specialties.map((item) => <button type="button" key={item.specialtyId} className="chip" aria-pressed={specialty === String(item.specialtyId)} onClick={() => pickSpecialty(String(item.specialtyId))}>{item.name}<span>{count(item.specialtyId)}</span></button>)}
      </div>}
    </div>
    {!ready ? <div className="account-loading" role="status" aria-label="Đang tải bác sĩ"><div className="account-skeleton" /><div className="account-skeleton" /></div>
      : result.error ? <div className="account-empty" role="alert"><h2>Chưa tải được danh sách bác sĩ</h2><p>{result.error}</p><button className="account-button" onClick={() => setRevision((value) => value + 1)}>Thử lại</button></div>
        : !doctors.length ? <div className="account-empty"><Stethoscope size={32} aria-hidden="true" /><h2>Chưa tìm thấy bác sĩ phù hợp</h2><p>Thử từ khóa khác hoặc chọn “Tất cả”.</p>{(specialty || search) && <button className="account-button" onClick={() => { setSearch(''); pickSpecialty('') }}>Xóa bộ lọc</button>}</div>
          : <>
            <p className="directory-count" role="status">{doctors.length} bác sĩ</p>
            <div className="directory-grid">{doctors.map((doctor) => <article className="directory-card" key={doctor.doctorId}>
              <div className="directory-card-head"><span className="directory-avatar" aria-hidden="true">{initials(doctor.fullName.replace(/^(BS|ThS|TS|PGS)\.?\s*/i, ''))}</span><div><h2>{doctor.fullName}</h2><p>{doctor.specialtyName}</p></div></div>
              <p className="directory-meta">{doctor.experience} năm kinh nghiệm</p>
              <div className="directory-actions">
                <a className="account-button account-button--primary" href={bookingUrl({ doctor: doctor.doctorId })}>Đặt lịch</a>
                <a className="account-button" href={`/availability?doctor=${doctor.doctorId}`}><Clock3 size={15} aria-hidden="true" />Giờ trống</a>
              </div>
            </article>)}</div>
          </>}
  </>
}
