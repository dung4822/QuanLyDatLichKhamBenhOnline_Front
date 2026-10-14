// Tài khoản dùng thử công khai cho bản demo (dữ liệu mẫu, không chứa thông tin thật).
export const DEMO_ACCOUNTS = [
  { key: 'patient', role: 'Bệnh nhân', email: 'benhnhan@demo.com', password: 'Demo@PhongKham2026', note: 'Đặt / đổi / hủy lịch, trò chuyện với trợ lý AI, sửa hồ sơ.' },
  { key: 'doctor', role: 'Bác sĩ', email: 'bacsi@demo.com', password: 'Demo@PhongKham2026', note: 'Xem lịch khám được giao, ghi nhận đã khám.' },
  { key: 'receptionist', role: 'Lễ tân', email: 'letan@demo.com', password: 'Demo@PhongKham2026', note: 'Quản lý lịch hẹn và hồ sơ bệnh nhân.' },
  { key: 'admin', role: 'Admin', email: 'admin@demo.com', password: 'MatKhauAdmin@2026', note: 'Toàn quyền: bác sĩ, chuyên khoa, ca làm, ngày nghỉ, tài khoản.' },
]

export const findDemoAccount = (key) => DEMO_ACCOUNTS.find((account) => account.key === key) || null
