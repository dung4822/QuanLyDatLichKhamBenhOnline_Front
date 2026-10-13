import { useEffect, useRef, useState } from 'react'
import { ArrowRight, CalendarCheck2, CheckCircle2, Clock3, Stethoscope } from 'lucide-react'
import Header from '../../../components/layout/Header/Header'
import Footer from '../../../components/layout/Footer/Footer'
import Notice from '../../../components/ui/Notice'
import { getAppointmentSlots } from '../../appointment-slots/api/appointmentSlotsApi'
import { clinicDays, clinicNow, isFutureSlot } from '../../appointment-slots/utils'
import { createAppointment, findSubmittedAppointment } from '../api/appointmentsApi'
import AppointmentInfo from '../components/AppointmentInfo'
import BookingSlotPicker from '../components/BookingSlotPicker'
import { useAppointmentOptions, useClinicClock } from '../hooks'
import { appointmentError, shortDate, timeRange } from '../utils'
import '../appointments.css'
import { useAuth } from '../../auth/useAuth'
import { defaultDestination } from '../../auth/permissions'
import { bookingIntent } from '../bookingIntent'

export default function BookAppointmentPage() {
  const { role, profile } = useAuth()
  const isPatient = role === 'Patient'
  const now = useClinicClock()
  const options = useAppointmentOptions()
  const [intent] = useState(() => bookingIntent(typeof window === 'undefined' ? '' : window.location.search))
  const [patientId, setPatientId] = useState('')
  const [patientSearch, setPatientSearch] = useState('')
  const [specialtyId, setSpecialtyId] = useState(intent.specialty)
  const [doctorId, setDoctorId] = useState(intent.doctor)
  const [date, setDate] = useState(intent.date || clinicNow().date)
  const [selection, setSelection] = useState(() => intent.doctor && intent.date && intent.slot ? { key: `${intent.doctor}/${intent.date}/0`, id: Number(intent.slot) } : null)
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [uncertain, setUncertain] = useState(null)
  const [receipt, setReceipt] = useState(null)
  const requestPending = useRef(false)
  const noticeRef = useRef(null)
  const days = clinicDays(now.date)
  const activeDate = days.includes(date) ? date : now.date
  const activeSpecialties = options.specialties.filter((item) => item.status?.toLowerCase() === 'active')
  const eligibleDoctors = options.doctors.filter((item) => activeSpecialties.some((specialty) => specialty.specialtyId === item.specialtyId))
  // Chuyên khoa từ link có thể đã ngừng hoạt động: khi đó coi như chưa lọc.
  const activeSpecialtyId = activeSpecialties.some((item) => String(item.specialtyId) === specialtyId) ? specialtyId : ''
  const visibleDoctors = eligibleDoctors.filter((item) => !activeSpecialtyId || String(item.specialtyId) === activeSpecialtyId)
  const onlyDoctor = !doctorId && activeSpecialtyId && visibleDoctors.length === 1 ? visibleDoctors[0] : undefined
  const doctor = visibleDoctors.find((item) => String(item.doctorId) === doctorId) || onlyDoctor
  const patient = isPatient ? profile.patient : options.patients.find((item) => String(item.patientId) === patientId)
  const query = patientSearch.trim().toLocaleLowerCase('vi')
  const visiblePatients = options.patients.filter((item) => String(item.patientId) === patientId || [item.fullName, item.phoneNumber, String(item.patientId)].some((value) => value?.toLocaleLowerCase('vi').includes(query)))
  const activeDoctorId = doctor ? String(doctor.doctorId) : ''
  const requestKey = `${activeDoctorId}/${activeDate}/${revision}`
  const ready = result?.key === requestKey
  const loading = Boolean(activeDoctorId) && !ready
  const slots = ready && !result.error ? result.items.filter((slot) => isFutureSlot(slot, now)) : []
  const selected = selection?.key === requestKey ? slots.find((item) => item.appointmentSlotId === selection.id) : null
  const locked = busy || Boolean(uncertain)

  useEffect(() => {
    if (!activeDoctorId) return
    const controller = new AbortController()
    getAppointmentSlots(activeDoctorId, activeDate, controller.signal).then((items) => {
      if (!controller.signal.aborted) setResult({ key: requestKey, items: items.filter((slot) => String(slot.doctorId) === activeDoctorId && slot.date === activeDate).sort((a, b) => a.startTime.localeCompare(b.startTime)) })
    }).catch((failure) => {
      if (!controller.signal.aborted) setResult({ key: requestKey, items: [], error: appointmentError(failure) })
    })
    return () => controller.abort()
  }, [activeDoctorId, activeDate, requestKey])

  useEffect(() => {
    if (error || receipt || uncertain) noticeRef.current?.focus()
  }, [error, receipt, uncertain])

  // Chọn chuyên khoa chỉ có một bác sĩ thì chọn luôn bác sĩ đó; chọn bác sĩ thì chuyên khoa tự khớp theo.
  function chooseSpecialty(value) {
    const doctors = eligibleDoctors.filter((item) => !value || String(item.specialtyId) === value)
    setSpecialtyId(value)
    setDoctorId(value && doctors.length === 1 ? String(doctors[0].doctorId) : '')
    setSelection(null)
  }

  function chooseDoctor(value) {
    const picked = eligibleDoctors.find((item) => String(item.doctorId) === value)
    if (picked) setSpecialtyId(String(picked.specialtyId))
    setDoctorId(value)
    setSelection(null)
    setError('')
  }

  function reloadSlots() {
    setSelection(null)
    setRevision((value) => value + 1)
  }

  async function submit(event) {
    event.preventDefault()
    if (requestPending.current || uncertain) return
    if (!patient || !doctor || !selected || !clinicDays(clinicNow().date).includes(selected.date) || !isFutureSlot(selected, clinicNow())) {
      setError('Vui lòng chọn bệnh nhân, bác sĩ và một khung giờ còn trống.')
      reloadSlots()
      return
    }
    if (reason.trim().length > 1000) { setError('Lý do khám không được vượt quá 1.000 ký tự.'); return }
    const payload = { patientId: patient.patientId, appointmentSlotId: selected.appointmentSlotId, reason: reason.trim() }
    requestPending.current = true
    setBusy(true)
    setError('')
    try {
      setReceipt(await createAppointment(payload))
      reloadSlots()
    } catch (failure) {
      if (failure.uncertain) {
        setUncertain({ ...payload, date: selected.date })
      } else {
        setError(appointmentError(failure))
        if (failure.status === 409 || failure.status === 404) {
          reloadSlots()
          options.reload()
        }
      }
    } finally {
      requestPending.current = false
      setBusy(false)
    }
  }

  async function reconcile() {
    if (requestPending.current) return
    requestPending.current = true
    setBusy(true)
    setError('')
    try {
      const found = await findSubmittedAppointment(uncertain)
      if (found) setReceipt(found)
      else setError('Chưa tìm thấy lịch vừa đặt. Hãy chọn lại khung giờ từ danh sách mới trước khi đặt tiếp.')
      setUncertain(null)
      reloadSlots()
    } catch (failure) {
      setError(`Chưa kiểm tra được kết quả đặt lịch. ${appointmentError(failure)}`)
    } finally {
      requestPending.current = false
      setBusy(false)
    }
  }

  return <div className="booking-shell">
    <a className="skip-link" href="#main-content">Đến nội dung chính</a>
    <Header />
    <main id="main-content" className="booking-content appointment-page" tabIndex={-1}>
      <header className="appointment-page-heading"><div><h1>Đặt lịch khám</h1><p>Chọn thời gian phù hợp. Chúng tôi sẵn sàng đón bạn.</p></div><span className="appointment-timezone"><Clock3 size={15} aria-hidden="true" />Giờ Việt Nam · UTC+7</span></header>
      <div ref={noticeRef} tabIndex={-1} className="appointment-notices">
        <Notice notice={error ? { type: 'error', message: error } : null} />
        {uncertain && <div className="appointment-recovery" role="alert"><h2>Đang chờ xác minh kết quả đặt lịch</h2><p>Máy chủ chưa trả về kết quả rõ ràng. Lịch có thể đã được tạo; hãy kiểm tra trước khi đặt tiếp.</p><button type="button" className="appointment-button" disabled={busy} onClick={reconcile}>{busy ? 'Đang kiểm tra…' : 'Kiểm tra lịch vừa đặt'}</button></div>}
      </div>
      {receipt ? <section className="appointment-receipt"><div className="appointment-success-heading"><CheckCircle2 size={38} aria-hidden="true" /><h2>{receipt.status === 'Confirmed' ? 'Đặt lịch thành công!' : 'Đã tìm thấy lịch hẹn'}</h2><p>{receipt.status === 'Confirmed' ? 'Lịch khám của bạn đã được xác nhận. Hãy lưu lại thông tin bên dưới.' : 'Thông tin và trạng thái hiện tại của lịch hẹn được hiển thị bên dưới.'}</p></div><AppointmentInfo appointment={receipt} /><div className="appointment-dialog-actions"><a href={defaultDestination(role)} className="appointment-button">Xem lịch hẹn của tôi</a><button className="appointment-button appointment-button--primary" type="button" onClick={() => { setReceipt(null); setReason(''); setError(''); reloadSlots() }}>Đặt lịch khác<ArrowRight size={16} aria-hidden="true" /></button></div></section>
        : <form onSubmit={submit} className="appointment-booking-grid" aria-busy={busy}>
          <div className="appointment-booking-main">
            <section className="appointment-section">
              <div className="appointment-section-title"><span>01</span><div><h2>Thông tin buổi khám</h2><p>Thông tin người khám và bác sĩ bạn muốn gặp.</p></div></div>
              {options.error ? <div className="appointment-reference-error" role="alert"><p>{options.error}</p><button type="button" className="appointment-text-button" onClick={options.reload} disabled={locked}>Thử tải lại</button></div> : options.loading ? <p role="status" className="appointment-muted">Đang tải hồ sơ và bác sĩ…</p> : null}
              <fieldset disabled={locked || options.loading || Boolean(options.error)} className="appointment-fields">
                {isPatient ? <div className="account-info appointment-field--wide"><CheckCircle2 size={19} /><div><strong>{patient.fullName}</strong><br />{patient.phoneNumber} · Hồ sơ của bạn đã được chọn.<br /><a className="account-text-link" href="/me/profile">Cập nhật thông tin cá nhân →</a></div></div> : <><label className="appointment-field appointment-field--wide"><span>Tìm hồ sơ bệnh nhân</span><input type="search" value={patientSearch} onChange={(event) => setPatientSearch(event.target.value)} placeholder="Tên, số điện thoại hoặc mã hồ sơ" /></label>
                <label className="appointment-field appointment-field--wide"><span>Bệnh nhân <span className="appointment-required">*</span></span><select required value={patientId} onChange={(event) => { setPatientId(event.target.value); setError('') }}><option value="">Chọn hồ sơ bệnh nhân</option>{visiblePatients.map((item) => <option key={item.patientId} value={item.patientId}>#{item.patientId} · {item.fullName}{item.phoneNumber ? ` · ${item.phoneNumber}` : ''}</option>)}</select>{patient && <span className="appointment-field-hint">Điện thoại: {patient.phoneNumber || 'Chưa cung cấp'}</span>}{!options.loading && !options.error && !options.patients.length && <span className="appointment-field-hint">Chưa có hồ sơ bệnh nhân. Vui lòng liên hệ phòng khám để tạo hồ sơ trước khi đặt lịch.</span>}{query && !visiblePatients.length && <span className="appointment-field-hint">Không tìm thấy hồ sơ phù hợp.</span>}</label></>}
                <label className="appointment-field"><span>Chuyên khoa</span><select value={activeSpecialtyId} onChange={(event) => chooseSpecialty(event.target.value)}><option value="">Tất cả chuyên khoa đang hoạt động</option>{activeSpecialties.map((item) => <option key={item.specialtyId} value={item.specialtyId}>{item.name}</option>)}</select></label>
                <label className="appointment-field"><span>Bác sĩ <span className="appointment-required">*</span></span><select required value={activeDoctorId} onChange={(event) => chooseDoctor(event.target.value)}><option value="">Chọn bác sĩ</option>{visibleDoctors.map((item) => <option key={item.doctorId} value={item.doctorId}>{item.fullName}</option>)}</select>{!options.loading && !options.error && !visibleDoctors.length && <span className="appointment-field-hint">Chưa có bác sĩ phù hợp.</span>}</label>
              </fieldset>
            </section>
            <BookingSlotPicker days={days} date={activeDate} onDateChange={(value) => { setDate(value); setSelection(null); setError('') }} doctorId={activeDoctorId} loading={loading} error={ready ? result?.error : ''} slots={slots} selected={selected} onSelect={(slot) => { if (isFutureSlot(slot, clinicNow())) { setSelection({ key: requestKey, id: slot.appointmentSlotId }); setError('') } }} onReload={reloadSlots} disabled={locked} />
            <section className="appointment-section"><div className="appointment-section-title"><span>03</span><div><h2>Lý do khám</h2><p>Chia sẻ thêm để bác sĩ chuẩn bị tốt hơn (không bắt buộc).</p></div></div><label className="appointment-field"><span className="sr-only">Lý do khám</span><textarea rows={4} maxLength={1000} disabled={locked} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Triệu chứng hoặc vấn đề bạn muốn trao đổi với bác sĩ…" /><span className="appointment-character-count">{reason.length}/1.000 ký tự</span></label></section>
          </div>
          <aside className="appointment-summary"><div className="appointment-summary-title"><CalendarCheck2 size={20} aria-hidden="true" /><h2>Lịch khám của bạn</h2></div><div className="appointment-summary-doctor"><span><Stethoscope size={23} aria-hidden="true" /></span><div><strong>{doctor?.fullName || 'Chưa chọn bác sĩ'}</strong><p>{doctor?.specialtyName || 'Chuyên khoa sẽ hiển thị tại đây'}</p></div></div><dl><div><dt>Bệnh nhân</dt><dd>{patient?.fullName || 'Chưa chọn hồ sơ'}</dd></div><div><dt>Ngày khám</dt><dd>{shortDate(activeDate)}</dd></div><div><dt>Khung giờ</dt><dd>{selected ? timeRange(selected) : 'Chưa chọn giờ'}</dd></div><div><dt>Thời lượng</dt><dd>30 phút</dd></div></dl>{selection && !selected && <p className="appointment-selection-expired" role="status">Khung giờ đã chọn không còn khả dụng. Vui lòng chọn lại.</p>}<p className="appointment-summary-note">Lịch được xác nhận ngay khi đặt thành công. Khung giờ chưa được giữ chỗ cho đến lúc xác nhận.</p><button className="appointment-button appointment-button--primary" type="submit" disabled={locked || !patient || !doctor || !selected}>{busy ? 'Đang xử lý…' : 'Xác nhận đặt lịch'}<ArrowRight size={16} aria-hidden="true" /></button><p className="appointment-footnote">Vui lòng kiểm tra thông tin trước khi xác nhận.</p></aside>
        </form>}
    </main><Footer />
  </div>
}
