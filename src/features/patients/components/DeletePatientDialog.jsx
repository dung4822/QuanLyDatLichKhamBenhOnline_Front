import { AlertTriangle, Trash2 } from 'lucide-react'
import Modal from '../../../components/ui/Modal'

export default function DeletePatientDialog({ patient, isDeleting, errorMessage, onConfirm, onClose }) {
  return <Modal title="Xóa bệnh nhân?" description="Hồ sơ sẽ không còn xuất hiện trong danh sách sau khi xóa." isBusy={isDeleting} errorMessage={errorMessage} onClose={onClose}>
    <div className="flex gap-4 rounded-xl border border-rose-100 bg-rose-50 p-4"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" /><p className="text-sm leading-6 text-rose-900">Bạn có chắc muốn xóa hồ sơ của <strong>{patient.fullName}</strong>? Thao tác này không thể hoàn tác tại giao diện hiện tại.</p></div>
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={isDeleting} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60">Giữ lại</button><button type="button" onClick={onConfirm} disabled={isDeleting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-wait disabled:opacity-70"><Trash2 className="h-4 w-4" />{isDeleting ? 'Đang xóa...' : 'Xóa bệnh nhân'}</button></div>
  </Modal>
}
