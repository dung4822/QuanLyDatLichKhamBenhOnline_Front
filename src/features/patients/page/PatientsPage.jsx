import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage } from '../../../lib/apiClient'
import '../patients.css'
import { AlertCircle, Plus, RefreshCw } from 'lucide-react'
import SearchInput from '../../../components/ui/SearchInput'
import Notice from '../../../components/ui/Notice'
import { createPatient, deletePatient, getPatient, getPatients, updatePatient } from '../api/patientsApi'
import DeletePatientDialog from '../components/DeletePatientDialog'
import PatientDetail from '../components/PatientDetail'
import PatientForm from '../components/PatientForm'
import PatientsTable from '../components/PatientsTable'

const ERROR_MESSAGES = {
  400: 'Dữ liệu chưa hợp lệ. Vui lòng kiểm tra các trường trong biểu mẫu.',
  404: 'Bệnh nhân không tồn tại hoặc đã bị xóa.',
}

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState(null)
  const [formPatient, setFormPatient] = useState(undefined)
  const [detailPatient, setDetailPatient] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [actionId, setActionId] = useState(null)
  const [dialogError, setDialogError] = useState('')

  const query = searchTerm.trim().toLocaleLowerCase('vi')
  const visiblePatients = patients.filter((patient) => [patient.fullName, patient.phoneNumber, patient.email, String(patient.patientId)].some((value) => (value || '').toLocaleLowerCase('vi').includes(query)))

  const loadPatients = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const data = await getPatients()
      setPatients(Array.isArray(data) ? data : [])
    } catch (error) {
      setLoadError(getErrorMessage(error, ERROR_MESSAGES))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(loadPatients, 0)
    return () => window.clearTimeout(timer)
  }, [loadPatients])

  function openCreate() {
    setNotice(null)
    setFormPatient(null)
  }

  async function openDetail(patient) {
    setActionId(patient.patientId)
    setNotice(null)
    try {
      setDetailPatient(await getPatient(patient.patientId))
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, ERROR_MESSAGES) })
      if (error?.status === 404) await loadPatients()
    } finally {
      setActionId(null)
    }
  }

  async function openEdit(patient) {
    setDetailPatient(null)
    setActionId(patient.patientId)
    setNotice(null)
    try {
      setFormPatient(await getPatient(patient.patientId))
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, ERROR_MESSAGES) })
      if (error?.status === 404) await loadPatients()
    } finally {
      setActionId(null)
    }
  }

  async function savePatient(payload) {
    setIsSaving(true)
    setDialogError('')
    try {
      const saved = formPatient ? await updatePatient(formPatient.patientId, payload) : await createPatient(payload)
      setPatients((current) => formPatient ? current.map((item) => item.patientId === saved.patientId ? saved : item) : [...current, saved].sort((a, b) => a.patientId - b.patientId))
      setNotice({ type: 'success', message: formPatient ? 'Đã cập nhật hồ sơ bệnh nhân.' : 'Đã thêm bệnh nhân mới.' })
      setFormPatient(undefined)
    } catch (error) {
      setDialogError(getErrorMessage(error, ERROR_MESSAGES))
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  function askDelete(patient) {
    setDialogError('')
    setDeleteTarget(patient)
  }

  async function confirmDelete() {
    const patient = deleteTarget
    setActionId(patient.patientId)
    setDialogError('')
    try {
      await deletePatient(patient.patientId)
      setPatients((current) => current.filter((item) => item.patientId !== patient.patientId))
      setDeleteTarget(null)
      setNotice({ type: 'success', message: `Đã xóa hồ sơ của ${patient.fullName}.` })
    } catch (error) {
      setDialogError(getErrorMessage(error, ERROR_MESSAGES))
      if (error?.status === 404) await loadPatients()
    } finally {
      setActionId(null)
    }
  }

  const formOpen = formPatient !== undefined
  return <section className="admin-page patients-page">
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-(--ink) sm:text-3xl">Bệnh nhân</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Theo dõi thông tin cá nhân và liên hệ của bệnh nhân trong hệ thống.</p></div><button type="button" onClick={openCreate} disabled={isSaving || actionId !== null} className="inline-flex items-center justify-center gap-2 rounded-lg bg-(--brand) px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-(--brand-strong) disabled:opacity-60"><Plus className="h-4 w-4" />Thêm bệnh nhân</button></div>
    <div className="space-y-5">
      <Notice notice={formOpen || deleteTarget ? null : notice} />
      {!loadError && <SearchInput value={searchTerm} onChange={setSearchTerm} label="Tìm theo tên, mã hồ sơ, email hoặc số điện thoại…" resultCount={visiblePatients.length} disabled={isLoading} />}
      {loadError ? <section className="rounded-2xl border border-rose-200 bg-white p-7 text-center shadow-sm"><AlertCircle className="mx-auto h-8 w-8 text-rose-500" /><h2 className="mt-3 font-bold text-(--ink)">Không tải được danh sách</h2><p className="mt-1 text-sm text-slate-500">{loadError}</p><button type="button" onClick={loadPatients} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" />Thử tải lại</button></section> : <PatientsTable patients={visiblePatients} emptyMessage={query ? 'Không tìm thấy bệnh nhân phù hợp. Hãy thử từ khóa khác.' : undefined} isLoading={isLoading} actionId={actionId} onView={openDetail} onEdit={openEdit} onDelete={askDelete} />}
    </div>
    {formOpen && <PatientForm key={formPatient?.patientId ?? 'new'} patient={formPatient} isSaving={isSaving} onSave={savePatient} onCancel={() => !isSaving && setFormPatient(undefined)} errorMessage={dialogError} />}
    {detailPatient && <PatientDetail patient={detailPatient} onClose={() => setDetailPatient(null)} onEdit={openEdit} />}
    {deleteTarget && <DeletePatientDialog patient={deleteTarget} isDeleting={actionId === deleteTarget.patientId} errorMessage={dialogError} onConfirm={confirmDelete} onClose={() => actionId === null && setDeleteTarget(null)} />}
  </section>
}
