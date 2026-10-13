import { useEffect, useRef, useState } from 'react'
import { ArrowRight, CalendarClock, CheckCircle2 } from 'lucide-react'
import Modal from '../../../components/ui/Modal'
import { getAppointmentSlots } from '../../appointment-slots/api/appointmentSlotsApi'
import { clinicDays, clinicNow } from '../../appointment-slots/utils'
import { getAppointment, rescheduleAppointment } from '../api/appointmentsApi'
import { appointmentError, canRescheduleAppointment, isRescheduleSlot, rescheduleRestriction, shortDate, timeRange } from '../utils'
import AppointmentInfo from './AppointmentInfo'
import AppointmentStatus from './AppointmentStatus'
import BookingSlotPicker from './BookingSlotPicker'

export default function RescheduleAppointmentDialog({ id, now, options, onClose, onView, onUpdated }) {
  const [appointmentResult, setAppointmentResult] = useState(null)
  const [appointmentRevision, setAppointmentRevision] = useState(0)
  const [draft, setDraft] = useState({ doctorId: '', specialtyId: '', date: '' })
  const [slotResult, setSlotResult] = useState(null)
  const [slotRevision, setSlotRevision] = useState(0)
  const [selection, setSelection] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [uncertainSlotId, setUncertainSlotId] = useState(null)
  const [saved, setSaved] = useState(null)
  const requestPending = useRef(false)
  const outcomeRef = useRef(null)

  const appointmentReady = appointmentResult?.revision === appointmentRevision
  const appointment = appointmentReady ? appointmentResult?.data : null
  const days = clinicDays(now.date)
  const date = days.includes(draft.date) ? draft.date : now.date
  const specialties = options.specialties.filter((item) => item.status?.toLowerCase() === 'active')
  const doctors = options.doctors.filter((item) => specialties.some((specialty) => specialty.specialtyId === item.specialtyId)
    && (!draft.specialtyId || String(item.specialtyId) === draft.specialtyId))
  const doctor = doctors.find((item) => String(item.doctorId) === draft.doctorId)
  const editable = canRescheduleAppointment(appointment, now)
  const doctorId = appointment && editable && !saved && doctor ? String(doctor.doctorId) : ''
  const slotKey = `${doctorId}/${date}/${appointmentRevision}/${slotRevision}`
  const slotsReady = slotResult?.key === slotKey
  const slots = appointment && slotsReady && !slotResult.error ? slotResult.items.filter((slot) => isRescheduleSlot(slot, appointment, now)) : []
  const selected = selection?.key === slotKey ? slots.find((slot) => slot.appointmentSlotId === selection.id) : null
  const locked = busy || uncertainSlotId !== null || !editable

  useEffect(() => {
    const controller = new AbortController()
    getAppointment(id, controller.signal).then((data) => {
      if (controller.signal.aborted) return
      setAppointmentResult({ revision: appointmentRevision, data })
      setDraft({ doctorId: String(data.doctorId), specialtyId: '', date: data.date })
    }).catch((failure) => {
      if (!controller.signal.aborted) setAppointmentResult({ revision: appointmentRevision, error: appointmentError(failure) })
    })
    return () => controller.abort()
  }, [id, appointmentRevision])

  useEffect(() => {
    if (!doctorId) return
    const controller = new AbortController()
    getAppointmentSlots(doctorId, date, controller.signal).then((items) => {
      if (!controller.signal.aborted) setSlotResult({ key: slotKey, items: items.filter((slot) => String(slot.doctorId) === doctorId && slot.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime)) })
    }).catch((failure) => {
      if (!controller.signal.aborted) setSlotResult({ key: slotKey, error: appointmentError(failure), items: [] })
    })
    return () => controller.abort()
  }, [doctorId, date, slotKey])

  useEffect(() => {
    if (saved || uncertainSlotId !== null) outcomeRef.current?.focus()
  }, [saved, uncertainSlotId])

  function reloadSlots() {
    setSelection(null)
    setSlotRevision((value) => value + 1)
  }

  function finish(data, message) {
    setSaved(data)
    setUncertainSlotId(null)
    setError('')
    reloadSlots()
    onUpdated(message)
  }

  async function submit(event) {
    event.preventDefault()
    if (requestPending.current || uncertainSlotId !== null) return
    if (!canRescheduleAppointment(appointment, clinicNow())) {
      setError(rescheduleRestriction(appointment, clinicNow()))
      return
    }
    if (!doctor || !selected || !isRescheduleSlot(selected, appointment, clinicNow())) {
      setError('Vui lòng chọn một khung giờ mới còn trống trong 7 ngày tới.')
      reloadSlots()
      return
    }
    requestPending.current = true
    setBusy(true)
    setError('')
    try {
      const data = await rescheduleAppointment(id, selected.appointmentSlotId)
      finish(data, `Đã cập nhật lịch hẹn #${id}: ${timeRange(data)}, ngày ${shortDate(data.date)}. Nếu chưa thấy trong danh sách, hãy kiểm tra bộ lọc.`)
    } catch (failure) {
      if (failure.uncertain) {
        setUncertainSlotId(selected.appointmentSlotId)
        setError('Chưa xác định được kết quả đổi lịch. Hãy kiểm tra lịch hẹn trước khi gửi lại.')
      } else {
        setError(appointmentError(failure))
        if (failure.status === 409 || failure.status === 404) {
          reloadSlots()
          setAppointmentRevision((value) => value + 1)
          options.reload()
          onUpdated()
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
    try {
      const data = await getAppointment(id)
      if (data.appointmentSlotId === uncertainSlotId) {
        finish(data, `Đã tìm thấy lịch hẹn #${id} tại khung giờ mới.`)
      } else {
        setAppointmentResult({ revision: appointmentRevision, data })
        setDraft({ doctorId: String(data.doctorId), specialtyId: '', date: data.date })
        setUncertainSlotId(null)
        setError('Đã tải lịch hiện tại từ máy chủ; khung giờ chưa trùng với yêu cầu vừa gửi. Vui lòng kiểm tra và chọn lại trước khi lưu.')
        reloadSlots()
        onUpdated()
      }
    } catch (failure) {
      setError(`Chưa kiểm tra được kết quả đổi lịch. ${appointmentError(failure)}`)
    } finally {
      requestPending.current = false
      setBusy(false)
    }
  }

  return <Modal title="Sửa lịch hẹn" description={`Lịch hẹn #${id} · Đổi bác sĩ, ngày và giờ khám`} wide isBusy={busy} errorMessage={error} onClose={onClose}>
    {!appointmentReady ? <p className="appointment-empty" role="status">Đang kiểm tra thông tin lịch hẹn…</p>
      : appointmentResult.error ? <div className="appointment-empty" role="alert"><h3>Không tải được lịch hẹn</h3><p>{appointmentResult.error}</p><button type="button" className="appointment-button" onClick={() => setAppointmentRevision((value) => value + 1)}>Tải lại lịch hẹn</button></div>
        : saved ? <div ref={outcomeRef} tabIndex={-1}>
          <div className="appointment-reschedule-success" role="status"><CheckCircle2 size={22} aria-hidden="true" /><div><h3>Đã cập nhật lịch hẹn</h3><p>Thông tin và trạng thái mới nhất được hiển thị bên dưới.</p></div></div>
          <AppointmentInfo appointment={saved} history />
          <div className="appointment-dialog-actions"><button type="button" className="appointment-button" onClick={onClose}>Đóng</button><button type="button" className="appointment-button appointment-button--primary" onClick={() => onView(id)}>Xem chi tiết lịch hẹn<ArrowRight size={16} aria-hidden="true" /></button></div>
        </div> : appointment && <div className="appointment-reschedule">
          <section className="appointment-current-visit" aria-label="Lịch hẹn hiện tại">
            <div className="appointment-info-heading"><h3><CalendarClock size={17} aria-hidden="true" />Lịch hẹn hiện tại</h3><AppointmentStatus status={appointment.status} /></div>
            <p className="appointment-current-time">{timeRange(appointment)}<span>Ngày {shortDate(appointment.date)}</span></p>
            <p>{appointment.doctorFullName} · {appointment.specialtyName}</p>
            <dl><div><dt>Bệnh nhân</dt><dd>{appointment.patientFullName} · Hồ sơ #{appointment.patientId}</dd></div><div><dt>Lý do khám</dt><dd>{appointment.reason || 'Không cung cấp'}</dd></div></dl>
          </section>
          {uncertainSlotId !== null ? <div ref={outcomeRef} tabIndex={-1} className="appointment-recovery"><h3>Kiểm tra kết quả đổi lịch</h3><p>Yêu cầu có thể đã được xử lý. Tra cứu thông tin mới nhất trước khi tiếp tục.</p><button type="button" className="appointment-button" disabled={busy} onClick={reconcile}>{busy ? 'Đang kiểm tra…' : 'Kiểm tra lịch hẹn'}</button></div> : null}
          {!editable ? <p className="appointment-in-progress" role="status">{rescheduleRestriction(appointment, now)}</p> : <p className="appointment-footnote">Chỉ đổi lịch khi giờ khám hiện tại còn ít nhất 2 tiếng. Bệnh nhân, lý do khám và mã hẹn được giữ nguyên.</p>}
          {editable && <form onSubmit={submit} aria-busy={busy}>
            <div className="appointment-section-title"><span>01</span><div><h3>Chọn bác sĩ</h3><p>Có thể chọn bác sĩ khác, kể cả khác chuyên khoa.</p></div></div>
            {options.loading && <p className="appointment-muted" role="status">Đang tải bác sĩ và chuyên khoa…</p>}
            {options.error && <div className="appointment-reference-error" role="alert"><p>{options.error}</p><button type="button" className="appointment-text-button" disabled={locked} onClick={options.reload}>Tải lại lựa chọn</button></div>}
            <fieldset className="appointment-fields" disabled={locked || options.loading || Boolean(options.error)}>
              <label className="appointment-field"><span>Chuyên khoa mới</span><select value={draft.specialtyId} onChange={(event) => { setDraft((current) => ({ ...current, specialtyId: event.target.value, doctorId: '' })); setSelection(null) }}><option value="">Tất cả chuyên khoa đang hoạt động</option>{specialties.map((item) => <option key={item.specialtyId} value={item.specialtyId}>{item.name}</option>)}</select></label>
              <label className="appointment-field"><span>Bác sĩ mới <span className="appointment-required">*</span></span><select required value={doctorId} onChange={(event) => { setDraft((current) => ({ ...current, doctorId: event.target.value })); setSelection(null) }}><option value="">Chọn bác sĩ</option>{doctors.map((item) => <option key={item.doctorId} value={item.doctorId}>{item.fullName}</option>)}</select></label>
            </fieldset>
            {!options.loading && !options.error && !doctors.length && <p className="appointment-muted">Chưa có bác sĩ phù hợp. Hãy chọn chuyên khoa khác.</p>}
            <BookingSlotPicker days={days} date={date} onDateChange={(value) => { setDraft((current) => ({ ...current, date: value })); setSelection(null) }} doctorId={doctorId} loading={Boolean(doctorId) && !slotsReady} error={slotsReady ? slotResult?.error : ''} slots={slots} selected={selected} onSelect={(slot) => { if (isRescheduleSlot(slot, appointment, clinicNow())) setSelection({ key: slotKey, id: slot.appointmentSlotId }) }} onReload={reloadSlots} disabled={locked} />
            <section className="appointment-new-visit" aria-label="Lịch hẹn sau khi sửa" aria-live="polite"><h3>Lịch hẹn sau khi sửa</h3>{selected && doctor ? <><p className="appointment-current-time">{timeRange(selected)}<span>Ngày {shortDate(selected.date)}</span></p><p>{doctor.fullName} · {doctor.specialtyName || specialties.find((item) => item.specialtyId === doctor.specialtyId)?.name}</p></> : <p>{selection ? 'Khung giờ đã chọn không còn khả dụng. Vui lòng chọn lại.' : 'Chọn một khung giờ mới để xem lại trước khi lưu.'}</p>}</section>
            <p className="appointment-footnote">Giờ hiển thị theo Việt Nam (UTC+7). Lịch hiện tại chỉ được thay thế khi đổi lịch thành công.</p>
            <div className="appointment-dialog-actions"><button type="button" className="appointment-button" disabled={busy} onClick={onClose}>Đóng</button><button type="submit" className="appointment-button appointment-button--primary" disabled={locked || !selected || !doctor}>{busy ? 'Đang lưu…' : 'Lưu thay đổi'}<ArrowRight size={16} aria-hidden="true" /></button></div>
          </form>}
          {!editable && <div className="appointment-dialog-actions"><button type="button" className="appointment-button" disabled={busy} onClick={onClose}>Đóng</button><button type="button" className="appointment-button" disabled={busy} onClick={() => onView(id)}>Xem chi tiết lịch hẹn</button></div>}
        </div>}
  </Modal>
}
