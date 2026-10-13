# Đọc code giao diện MediCare+ theo từng bước

Mục tiêu của lần chỉnh này: nhìn gọn, thao tác rõ, và không cần học thêm một bộ thư viện mới.
Vẫn dùng React, Vite, Tailwind và Lucide đang có. API và cấu trúc chia theo tính năng được giữ lại.

## 1. Bắt đầu bằng một component nhỏ

Đọc theo thứ tự này, chưa cần quan tâm từng class CSS:

1. `src/features/home/components/DoctorCard.jsx`: nhận dữ liệu qua **props**, đổi trái tim bằng **useState**.
2. `src/features/home/components/FeaturedDoctors.jsx`: dùng **map** để tạo nhiều card, **key** ổn định theo tên trong dữ liệu mẫu.
3. `src/features/home/page/HomePage.jsx`: ghép các section thành một trang.
4. `src/components/layout/AdminLayout.jsx`: khung quản trị dùng **children** để chứa trang đang mở.
5. `src/App.jsx`: URL → component trang → layout.

Mẹo: tạm bỏ qua `className`, đọc tên component, props, state và event handler trước.
Không cần học thuộc CSS để hiểu luồng dữ liệu.

## 2. Tư duy chia component

Chia theo trách nhiệm và phần cần tái sử dụng, không chia mỗi thẻ HTML thành một file.

| Phần | Trách nhiệm | Không nên làm |
| --- | --- | --- |
| Page: `SpecialtiesPage` | Tải dữ liệu, gọi API, giữ danh sách, chọn item đang sửa | Tự viết lại khung modal |
| Form: `SpecialtyForm` | Giữ giá trị nhập, validate, chuẩn hóa payload, gọi `onSave` | Tự tải lại cả danh sách |
| Table: `SpecialtiesTable` | Hiện dữ liệu, phát sự kiện `onEdit`, `onDeactivate` | Tự gọi API xóa |
| `Modal` | Hộp thoại, focus, Escape, đóng/mở, thông báo lỗi | Biết chuyên khoa có những field gì |
| `AdminLayout` | Menu, trang hiện tại, vùng nội dung chung | Biết API bác sĩ trả gì |

Ví dụ `FieldError` nhỏ trong mỗi form vẫn được giữ đơn giản; chưa cần tạo một hệ thống sinh form bằng cấu hình.
Chỉ tách tiếp khi sự lặp lại hoặc trách nhiệm riêng đã rõ.

## 3. Lần theo một thao tác: thêm chuyên khoa

1. Người dùng bấm “Thêm chuyên khoa” → page đặt `isFormOpen = true`.
2. Form được mount → khởi tạo `values`; Modal gọi `showModal()`.
3. Người dùng gõ → `onChange` cập nhật state của form (**controlled input**).
4. Submit → chặn reload bằng `preventDefault()` → kiểm tra dữ liệu.
5. Hợp lệ → form gọi `onSave(payload)` của page.
6. Page gọi API và bật `isSaving` để tránh bấm lưu nhiều lần.
7. Thành công → dùng object server trả về để cập nhật danh sách và đóng modal.
8. Thất bại → giữ dữ liệu đang nhập, hiện lỗi trong modal; lỗi field được gắn đúng ô.

`key={selectedSpecialty?.specialtyId ?? 'new'}` giúp form có vòng đời mới khi đổi đối tượng.
Không cần đồng bộ lại toàn bộ props vào state bằng một effect dài.

## 4. Tìm kiếm: tính từ dữ liệu, đừng nhân đôi state

Trong `SpecialtiesPage.jsx` và `DoctorsPage.jsx`:

- Danh sách API là nguồn dữ liệu gốc.
- `searchTerm` là lựa chọn của người dùng.
- `visibleItems` được tính bằng `filter` trong mỗi render: đây là **derived state**.
- Chỉ danh sách hiển thị thay đổi; tìm kiếm không gửi request và không sửa dữ liệu gốc.

Đây là tìm kiếm chuỗi đơn giản, không phân biệt hoa/thường; chưa hỗ trợ tự bỏ dấu tiếng Việt.
Với dữ liệu hiện tại, chưa cần `useMemo`, debounce hay thư viện tìm kiếm.

## 5. Modal và những chi tiết UX đáng học

`src/components/ui/Modal.jsx` dùng phần tử HTML `dialog`:

- `useRef` để gọi `showModal()` và `close()`.
- `useEffect` để quản lý vòng đời và khôi phục trạng thái sau khi đóng.
- Native dialog giữ focus trong hộp thoại và làm phần nền không tương tác được.
- Cùng một hàm đóng xử lý nút X, Escape và bấm nền; không đóng khi đang lưu.
- Khi đóng, trả focus lại phần tử mở form.
- `aria-labelledby`, `aria-describedby`, `aria-invalid` giúp công nghệ hỗ trợ hiểu nội dung và lỗi.

Thông báo lỗi phải nằm trong modal. Nếu chỉ hiển thị ở page bên dưới lớp nền thì người dùng khó biết vì sao lưu thất bại.

## 6. Lịch tuần: để đọc sau

`calendarLayout.js` là hàm thuần, không gọi API và không biết React.
Nó sắp ca theo giờ bắt đầu, rồi xếp vào cột trống đầu tiên.
Những ca trùng nhau dùng các cột riêng để không che mất nhau.

Keyword nâng cao: **pure function**, **interval overlap**, **interval partitioning**.
Hai ca 08:00–09:00 và 09:00–10:00 không trùng nhau.
Ca rất ngắn giữ đúng chiều cao theo thời gian; tên và giờ đầy đủ vẫn có trong bảng chi tiết bên dưới.

Trong page, `isScheduleReady` phân biệt:

- Đã tải thành công một lịch thực sự trống → có thể chỉnh/lưu.
- Tải thất bại, chưa biết lịch hiện tại → chỉ cho tải lại, chưa cho lưu đè.

Đừng coi “request bị lỗi” là “danh sách đang rỗng”.

## 7. Bài tập tự code lại

1. Viết lại `DoctorCard` chỉ với tên, chuyên khoa và nút thích. Chưa cần CSS.
2. Tự làm ô tìm tên chuyên khoa bằng `useState` + `filter`; so sánh với code hiện tại.
3. Thêm bộ lọc “Đang dùng / Ngừng dùng / Tất cả” bằng một state, rồi kết hợp với từ khóa.
4. Viết một modal “Ghi chú” nhận `children`; thử Tab, Shift+Tab, Escape và trả focus.
5. Thêm một test cho ba ca cùng bắt đầu lúc 08:00 vào `calendarLayout.test.mjs`.

Mỗi bài nên làm trên branch riêng để có thể so sánh lại; chưa cần đụng đến API thật.

## 8. Kiểm tra và giới hạn hiện tại

- `npm run lint`: kiểm tra lỗi code phổ biến.
- `npm run build`: kiểm tra đóng gói ứng dụng.
- `npm test`: test logic xếp ca và render các trang, modal, trạng thái lịch lỗi/rỗng.
- Các test render không thay thế kiểm tra thao tác thật trong trình duyệt.
- Dữ liệu bác sĩ, đánh giá, thống kê và liên hệ trên landing page là dữ liệu mẫu.
- Form đặt lịch ở trang chủ chỉ là bản xem trước, chưa gửi cuộc hẹn. Ứng dụng di động được ghi rõ “coming soon”.
- API quản trị vẫn dùng cấu hình proxy/backend hiện có. Lần chỉnh UI không thay đổi backend.

Các URL giữ nguyên: `/`, `/admin/specialties`, `/admin/doctors`, `/admin/shift-schedules`, `/admin/non-working-days`.
CSS riêng đặt trong `src/styles/home.css`; các phần chung trong `src/styles/ui.css`.
