import Header from '../../../components/layout/Header/Header'
import Footer from '../../../components/layout/Footer/Footer'

export default function PublicLayout({ children }) {
  return <div className="account-shell">
    <a className="skip-link" href="#main-content">Đến nội dung chính</a>
    <Header />
    <main className="public-content" id="main-content" tabIndex={-1}>{children}</main>
    <Footer />
  </div>
}
