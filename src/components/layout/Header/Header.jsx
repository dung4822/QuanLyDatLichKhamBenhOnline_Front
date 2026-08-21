import logo from '../../../assets/logo1.png' 

const Header = () => {
  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Khối 1: Logo + Tên Bệnh viện */}
        <div className="flex items-center gap-3 hover:cursor-pointer">
          <img src={logo} alt="MediCare+ Logo" className="h-10 w-auto object-contain mix-blend-multiply" />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-blue-900 leading-tight">MediCare+</span>
            <span className="text-[10px] text-[#13b3a9] font-medium tracking-wide">Multi-Speciality Hospital</span>
          </div>
        </div>

        {/* Khối 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#home" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1 text-sm transition-all">Home</a>
          {/* Tạm thời dẫn tới trang quản lý bác sĩ đang xây dựng. */}
          <a href="/admin/doctors" className="text-gray-500 hover:text-blue-600 font-medium text-sm transition-colors">Find Doctors</a>
          {/* Tạm thời dẫn tới trang quản trị chuyên khoa đang xây dựng. */}
          <a href="/admin/specialties" className="text-gray-500 hover:text-blue-600 font-medium text-sm transition-colors">Specialties</a>
          <a href="#appointments" className="text-gray-500 hover:text-blue-600 font-medium text-sm transition-colors">Appointments</a>
          <a href="#about" className="text-gray-500 hover:text-blue-600 font-medium text-sm transition-colors">About Us</a>
          <a href="#contact" className="text-gray-500 hover:text-blue-600 font-medium text-sm transition-colors">Contact</a>
        </nav>

        {/* Khối 3: Buttons */}
        <div className="flex items-center gap-4">
          <button className="px-5 py-2 text-sm font-medium text-blue-900 border border-gray-300 rounded-lg hover:bg-blue-50 transition-colors">
            Sign In
          </button>
          <button className="px-5 py-2.5 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors shadow-sm">
            Book Appointment
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
