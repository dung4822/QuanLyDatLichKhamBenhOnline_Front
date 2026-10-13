import logo from '../../assets/logo1.png'

export default function Brand({ subtitle }) {
  return (
    <a href="/" className="brand" aria-label="MediCare+ — trang chủ">
      <img src={logo} alt="" width="36" height="36" />
      <span>
        <span className="brand-name">MediCare<span>+</span></span>
        {subtitle && <span className="brand-subtitle">{subtitle}</span>}
      </span>
    </a>
  )
}
