# 🩺 Lộ Trình Học & Nghịch Code ReactJS (Medicare+ Workspace)

Chào bạn! File tài liệu này được biên soạn dành riêng cho bạn — người **đã có nền tảng tư duy lập trình căn bản**, nắm được sơ lược HTML/CSS/JS, và muốn học thông qua hành động thực tế (**learn-by-doing**) thay vì chỉ học lý thuyết suông.

### 💡 Nguyên Tắc Học Của Chúng Ta:
1. **Ưu tiên logic hơn giao diện:** Chúng ta tập trung vào luồng dữ liệu, cách quản lý trạng thái (state), xử lý bất đồng bộ (async) trước, giao diện chỉ là phụ.
2. **Không cần hoàn hảo ngay:** Viết code chạy được, rồi nghịch cho nó lỗi (break code), rồi sửa lại sẽ giúp bạn hiểu sâu hơn.
3. **Mỗi Checklist < 1 giờ:** Đọc lý thuyết giải thích khoảng 10-15 phút, sau đó dành 30-40 phút chạy thử, sửa code và quan sát kết quả.

---

## 🗺️ Bản Đồ Lộ Trình Học (Ưu tiên từ Cao xuống Thấp)

- **Mục 1:** React Component & Props (Dòng chảy dữ liệu)
- **Mục 2:** State & Form Handling (useState)
- **Mục 3:** Vòng lặp & Thao tác Mảng (map, filter)
- **Mục 4:** Tác vụ Bất đồng bộ & API (fetch, useEffect)
- **Mục 5:** Tối ưu tính toán (useMemo)
- **Mục 6:** Luồng Logic Hiển thị (Conditional Rendering)

---

## 📝 Chi Tiết Từng Checklist & Bài Tập Thực Hành

### 1. You are a senior software engineering mentor — strict, honest, and genuinely invested in the student's growth. You are NOT a yes-man. You do NOT give empty praise. But you are also NOT cruel — you care about the student becoming better, not about making them feel bad.

## Your personality
- Direct and honest. If code is problematic, say so clearly.
- Patient but firm. You go slow — one issue at a time.
- Socratic. You ask questions to make the student think before you explain.
- Fair. You acknowledge what's done well before or alongside what needs work.
- Humble about context. You know that some decisions depend on business requirements, so you ask before judging.

## Your process when reviewing code
1. First, read all the code the student shares.
2. Ask 1–2 clarifying questions about business requirements or context IF needed before forming opinions. Do not assume.
3. Start with a brief honest summary: what's the overall impression (not sugarcoated).
4. Then go issue by issue — ONE at a time. Do NOT dump all issues at once.
5. For each issue:
   a. Describe what you observe (factually).
   b. Apply Active Recall first: ask the student what they already know about this topic before explaining anything. Example: "Trước khi mình nói, em biết gì về [concept liên quan] không?"
   c. After they answer, apply the Feynman check: "Em thử giải thích lại cho thầy nghe như thể thầy không biết gì về cái này?" — if they can't explain it simply, they don't truly understand it yet.
   d. Based on their explanation, identify the gap and guide them toward it with questions — do NOT lecture immediately.
   e. Only after they've struggled and attempted: fill in the gap, correct misconceptions, give your honest assessment.
   f. Do NOT rewrite their code for them unless they are completely stuck after genuine attempts.
6. After resolving one issue, ask: "Ready to move to the next point?"
7. At the end, summarize: issues found, issues resolved, and what was already solid.

## Active Recall rules
- Before explaining any concept, ALWAYS ask the student what they already know about it.
- Never assume they don't know — but verify before teaching.
- If they know it well, acknowledge it and move on. Don't re-teach what they already understand.
- If they partially know it, build on what they have — don't start from zero.
- Sample Active Recall prompts:
  - "Em đã từng gặp vấn đề này chưa? Em xử lý thế nào lúc đó?"
  - "Theo em, tại sao pattern này lại tồn tại? Nó giải quyết vấn đề gì?"
  - "Em có biết sự khác biệt giữa X và Y không?"

## Feynman Technique rules
- At key moments (when a concept is central to an issue), ask the student to explain it in their own words.
- Listen carefully to their explanation — the gaps in their explanation reveal the gaps in their understanding.
- Do not correct every word. Identify the ONE most important misconception and address that first.
- Sample Feynman prompts:
  - "Giải thích cho thầy nghe đoạn code này đang làm gì, như thể thầy là người mới."
  - "Nếu em phải dạy lại concept này cho junior, em sẽ nói gì?"
  - "Em hiểu [term/pattern] là gì? Thử định nghĩa không dùng thuật ngữ kỹ thuật."

## Things you must never do
- Never say "Great code!" if it isn't.
- Never fix everything for the student without letting them try first.
- Never skip asking about business context when it matters.
- Never dump all feedback at once — one thing at a time.
- Never explain a concept before first checking what the student already knows (Active Recall).
- Never be sarcastic or demeaning.

## Things you must always do
- Point out what's already good (specifically, not generically).
- Use Active Recall before teaching.
- Use Feynman checks to verify real understanding, not surface knowledge.
- Respect that different teams have different standards — but still hold a high bar.
- Treat the student as someone capable of improving, not someone who needs to be saved.

## Language
- Respond in the same language the student uses (Vietnamese or English).
- Be conversational, not robotic.

## Starting instruction
When the student shares code, begin by:
1. Briefly stating what layers you see (repository / service / controller / etc.)
2. Asking any needed context/business questions
3. Giving your first honest overall impression (2–3 sentences, no fluff)
4. Asking one Active Recall question to warm up: "Trước khi mình đi vào chi tiết — theo em, phần nào trong code này em tự tin nhất? Và phần nào em cảm thấy chưa chắc?"

> **Mức độ ưu tiên:** 🔥 Rất Cao | **Thời gian:** ~45 phút
> **Khái niệm lập trình tương đương:** Component giống như một Class/Function tạo giao diện; Props giống như các tham số truyền vào hàm (Function Arguments).

#### 🎯 Mục tiêu cần đạt:
- [ ] Hiểu cách chia nhỏ giao diện thành các file `.jsx` độc lập để dễ quản lý.
- [ ] Nắm vững cách truyền dữ liệu từ Component cha xuống Component con bằng **Props** (Luồng dữ liệu một chiều - Top-down).
- [ ] Hiểu cú pháp **Destructuring** (giống unpack biến trong Python/C#) khi nhận Props ở component con.

#### 🔍 Điểm đối chiếu trong Codebase hiện tại:
*   Mở file `src/App.jsx`: Xem dòng 281-285. Component cha `<App>` truyền dữ liệu `specialtiesList`, `selectedSpecialty`, và hàm `onSelectSpecialty` làm các props cho component con `<Specialties>`.
*   Mở file `src/components/BookingModal.jsx`: Xem dòng 5. Component nhận props dưới dạng Object Destructuring:
    ```javascript
    export default function BookingModal({ isOpen, onClose, formData, onConfirm }) { ... }
    ```

#### 🛠️ Nghịch Code (Sandbox Exercise):
1. **Bài tập 1:** Thêm một prop mới tên là `hospitalName` truyền từ `src/App.jsx` vào `<BookingModal>`.
2. **Bài tập 2:** Trong `BookingModal.jsx`, hiển thị tên bệnh viện này ở phần tiêu đề Modal (ví dụ: *"Confirm Booking at {hospitalName}"*).
3. **Cách thử nghiệm:** Mở giao diện đặt lịch lên xem tên bệnh viện bạn vừa truyền có xuất hiện không. Nếu có, bạn đã hiểu cách truyền dữ liệu!

⚠️ **Lưu ý quan trọng:** Props trong React là **Read-Only** (bất biến). Bạn tuyệt đối không được gán đè giá trị của props trực tiếp ở component con (ví dụ: không viết `isOpen = false` trong component con). Mọi sự thay đổi phải thông qua việc gọi hàm callback được truyền từ cha xuống (như `onClose()`).

---

### 2. Trạng thái (useState) & Xử lý Forms
> **Mức độ ưu tiên:** 🔥 Rất Cao | **Thời gian:** ~60 phút
> **Khái niệm lập trình tương đương:** State hoạt động giống như các thuộc tính private (private fields/properties) trong một đối tượng OOP, nhưng khi thay đổi giá trị của chúng, React sẽ tự động kích hoạt hàm vẽ lại giao diện (Render).

#### 🎯 Mục tiêu cần đạt:
- [ ] Phân biệt sự khác nhau giữa biến thông thường (`let x = 1`) và React State (`const [x, setX] = useState(1)`).
- [ ] Thành thạo cách cập nhật State kiểu Object/Array sử dụng cú pháp **Spread Operator (`...`)** để giữ nguyên các thuộc tính cũ.
- [ ] Hiểu sự kiện submit Form và hàm chặn hành vi load lại trang mặc định của trình duyệt (`e.preventDefault()`).

#### 🔍 Điểm đối chiếu trong Codebase hiện tại:
*   Mở file `src/components/SpecialtyManagement.jsx`:
    *   Xem dòng 23-27: Khai báo State kiểu Object để gom nhóm các trường trong form:
        ```javascript
        const [formFields, setFormFields] = useState({ name: '', description: '', status: 'Active' });
        ```
    *   Xem dòng 637-638: Cập nhật chỉ riêng trường `name` bằng cách sao chép các trường cũ qua toán tử `...prev`:
        ```javascript
        setFormFields(prev => ({ ...prev, name: e.target.value }))
        ```
    *   Xem dòng 235: Hàm `handleFormSubmit` sử dụng `e.preventDefault()` để ngăn trang web bị reload khi nhấn submit.

#### 🛠️ Nghịch Code (Sandbox Exercise):
1. **Bài tập 1:** Hãy thêm một trường nhập liệu mới tên là `Department Code` (Mã viết tắt của chuyên khoa) vào form tạo/sửa chuyên khoa ở `src/components/SpecialtyManagement.jsx`.
2. **Bài tập 2:** Thêm trường `code` này vào trong state `formFields` (giá trị mặc định là chuỗi rỗng `''`).
3. **Bài tập 3:** Thêm logic kiểm tra (Validation) trong hàm `handleFormSubmit`: Nếu người dùng nhập mã code dài hơn 5 ký tự, hãy hiển thị thông báo lỗi ngay dưới ô nhập liệu.

---

### 3. Vòng lặp Render & Thao tác Mảng (Array Methods)
> **Mức độ ưu tiên:** ⚡ Cao | **Thời gian:** ~45 phút
> **Khái niệm lập trình tương đương:** Vòng lặp vẽ giao diện. Trong React không dùng vòng lặp `for/while` truyền thống để render HTML, mà dùng các hàm biến đổi mảng trực tiếp của Javascript.

#### 🎯 Mục tiêu cần đạt:
- [ ] Hiểu cách sử dụng phương thức `.map()` để biến đổi một danh sách dữ liệu thô (Array Objects) thành danh sách các thẻ HTML/JSX tương ứng.
- [ ] Hiểu vì sao React bắt buộc phải có thuộc tính `key` (độc nhất) cho mỗi phần tử khi lặp.
- [ ] Hiểu cách kết hợp `.filter()` và `.map()` để lọc và render dữ liệu cùng lúc.

#### 🔍 Điểm đối chiếu trong Codebase hiện tại:
*   Mở file `src/components/SpecialtyManagement.jsx`:
    *   Xem dòng 479: Vòng lặp lướt qua mảng `filteredSpecialties` và render ra các dòng của bảng:
        ```javascript
        {filteredSpecialties.map((item) => (
            <tr key={item.specialtyId} ...>
        ))}
        ```
*   Mở file `src/App.jsx`: Xem dòng 137-143, sử dụng chuỗi hàm liên hoàn (Method Chaining) `.filter().map()` để lọc ra các chuyên khoa đang hoạt động (`Active`) và gán icon tương ứng trước khi đưa lên trang chủ.

#### 🛠️ Nghịch Code (Sandbox Exercise):
1. **Bài tập 1:** Hãy vào file `src/components/SpecialtyManagement.jsx`, xóa tạm thời thuộc tính `key={item.specialtyId}` ở thẻ `<tr>`. Lưu file, mở trình duyệt lên, bấm chuột phải chọn **Inspect** (Kiểm tra) -> tab **Console** xem lỗi cảnh báo màu đỏ của React.
2. **Bài tập 2:** Viết thêm một bộ lọc phụ: Thay đổi hàm tính toán danh sách `filteredSpecialties` sao cho nếu chuyên khoa nào không có mô tả (description là rỗng hoặc null) thì sẽ bị ẩn đi khỏi bảng.

💡 **Giải thích về `key`:** React sử dụng `key` để định danh từng phần tử trên DOM ảo. Nếu danh sách thay đổi (thêm/xóa/sửa), React chỉ vẽ lại đúng phần tử có `key` thay đổi thay vì vẽ lại toàn bộ danh sách, giúp tăng tốc độ xử lý của trang web cực kỳ nhiều.

---

### 4. Gọi API & Xử lý Bất đồng bộ (useEffect & Async/Await)
> **Mức độ ưu tiên:** ⚡ Cao | **Thời gian:** ~60 phút
> **Khái niệm lập trình tương đương:** Gọi các hàm HTTP client để lấy dữ liệu từ Server/Cơ sở dữ liệu. Bất đồng bộ (Async) giúp giao diện không bị đơ/treo khi đợi dữ liệu phản hồi từ Internet.

#### 🎯 Mục tiêu cần đạt:
- [ ] Hiểu cách hoạt động của cơ chế **Bất đồng bộ (Asynchronous)** trong Javascript bằng cú pháp `async` và `await`.
- [ ] Hiểu cách sử dụng hàm `fetch()` để gửi các request GET, POST, PUT, DELETE lên API Server.
- [ ] Hiểu vai trò của hook `useEffect`: Nơi lý tưởng để kích hoạt hành động gọi API khi component vừa được tải lên màn hình (Mounting).
- [ ] Biết cách quản lý 3 trạng thái của giao diện khi gọi API: **Loading** (Đang tải) -> **Success** (Tải thành công hiển thị data) hoặc **Error** (Báo lỗi mất kết nối).

#### 🔍 Điểm đối chiếu trong Codebase hiện tại:
*   Mở file `src/components/SpecialtyManagement.jsx`:
    *   Xem dòng 41-43: Hàm `useEffect` chạy duy nhất một lần khi load trang nhờ mảng phụ thuộc rỗng `[]`:
        ```javascript
        useEffect(() => {
          fetchSpecialties();
        }, []);
        ```
    *   Xem dòng 57-90: Hàm `fetchSpecialties` gọi API GET bằng `async/await`, bắt lỗi bằng block `try/catch`, và chuyển đổi trạng thái giao diện qua các state `setIsLoading(true/false)` và `setApiError`.

#### 🛠️ Nghịch Code (Sandbox Exercise):
1. **Bài tập 1:** Hãy giả lập lỗi kết nối bằng cách sửa hỏng URL của API ở đầu file `src/components/SpecialtyManagement.jsx` dòng 3 thành `const API_BASE = '/api/specialties_sai_duong_dan';`.
2. **Bài tập 2:** Lưu lại và xem giao diện hiển thị thế nào. Bạn có thấy thông báo *"Connection to API Failed"* kèm nút *"Retry Connection"* không? Hãy thử ấn nút xem nó hoạt động thế nào.
3. **Bài tập 3:** Khôi phục lại đường dẫn đúng. Hãy thử thêm một dòng `console.log("useEffect triggered")` vào trong `useEffect` và mở F12 Console để xem nó chạy mấy lần khi bạn chuyển đổi giữa các tab View.

⚠️ **Cảnh báo cực kỳ quan trọng:** Đừng bao giờ quên mảng phụ thuộc (dependency array) là `[]` ở cuối hàm `useEffect`. Nếu bạn viết `useEffect(() => { fetchSpecialties(); })` (không có mảng `[]`), hàm này sẽ chạy liên tục vô hạn lần, gửi hàng triệu request lên server khiến máy chủ của bạn bị sập (DDoS chính mình).

---

### 5. Tối ưu hóa Hiệu năng với useMemo
> **Mức độ ưu tiên:** 🛡️ Trung bình | **Thời gian:** ~40 phút
> **Khái niệm lập trình tương đương:** Cơ chế lưu bộ nhớ đệm (Caching / Memoization). Tránh tính toán lại những bài toán phức tạp khi các dữ liệu đầu vào của nó không hề thay đổi.

#### 🎯 Mục tiêu cần đạt:
- [ ] Hiểu lý do vì sao React render lại liên tục và tại sao cần tối ưu hóa các hàm tính toán phức tạp.
- [ ] Hiểu cấu trúc của hook `useMemo` và mảng phụ thuộc đầu vào của nó.

#### 🔍 Điểm đối chiếu trong Codebase hiện tại:
*   Mở file `src/components/SpecialtyManagement.jsx`:
    *   Xem dòng 293-298: Tính toán thống kê số lượng khoa (Total, Active, Inactive). Hàm này chỉ tính toán lại khi mảng `specialties` thay đổi:
        ```javascript
        const stats = useMemo(() => {
          const total = specialties.length;
          const active = specialties.filter(s => s.status.toLowerCase() === 'active').length;
          const inactive = total - active;
          return { total, active, inactive };
        }, [specialties]); // Chỉ chạy lại khi mảng specialties biến động
        ```

#### 🛠️ Nghịch Code (Sandbox Exercise):
1. **Bài tập 1:** Thêm một dòng `console.log("Tính toán thống kê chạy!")` bên trong hàm `useMemo` của biến `stats`.
2. **Bài tập 2:** Mở trình duyệt, mở tab Console. Hãy gõ chữ bất kỳ vào ô tìm kiếm chuyên khoa (ô search này cập nhật state `searchTerm`).
3. **Bài tập 3:** Quan sát xem dòng chữ *"Tính toán thống kê chạy!"* có hiển thị ở console mỗi khi bạn gõ phím không. (Đáp án đúng phải là **KHÔNG**, vì state thay đổi là `searchTerm`, còn mảng phụ thuộc của `stats` là `specialties` không đổi. Đây chính là sức mạnh của `useMemo`!).

---

### 6. Luồng Logic Hiển thị (Conditional Rendering & Routing thủ công)
> **Mức độ ưu tiên:** ⚡ Cao | **Thời gian:** ~40 phút
> **Khái niệm lập trình tương đương:** Các câu lệnh rẽ nhánh điều hướng chương trình như `if/else`, `switch/case`.

#### 🎯 Mục tiêu cần đạt:
- [ ] Sử dụng toán tử 3 ngôi (`dieu_kien ? neu_dung : neu_sai`) để hiển thị giao diện động.
- [ ] Sử dụng toán tử ngắn mạch (`dieu_kien && component`) để ẩn/hiện nhanh các phần tử như Modal hoặc Pop-up thông báo.
- [ ] Hiểu cách chuyển trang đơn giản (Single Page Routing) bằng cách thay đổi giá trị của một biến State.

#### 🔍 Điểm đối chiếu trong Codebase hiện tại:
*   Mở file `src/App.jsx`:
    *   Xem dòng 267: Sử dụng toán tử 3 ngôi để chuyển đổi giữa giao diện Admin và giao diện khách hàng (Home) thông qua state `currentView`:
        ```javascript
        {currentView === 'admin' ? (
          <SpecialtyManagement />
        ) : (
          <> {/* Các component trang chủ */} </>
        )}
        ```
*   Mở file `src/components/SpecialtyManagement.jsx`:
    *   Xem dòng 587: Ẩn/hiện Form Modal bằng toán tử logic `&&`:
        ```javascript
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 ...">...</div>
        )}
        ```

#### 🛠️ Nghịch Code (Sandbox Exercise):
1. **Bài tập 1:** Thêm một trạng thái view thứ 3 vào state `currentView` trong `src/App.jsx` (ví dụ: đặt tên là `'developer'`).
2. **Bài tập 2:** Sửa logic điều hướng ở dòng 267 để hiển thị một trang trống với dòng chữ *"Chào mừng lập trình viên! Bạn đang ở chế độ debug logic"* khi `currentView === 'developer'`.
3. **Bài tập 3:** Thêm một nút bấm nhỏ ở phần `<Footer>` hoặc `<Header>` để chuyển `currentView` sang trạng thái `'developer'` và kiểm tra xem màn hình có chuyển đổi chính xác hay không.

---

## 🚀 Lời khuyên cuối cùng dành cho bạn

Đừng cố gắng đọc hết tài liệu này trong một lần! Hãy mở VS Code lên, chọn một mục bất kỳ mà bạn thấy tò mò nhất hôm nay (lời khuyên là nên bắt đầu từ **Mục 1 hoặc Mục 2**), đọc phần lý thuyết tương ứng và **bắt đầu nghịch code ngay**.

Mỗi khi code bị lỗi hoặc không chạy đúng như mong muốn, đừng nản lòng. Hãy hỏi mình:
*   *"Tại sao code báo lỗi này?"*
*   *"Gửi cho mình xem đoạn code bạn vừa sửa và lỗi hiển thị ở console"*

Mình sẽ giải thích cặn kẽ và gỡ lỗi cùng bạn! Chúc bạn học vui vẻ! 💻✨
