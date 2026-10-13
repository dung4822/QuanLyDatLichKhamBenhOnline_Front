# Quản lý đặt lịch khám bệnh Online — Frontend

Giao diện React/Vite cho hệ thống quản lý đặt lịch khám bệnh.

Các màn hình quản trị hiện có:

- Quản lý lịch hẹn: `/admin/appointments` — lọc, phân trang, chi tiết, sửa, hủy, đã khám và không đến.
- Quản lý bệnh nhân và khung giờ khám
- Quản lý chuyên khoa
- Quản lý bác sĩ và ảnh đại diện
- Quản lý ca làm việc, lịch tuần bác sĩ
- Quản lý ngày không làm việc

Trang đặt lịch: `/appointments`. Bệnh nhân dùng hồ sơ của chính mình đã được backend xác minh; lễ tân/Admin chọn hồ sơ có sẵn. Khách cần đăng nhập trước khi xác nhận. Lựa chọn bác sĩ, ngày và slot từ trang tra cứu được giữ qua bước đăng nhập, sau đó kiểm tra lại tính khả dụng từ API.

Lịch khám hiển thị theo giờ Việt Nam. Đặt trong hôm nay đến hôm nay + 6 ngày; chỉ hủy trước giờ bắt đầu và ghi nhận kết quả từ giờ kết thúc. Khi xung đột, giao diện hiển thị lỗi API và tải lại giờ trống. Nếu mất phản hồi tạo lịch, dùng nút kiểm tra lịch vừa đặt trước khi gửi yêu cầu mới.

Frontend dùng API thật theo `APPOINTMENTS_API.md` và `ACCOUNTS_AUTH_API.md`. Đăng nhập dùng cookie HttpOnly do backend đặt (JavaScript không đọc được); mọi request đi qua `src/lib/apiClient.js` với `credentials: 'include'`, và POST/PUT/PATCH/DELETE tự kèm header `X-CSRF-TOKEN` lấy từ `GET /api/auth/csrf`. Khi tải lại trang, app gọi `GET /api/me/profile` để khôi phục phiên. Lỗi từ backend có dạng ProblemDetails và được chuyển thành câu thông báo bằng `getErrorMessage` / `getFieldErrors`. Điều hướng nội bộ giữ phiên và không tải lại toàn trang. API backend vẫn là nơi kiểm tra quyền cuối cùng.

## Tài khoản và quyền truy cập

- Khách: `/doctors`, `/specialties`, `/availability` để xem bác sĩ và slot trống.
- `/login`, `/register`: đăng ký bệnh nhân hai bước; thành công cần đăng nhập riêng. Mật khẩu mới 12–128 ký tự.
- `/me/profile`: Patient sửa hồ sơ liên hệ; Doctor chỉ đọc hồ sơ chuyên môn; staff xem thông tin tài khoản.
- `/me/security`: đổi mật khẩu và đăng nhập lại sau khi backend thu hồi các phiên.
- `/me/appointments`: lịch hẹn của Patient/Doctor; lọc trạng thái/ngày, phân trang, chi tiết và lịch sử trước/sau.
- `/admin/appointments`, `/admin/patients`: dành cho Admin/Receptionist.
- `/admin/accounts`: Admin tạo tài khoản, chọn hồ sơ đã tồn tại, thay thế toàn bộ vai trò/liên kết/trạng thái. Lưu quyền của chính mình sẽ yêu cầu đăng nhập lại.
- Danh mục bác sĩ/chuyên khoa/ca/ngày nghỉ: chỉ Admin quản lý.

Patient được đặt/đổi/hủy lịch của mình; Doctor chỉ ghi nhận đã khám/không đến trên lịch được giao. Thao tác cũng phải thỏa điều kiện thời gian của lịch khám. 401 kết thúc phiên cục bộ; 403/404/409/429 có thông báo và khả năng thử lại. Dữ liệu cá nhân bị bỏ khi đổi phiên; phản hồi chậm của phiên cũ không được áp dụng cho tài khoản mới.

Theo DTO thực tế, `GET /accounts` và `GET /appointments/{id}/history` trả **mảng theo trang**, không có `totalCount`. Hai giao diện này dùng nút trước/sau và có thể có trang cuối rỗng. `GET /me/appointments` trả `{ items, totalCount, ... }`. Lịch sử cũ chưa được ghi nhận sẽ có trạng thái trống rõ ràng.

Sửa lịch hẹn: chọn **Sửa** trên dòng lịch hẹn hoặc **Sửa lịch hẹn** trong chi tiết. Lịch phải `Confirmed` và còn ít nhất 2 tiếng trước giờ bắt đầu (đúng 2 tiếng được phép). Chọn bác sĩ, kể cả khác chuyên khoa, và một slot mới trong 7 ngày; giao diện gửi `PATCH /api/appointments/{id}/reschedule` với duy nhất `appointmentSlotId`. Mốc 2 tiếng áp dụng cho lịch hiện tại; slot mới chỉ cần chưa bắt đầu. Bệnh nhân, lý do, mã hẹn và ngày tạo giữ nguyên. Khi gặp 409/404, tải lại lịch hiện tại và các slot; khi mất phản hồi, kiểm tra lại chi tiết trước khi gửi tiếp. Lưu thành công cập nhật danh sách theo bộ lọc hiện tại, nên lịch đổi sang ngày khác có thể rời danh sách đang xem.

## Chạy dự án

```bash
npm install
npm run dev
```

Mặc định frontend gọi backend qua Vite proxy tại `https://localhost:7023`. Xem `.env.example` khi cần dùng URL API khác.

Kiểm tra: `npm run lint`, `npm test`, `npm run build`.

Kiểm thử trình duyệt không cần backend: `npm run test:ui`, mở `http://127.0.0.1:5180/login`. Fixture trong `tests/fixtures/auth-preview.mjs` chỉ dùng dữ liệu giả trong bộ nhớ, không kết nối database và không nằm trong bundle production. Tài khoản thử: `patient@example.test`, `doctor@example.test`, `reception@example.test`, `admin@example.test`; mật khẩu thử dùng chung `Test-only-password`. Đây là thông tin cố định dành riêng cho fixture, không dùng ở backend thật.
