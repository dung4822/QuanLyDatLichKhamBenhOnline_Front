import { appointmentStatuses } from '../utils'

export default function AppointmentStatus({ status }) {
  const info = appointmentStatuses[status]
  return <span className={`appointment-status appointment-status--${info?.tone || 'unknown'}`}><span aria-hidden="true" />{info?.label || status}</span>
}
