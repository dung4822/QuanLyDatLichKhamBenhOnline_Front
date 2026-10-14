import { useState } from 'react'
import { Check, Copy, Hourglass, LogIn } from 'lucide-react'
import { DEMO_ACCOUNTS } from './demoAccounts'
import './demo.css'

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch { /* trình duyệt chặn clipboard: người dùng vẫn bôi đen để sao chép */ }
  }
  return (
    <button type="button" className="demo-copy" onClick={copy} aria-label={`Sao chép ${label}`} title={`Sao chép ${label}`}>
      {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
    </button>
  )
}

export function ColdStartNotice() {
  return (
    <div className="demo-notice" role="note">
      <Hourglass size={20} aria-hidden="true" />
      <div>
        <strong>Lần đầu sử dụng, vui lòng đợi vài phút để máy chủ khởi động.</strong>
        <p>Máy chủ chạy trên gói miễn phí nên sẽ tự tạm ngủ khi không có ai dùng. Lần truy cập đầu tiên có thể mất khoảng 1–3 phút (đăng nhập hoặc tải dữ liệu chậm, có thể báo lỗi). Bạn chỉ cần đợi một chút rồi thử lại, sau đó hệ thống sẽ chạy bình thường.</p>
      </div>
    </div>
  )
}

export default function DemoAccountsPage() {
  return (
    <div className="demo-page">
      <header className="demo-heading">
        <h1>Tài khoản dùng thử</h1>
        <p>Dùng các tài khoản dưới đây để trải nghiệm toàn bộ hệ thống theo từng vai trò.</p>
      </header>

      <ColdStartNotice />

      <ul className="demo-grid">
        {DEMO_ACCOUNTS.map((account) => (
          <li key={account.key} className="demo-card">
            <h2>{account.role}</h2>
            <p className="demo-note">{account.note}</p>
            <dl>
              <div><dt>Email</dt><dd><code>{account.email}</code><CopyButton value={account.email} label={`email ${account.role}`} /></dd></div>
              <div><dt>Mật khẩu</dt><dd><code>{account.password}</code><CopyButton value={account.password} label={`mật khẩu ${account.role}`} /></dd></div>
            </dl>
            <a className="account-button account-button--primary account-button--full" href={`/login?demo=${account.key}`}><LogIn size={16} aria-hidden="true" />Đăng nhập với vai trò {account.role}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
