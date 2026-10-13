import { useEffect, useState } from 'react'
import { Check, Clock3, RefreshCw } from 'lucide-react'
import { getDoctors } from '../../doctors/api/doctorsApi'
import { getAppointmentSlots } from '../api/appointmentSlotsApi'
import { clinicDays, clinicNow, dayLabel, isFutureSlot, slotError } from '../utils'
import '../slots.css'
import { bookingUrl } from '../../appointments/bookingIntent'

export default function AppointmentSlotsPage() {
  const [now, setNow] = useState(clinicNow)
  const [doctors, setDoctors] = useState({ status: 'loading', items: [] })
  const [doctorRetry, setDoctorRetry] = useState(0)
  const [doctorId, setDoctorId] = useState(() => typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('doctor') || '')
  const [date, setDate] = useState(() => clinicNow().date)
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState(null)
  const [selection, setSelection] = useState(null)
  const days = clinicDays(now.date)
  const activeDate = days.includes(date) ? date : now.date
  const requestKey = `${doctorId}/${activeDate}/${now.date}/${revision}`
  const ready = result?.key === requestKey
  const loading = Boolean(doctorId) && !ready
  const slots = ready && !result.error ? result.items.filter((slot) => isFutureSlot(slot, now)) : []
  const selected = selection?.key === requestKey ? slots.find((slot) => slot.appointmentSlotId === selection.id) : null
  const doctor = doctors.items.find((item) => String(item.doctorId) === doctorId)

  useEffect(() => {
    let active = true
    getDoctors().then((items) => {
      if (active) setDoctors(Array.isArray(items) ? { status: 'ready', items } : { status: 'error', items: [] })
    }).catch(() => { if (active) setDoctors({ status: 'error', items: [] }) })
    return () => { active = false }
  }, [doctorRetry])

  useEffect(() => {
    const refreshClock = () => setNow(clinicNow())
    const timer = window.setInterval(refreshClock, 1000)
    window.addEventListener('focus', refreshClock)
    document.addEventListener('visibilitychange', refreshClock)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refreshClock)
      document.removeEventListener('visibilitychange', refreshClock)
    }
  }, [])

  useEffect(() => {
    if (!doctorId) return
    const controller = new AbortController()
    getAppointmentSlots(doctorId, activeDate, controller.signal).then((items) => {
      if (!controller.signal.aborted) setResult({ key: requestKey, items: items.filter((item) => String(item.doctorId) === doctorId && item.date === activeDate).sort((a, b) => a.startTime.localeCompare(b.startTime)) })
    }).catch((error) => {
      if (controller.signal.aborted) return
      setResult({ key: requestKey, error: slotError(error), status: error.status, items: [] })
      if (error.status === 404) {
        setSelection(null)
        setDoctorId('')
        setDoctors((current) => ({ ...current, items: current.items.filter((item) => String(item.doctorId) !== doctorId) }))
      }
    })
    return () => controller.abort()
  }, [doctorId, activeDate, requestKey])

  function changeDoctor(event) {
    setDoctorId(event.target.value)
    setSelection(null)
    setResult(null)
  }

  function changeDate(value) {
    setDate(value)
    setSelection(null)
  }

  function reload() {
    setSelection(null)
    setRevision((value) => value + 1)
    setNow(clinicNow())
  }

  function reloadDoctors() {
    setDoctors({ status: 'loading', items: [] })
    setDoctorRetry((value) => value + 1)
  }

  return (
    <section className="admin-page slots-page">
      <header className="slots-header">
        <div><h1>Khung giờ khám</h1><p>Tra cứu giờ trống theo bác sĩ và ngày khám.</p></div>
        <div className="slots-clock" role="timer" aria-label="Thời gian hiện tại tại Việt Nam" aria-live="off">
          <span className="slots-timezone">Giờ Việt Nam · UTC+7</span>
          <time className="slots-clock-time" dateTime={`${now.date}T${now.time}+07:00`}>{now.time}</time>
          <span className="slots-clock-date">{dayLabel(now.date, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
        </div>
      </header>

      <div className="slots-layout">
        <aside className="slots-sidebar" aria-label="Bác sĩ và lựa chọn tạm thời">
          <label htmlFor="slot-doctor">Bác sĩ</label>
          <select id="slot-doctor" value={doctorId} onChange={changeDoctor} disabled={doctors.status !== 'ready' || !doctors.items.length}>
            <option value="">{doctors.status === 'loading' ? 'Đang tải bác sĩ…' : 'Chọn bác sĩ'}</option>
            {doctors.items.map((item) => <option key={item.doctorId} value={item.doctorId}>{item.fullName}</option>)}
          </select>
          {doctors.status === 'error' && <div className="slots-inline-error" role="alert"><p>Không tải được danh sách bác sĩ.</p><button className="slots-text-button" onClick={reloadDoctors}>Thử lại</button></div>}
          {doctors.status === 'ready' && !doctors.items.length && <p className="slots-hint">Chưa có bác sĩ để tra cứu. <button className="slots-text-button" onClick={reloadDoctors}>Tải lại danh sách</button></p>}
          {!doctorId && result?.status === 404 && <p className="slots-inline-error" role="alert">{result.error}</p>}

          <div className="slots-selection">
            <h2>Lựa chọn tạm thời</h2>
            {selected ? <>
              <p className="slots-chosen-time">{selected.startTime.slice(0, 5)}<span>–</span>{selected.endTime.slice(0, 5)}</p>
              <p className="slots-chosen-date">{dayLabel(selected.date)}</p>
              <p className="slots-chosen-doctor">{doctor?.fullName}</p>
              <button type="button" className="slots-text-button" onClick={() => setSelection(null)}>Bỏ chọn khung giờ</button>
            </> : <p className="slots-hint">{selection ? 'Khung giờ đã chọn không còn khả dụng. Vui lòng chọn lại.' : 'Chọn một khung giờ để xem lại thông tin tại đây.'}</p>}
            <p className="slots-disclaimer">Lựa chọn này chưa giữ chỗ và chưa tạo lịch khám.</p>
            <a href={bookingUrl({ doctor: doctorId, date: activeDate, slot: selected?.appointmentSlotId || '' })} className="account-button account-button--primary account-button--full mt-4">Tiếp tục đặt lịch →</a>
          </div>
        </aside>

        <div className="slots-workspace">
          <div className="slots-calendar-heading"><h2>Ngày khám</h2><span>7 ngày tới</span></div>
          <div className="slots-days" role="group" aria-label="Chọn ngày khám">
            {days.map((value, index) => <button type="button" key={value} aria-pressed={activeDate === value} aria-label={dayLabel(value)} onClick={() => changeDate(value)}>
              <span>{index === 0 ? 'Hôm nay' : dayLabel(value, { weekday: 'short' })}</span>
              <strong>{value.slice(8)}</strong><span>Tháng {Number(value.slice(5, 7))}</span>
            </button>)}
          </div>
          {ready && result?.status === 400 && <p className="slots-inline-error" role="alert">{result.error}</p>}

          <div className="slots-results-heading"><div><h2>Khung giờ còn trống</h2><p>{dayLabel(activeDate)}</p></div><button type="button" className="slots-refresh" onClick={reload} disabled={!doctorId || loading}><RefreshCw size={15} aria-hidden="true" />Tải lại</button></div>
          <div className="slots-results" aria-busy={loading}>
            {!doctorId ? <div className="slots-empty"><Clock3 size={25} strokeWidth={1.4} aria-hidden="true" /><h3>Chọn bác sĩ để xem giờ trống</h3><p>Các khung giờ khả dụng sẽ xuất hiện tại đây.</p></div>
              : loading ? <div className="slots-loading" role="status"><p>Đang tải khung giờ…</p><div className="slots-grid">{Array.from({ length: 8 }, (_, index) => <div key={index} className="slots-skeleton" />)}</div></div>
                : result?.error ? <div className="slots-empty" role="alert"><h3>Không tải được khung giờ</h3><p>{result.error}</p><button className="slots-refresh" type="button" onClick={reload}>Thử lại</button></div>
                  : !slots.length ? <div className="slots-empty"><Clock3 size={25} strokeWidth={1.4} aria-hidden="true" /><h3>Chưa có giờ trống</h3><p>Không có khung giờ khả dụng trong khoảng ngày đã chọn.</p></div>
                    : <>{[{ label: 'Buổi sáng', match: (slot) => slot.startTime < '12:00:00' }, { label: 'Buổi chiều', match: (slot) => slot.startTime >= '12:00:00' && slot.startTime < '18:00:00' }, { label: 'Buổi tối', match: (slot) => slot.startTime >= '18:00:00' }].map(({ label, match }) => {
                      const items = slots.filter(match)
                      return items.length > 0 && <section className="slots-period" key={label}><h3>{label}<span>{items.length} khung giờ</span></h3><div className="slots-grid">{items.map((slot) => <button type="button" key={slot.appointmentSlotId} aria-pressed={selected?.appointmentSlotId === slot.appointmentSlotId} onClick={() => { if (isFutureSlot(slot, clinicNow())) setSelection({ key: requestKey, id: slot.appointmentSlotId }) }}>
                        <span>{slot.startTime.slice(0, 5)} – {slot.endTime.slice(0, 5)}</span>{selected?.appointmentSlotId === slot.appointmentSlotId && <Check size={15} aria-hidden="true" />}
                      </button>)}</div></section>
                    })}</>}
          </div>
        </div>
      </div>
    </section>
  )
}
