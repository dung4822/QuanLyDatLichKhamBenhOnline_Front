import { useEffect, useState } from 'react'
import { getDoctors } from '../doctors/api/doctorsApi'
import { getPatients } from '../patients/api/patientsApi'
import { getSpecialties } from '../specialties/api/specialtiesApi'
import { clinicNow } from '../appointment-slots/utils'
import { useAuth } from '../auth/useAuth'
import { isStaff } from '../auth/permissions'

export function useClinicClock() {
  const [now, setNow] = useState(clinicNow)
  useEffect(() => {
    const refresh = () => setNow(clinicNow())
    const timer = window.setInterval(refresh, 1000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])
  return now
}

export function useAppointmentOptions() {
  const { role, profile } = useAuth()
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState(null)
  useEffect(() => {
    let active = true
    Promise.all([isStaff(role) ? getPatients() : Promise.resolve(profile?.patient ? [profile.patient] : []), getDoctors(), getSpecialties()]).then(([patients, doctors, specialties]) => {
      if (![patients, doctors, specialties].every(Array.isArray)) throw new Error('Invalid reference data')
      if (active) setResult({ revision, patients, doctors, specialties })
    }).catch(() => {
      if (active) setResult({ revision, error: 'Không tải được danh sách bệnh nhân, bác sĩ hoặc chuyên khoa.' })
    })
    return () => { active = false }
  }, [revision, role, profile])
  const ready = result?.revision === revision
  return {
    patients: ready ? result?.patients || [] : [], doctors: ready ? result?.doctors || [] : [],
    specialties: ready ? result?.specialties || [] : [], loading: !ready,
    error: ready ? result?.error : '', reload: () => setRevision((value) => value + 1),
  }
}
