import { useSyncExternalStore } from 'react'

export function navigate(path, { replace = false } = {}) {
  const url = new URL(path, window.location.origin)
  if (url.origin !== window.location.origin) return
  window.history[replace ? 'replaceState' : 'pushState']({}, '', url.pathname + url.search + url.hash)
  window.dispatchEvent(new PopStateEvent('popstate'))
  if (url.hash) requestAnimationFrame(() => document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView())
  else window.scrollTo({ top: 0, behavior: 'instant' })
}

const subscribe = (callback) => {
  window.addEventListener('popstate', callback)
  return () => window.removeEventListener('popstate', callback)
}
const locationPath = () => window.location.pathname + (window.location.search || '')
const serverPath = () => (typeof window === 'undefined' ? '/' : locationPath())
export const useLocationPath = () => useSyncExternalStore(subscribe, locationPath, serverPath)

export function handleInternalLink(event) {
  const anchor = event.target.closest?.('a[href]')
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return
  const url = new URL(anchor.href, window.location.href)
  if (url.origin !== window.location.origin || !['http:', 'https:'].includes(url.protocol)) return
  if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return
  event.preventDefault()
  navigate(url.pathname + url.search + url.hash)
}
