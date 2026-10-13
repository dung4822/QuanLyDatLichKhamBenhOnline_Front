import { CalendarDays, Clock3, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import Modal from '../../../components/ui/Modal'

function formatDate(value) {
  if (!value) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-')
    return `${day}/${month}/${year}`
  }
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function DetailItem({ icon: Icon, label, children }) {
  return <div className="flex gap-3 rounded-xl bg-slate-50 p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-cyan-700 shadow-sm"><Icon className="h-4 w-4" /></span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-medium text-slate-700">{children || '—'}</p></div></div>
}

export default function PatientDetail({ patient, onClose, onEdit }) {
  return <Modal title="Chi tiết bệnh nhân" description={`Hồ sơ #${patient.patientId}`} onClose={onClose}>
    <div className="patient-detail-heading mb-5 flex items-center gap-4 p-5">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15"><UserRound className="h-7 w-7" /></span>
      <div><h3 className="text-lg font-bold">{patient.fullName}</h3><p className="mt-1 text-sm text-cyan-100">{Number(patient.gender) === 0 ? 'Nam' : 'Nữ'} · Sinh ngày {formatDate(patient.dateOfBirth)}</p></div>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <DetailItem icon={Phone} label="Điện thoại">{patient.phoneNumber}</DetailItem><DetailItem icon={Mail} label="Email">{patient.email}</DetailItem>
      <div className="sm:col-span-2"><DetailItem icon={MapPin} label="Địa chỉ">{patient.address}</DetailItem></div>
      <DetailItem icon={CalendarDays} label="Ngày tạo">{formatDate(patient.createdAt)}</DetailItem><DetailItem icon={Clock3} label="Cập nhật gần nhất">{patient.updatedAt ? formatDate(patient.updatedAt) : 'Chưa cập nhật'}</DetailItem>
    </div>
    <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Đóng</button><button type="button" onClick={() => onEdit(patient)} className="rounded-lg bg-(--brand) px-4 py-2.5 text-sm font-semibold text-white hover:bg-(--brand-strong)">Chỉnh sửa</button></div>
  </Modal>
}
