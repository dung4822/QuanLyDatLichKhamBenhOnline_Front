import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, RefreshCw, ShieldCheck, UsersRound } from 'lucide-react'
import Notice from '../../../components/ui/Notice'
import AccountForm from '../components/AccountForm'
import { authError, getAccounts } from '../api'
import { roleLabels } from '../permissions'
import { useAuth } from '../useAuth'

export default function AccountsPage() {
  const { account } = useAuth()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState(null)
  const [editing, setEditing] = useState(undefined)
  const [notice, setNotice] = useState(null)
  const key = `${page}/${pageSize}/${revision}`
  const ready = result?.key === key
  const items = ready ? result.items || [] : []
  useEffect(() => {
    const controller = new AbortController()
    getAccounts({ page, pageSize }, controller.signal).then((items) => {
      if (!controller.signal.aborted) setResult({ key, items })
    }).catch((failure) => { if (!controller.signal.aborted) setResult({ key, error: authError(failure) }) })
    return () => controller.abort()
  }, [key, page, pageSize])
  return <section className="admin-page accounts-page">
    <header className="account-page-heading account-heading-row"><div><h1>Quản lý tài khoản</h1><p>Tạo tài khoản, liên kết hồ sơ và quản lý quyền truy cập phòng khám.</p></div><button className="account-button account-button--primary" onClick={() => setEditing(null)}><Plus size={17} />Tạo tài khoản</button></header>
    <Notice notice={notice} />
    <div className="accounts-overview"><ShieldCheck size={25} /><p>Mỗi tài khoản có một vai trò. Liên kết hồ sơ giúp người dùng truy cập đúng thông tin và lịch khám của mình.</p></div>
    <section className="account-panel accounts-list-panel">
      <div className="account-panel-heading"><span className="account-icon"><UsersRound size={21} /></span><div><h2>Danh sách tài khoản</h2><p>Trang {page} · {ready && !result.error ? `${items.length} tài khoản trong trang này` : 'Đang tải dữ liệu'}</p></div><button className="account-button ml-auto" disabled={!ready} onClick={() => setRevision((value) => value + 1)} aria-label="Tải lại tài khoản"><RefreshCw size={16} /></button></div>
      {!ready ? <p className="account-empty" role="status">Đang tải tài khoản…</p> : result.error ? <div className="account-empty" role="alert"><h2>Chưa tải được danh sách</h2><p>{result.error}</p><button className="account-button" onClick={() => setRevision((value) => value + 1)}>Thử lại</button></div> : !items.length ? <div className="account-empty"><UsersRound size={32} /><h2>{page > 1 ? 'Bạn đã xem hết danh sách' : 'Chưa có tài khoản'}</h2><p>{page > 1 ? 'Quay lại trang trước để tiếp tục quản lý.' : 'Tạo tài khoản đầu tiên để bắt đầu.'}</p></div> : <div className="accounts-table-scroll" tabIndex={0} role="region" aria-label="Bảng tài khoản, có thể cuộn ngang"><table className="accounts-table"><caption className="sr-only">Tài khoản và quyền truy cập</caption><thead><tr>{['Tài khoản', 'Vai trò', 'Hồ sơ liên kết', 'Trạng thái', 'Thao tác'].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={item.userAccountId}><td><strong>{item.displayName}{item.userAccountId === account.userAccountId && ' (Bạn)'}</strong><small>{item.email}</small></td><td>{roleLabels[item.role] || item.role}</td><td>{item.patientId ? `Bệnh nhân #${item.patientId}` : item.doctorId ? `Bác sĩ #${item.doctorId}` : 'Không áp dụng'}</td><td><span className={`account-state ${item.isActive ? '' : 'account-state--off'}`}>{item.isActive ? 'Hoạt động' : 'Đã khóa'}</span></td><td><button className="account-text-link" aria-label={`Sửa quyền của ${item.displayName}`} onClick={() => setEditing(item)}>Sửa quyền →</button></td></tr>)}</tbody></table></div>}
      <div className="account-pagination"><label>Hiển thị<select aria-label="Số tài khoản mỗi trang" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>{[10, 20, 50, 100].map((size) => <option key={size}>{size}</option>)}</select>/ trang</label><div><button className="account-button" disabled={!ready || page === 1} aria-label="Trang trước" onClick={() => setPage((value) => value - 1)}><ChevronLeft size={16} /></button><span>Trang {page}</span><button className="account-button" disabled={!ready || Boolean(result?.error) || items.length < pageSize} aria-label="Trang sau" onClick={() => setPage((value) => value + 1)}><ChevronRight size={16} /></button></div></div>
    </section>
    {editing !== undefined && <AccountForm account={editing} onClose={() => setEditing(undefined)} onSaved={(message) => { setEditing(undefined); setRevision((value) => value + 1); setNotice({ type: 'success', message }) }} />}
  </section>
}
