# Tích hợp tài khoản và hồ sơ

## Phạm vi

Triển khai theo `D:/WebBanNongSan/docs/api/ACCOUNTS_AUTH_API.md`, đối chiếu các DTO, validator và service C# tại backend. Không thay đổi backend, migration hoặc dữ liệu phòng khám.

Các module mới nằm trong `src/features/auth`, phiên trong `src/lib/session.js`, điều hướng trong `src/lib/navigation.js`. Mọi API đi qua `src/lib/apiClient.js`: gửi cookie đăng nhập (`credentials: 'include'`), tự lấy và gửi CSRF token cho request ghi (lấy lại khi danh tính đổi, thử lại một lần nếu token bị từ chối), xử lý 401, bỏ phản hồi thuộc phiên cũ và chuẩn hóa lỗi ProblemDetails. Không tự đặt Content-Type cho multipart upload ảnh bác sĩ.

## Kiểm tra

- Kiểm thử tự động: quyền theo bốn vai trò; chặn điều hướng ngoài/đến trang không có quyền; đăng nhập chỉ công bố phiên sau `/me/profile`; đăng ký không tự đăng nhập; 204 logout/đổi mật khẩu; 401/403/409/429; hết hạn; bỏ phản hồi chậm sau đổi tài khoản; định dạng phân trang; payload đầy đủ khi thay quyền; giữ lựa chọn đặt lịch và loại ID bệnh nhân/token khỏi URL.
- Kết quả: lint và build thành công, 56/56 kiểm thử tự động đạt.
- Kiểm tra trình duyệt bằng fixture riêng: đăng nhập Patient, sửa hồ sơ, đặt lịch, đăng xuất/đổi vai trò; Doctor ghi nhận đã khám và xem lịch sử trước/sau; bảng tài khoản Admin, tạo staff, lỗi khóa Admin cuối cùng; đăng ký hai bước không tự đăng nhập; giữ bác sĩ/ngày/slot sau đăng nhập; giao diện desktop và điện thoại 390px.
- Fixture phục vụ kiểm tra frontend, không chứng minh hoạt động hoặc phân quyền của backend thật. Tại thời điểm triển khai, backend chưa lắng nghe cổng HTTPS 7023 mặc định. Cần chạy backend với database đã migration để kiểm tra tích hợp thật.

## Hành vi chủ đích

- Tải lại trang vẫn giữ đăng nhập: cookie HttpOnly còn hiệu lực và app khôi phục hồ sơ qua `GET /api/me/profile` (tối đa 8 giờ theo backend).
- Khách vẫn được xem danh mục và slot trống. Chỉ sau đăng nhập mới có thể đặt lịch. Patient ID luôn lấy từ hồ sơ server xác minh; URL chỉ chứa lựa chọn bác sĩ/ngày/slot.
- Slot trong URL chỉ là lựa chọn ban đầu; phải xuất hiện trong dữ liệu giờ trống vừa tải và còn trong tương lai mới được xác nhận.
- Không thêm chức năng quên mật khẩu/email verification/MFA do backend chưa hỗ trợ.
- Bảng tài khoản không tìm kiếm toàn hệ thống vì API mới chỉ hỗ trợ page/pageSize. Tìm hồ sơ trong modal lọc danh sách hồ sơ thật được trả về.
- Không suy đoán thời điểm/người thực hiện cho lịch sử trước khi backend bắt đầu ghi log.
