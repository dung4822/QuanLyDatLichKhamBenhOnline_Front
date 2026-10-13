import { useSyncExternalStore } from 'react'
import { getServerSession, getSession, subscribeSession } from '../../lib/session.js'

export function useAuth() {
  const session = useSyncExternalStore(subscribeSession, getSession, getServerSession)
  const account = session.profile?.account
  // Tên hiển thị dùng chung cho header, sidebar và lời chào.
  const name = session.profile?.patient?.fullName || session.profile?.doctor?.fullName || account?.displayName || ''
  return { ...session, account, name, role: account?.role, isAuthenticated: Boolean(account), isRestoring: session.status === 'unknown' }
}

export const initials = (name = '') => name.split(' ').filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase()
