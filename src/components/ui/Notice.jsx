import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function Notice({ notice }) {
  if (!notice) return null
  const isSuccess = notice.type === 'success'
  const Icon = isSuccess ? CheckCircle2 : AlertCircle

  return (
    <div role={isSuccess ? 'status' : 'alert'} className={`notice ${isSuccess ? 'notice-success' : 'notice-error'}`}>
      <Icon size={19} aria-hidden="true" />
      <p>{notice.message}</p>
    </div>
  )
}
