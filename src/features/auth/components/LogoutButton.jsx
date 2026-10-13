import { useRef, useState } from 'react'
import { LogOut } from 'lucide-react'
import { logout, authError } from '../api'
import { navigate } from '../../../lib/navigation'

export default function LogoutButton() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(false)
  async function submit() {
    if (pending.current) return
    pending.current = true; setBusy(true); setError('')
    try { await logout(); navigate('/login') }
    catch (failure) { setError(authError(failure)) }
    finally { pending.current = false; setBusy(false) }
  }
  return <div className="logout-control"><button type="button" disabled={busy} onClick={submit}><LogOut size={17} />{busy ? 'Đang đăng xuất…' : 'Đăng xuất'}</button>{error && <p role="alert">{error}</p>}</div>
}
