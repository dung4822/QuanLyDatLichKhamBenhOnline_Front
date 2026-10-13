import { useEffect, useRef, useState } from 'react'
import Modal from '../../../components/ui/Modal'
import Notice from '../../../components/ui/Notice'
import { changeAppointmentStatus, getAppointment } from '../api/appointmentsApi'
import { allowedActions, appointmentActions, appointmentError } from '../utils'
import { clinicNow } from '../../appointment-slots/utils'
import AppointmentInfo from './AppointmentInfo'
import { canRescheduleAppointment, rescheduleRestriction } from '../utils'
import { Pencil } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { permittedAppointmentActions } from '../../auth/permissions'
import AppointmentHistory from './AppointmentHistory'

export default function AppointmentDetailDialog({ id, now, onClose, onUpdated, onEdit }) {
  const { role } = useAuth()
  const [result, setResult] = useState(null)
  const [revision, setRevision] = useState(0)
  const [action, setAction] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const requestPending = useRef(false)
  const ready = result?.revision === revision
  const appointment = ready ? result?.data : null
  const actions = appointment ? permittedAppointmentActions(allowedActions(appointment, now), role) : []
  const actionInfo = appointmentActions[action]

  useEffect(() => {
    const controller = new AbortController()
    getAppointment(id, controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult({ revision, data })
    }).catch((failure) => {
      if (!controller.signal.aborted) setResult({ revision, error: appointmentError(failure) })
    })
    return () => controller.abort()
  }, [id, revision])

  async function submit(event) {
    event.preventDefault()
    if (requestPending.current || !appointment) return
    if (!permittedAppointmentActions(allowedActions(appointment, clinicNow()), role).includes(action)) {
      setError('Thời gian cho phép thao tác đã thay đổi. Vui lòng kiểm tra lại lịch hẹn.')
      setAction('')
      setRevision((value) => value + 1)
      return
    }
    if (action === 'cancel' && reason.trim().length > 500) { setError('Lý do hủy không được vượt quá 500 ký tự.'); return }
    requestPending.current = true
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const data = await changeAppointmentStatus(id, action, reason)
      setResult({ revision, data })
      setSuccess(actionInfo.result)
      setAction('')
      onUpdated(actionInfo.result)
    } catch (failure) {
      setError(appointmentError(failure))
      // The server may have completed the write, or another operator changed it.
      setAction('')
      setRevision((value) => value + 1)
      onUpdated()
    } finally {
      requestPending.current = false
      setBusy(false)
    }
  }

  return <Modal title="Chi tiết lịch hẹn" description={`Mã hẹn #${id} · Giờ Việt Nam (UTC+7)`} isBusy={busy} onClose={onClose} errorMessage={error}>
    {!ready ? <p className="appointment-empty" role="status">Đang tải thông tin mới nhất…</p>
      : result.error ? <div className="appointment-empty" role="alert"><p>{result.error}</p><button type="button" className="appointment-button" onClick={() => setRevision((value) => value + 1)}>Tải lại chi tiết</button></div>
        : appointment && <><Notice notice={success ? { type: 'success', message: success } : null} /><AppointmentInfo appointment={appointment} history />
          {actionInfo ? <form className="appointment-action-form" onSubmit={submit}><h3>{actionInfo.label}</h3><p>{actionInfo.description}</p><p className="appointment-footnote">Sau khi xác nhận, trạng thái này không thể đổi lại.</p>
            {action === 'cancel' && <label className="appointment-field"><span>Lý do hủy (không bắt buộc)</span><textarea autoFocus rows={3} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} disabled={busy} /><span className="appointment-character-count">{reason.length}/500 ký tự</span></label>}
            {!actions.includes(action) && <p role="alert" className="appointment-selection-expired">Đã hết thời gian cho phép thao tác này.</p>}
            <div className="appointment-dialog-actions"><button type="button" className="appointment-button" disabled={busy} onClick={() => setAction('')}>Quay lại</button><button type="submit" className={`appointment-button ${action === 'cancel' ? 'appointment-button--danger' : 'appointment-button--primary'}`} disabled={busy || !actions.includes(action)}>{busy ? 'Đang cập nhật…' : 'Xác nhận'}</button></div>
          </form> : <>
            {appointment.status === 'Confirmed' && !allowedActions(appointment, now).length && <p className="appointment-in-progress">Lịch hẹn đang trong giờ khám.</p>}
            {onEdit && <p className="appointment-footnote">{rescheduleRestriction(appointment, now) || 'Có thể đổi bác sĩ, ngày và giờ khi lịch hiện tại còn ít nhất 2 tiếng trước giờ khám.'}</p>}
            <div className="appointment-dialog-actions"><button type="button" className="appointment-button" onClick={onClose}>Đóng</button>{onEdit && <button type="button" className="appointment-button" disabled={!canRescheduleAppointment(appointment, now)} onClick={() => onEdit(id)}><Pencil size={15} aria-hidden="true" />Sửa lịch hẹn</button>}{actions.map((value) => <button type="button" key={value} className={`appointment-button ${value === 'cancel' ? 'appointment-button--danger' : value === 'complete' ? 'appointment-button--primary' : ''}`} onClick={() => { setAction(value); setReason(''); setError(''); setSuccess('') }}>{appointmentActions[value].label}</button>)}</div>
          </>}
          <AppointmentHistory key={`${id}/${revision}/${success}`} id={id} />
        </>}
  </Modal>
}
