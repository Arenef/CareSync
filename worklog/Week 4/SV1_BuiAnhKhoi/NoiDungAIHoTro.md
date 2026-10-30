<a id="top"></a>

# KHAI BÁO SỬ DỤNG CÔNG CỤ AI – CARESYNC (TUẦN 4)

**Sinh viên 1:** Bùi Anh Khôi  
**Công cụ AI sử dụng:** Gemini
**Model:** Gemini 3.8 Flash

---

## Mục lục

- [KHAI BÁO SỬ DỤNG CÔNG CỤ AI – CARESYNC (TUẦN 4)](#khai-báo-sử-dụng-công-cụ-ai--caresync-tuần-4)
  - [Mục lục](#mục-lục)
  - [1. Khai báo công cụ AI](#1-khai-báo-công-cụ-ai)
  - [2. Hỗ trợ rà soát mã nguồn và gợi ý định hướng tối ưu hóa (Refactoring)](#2-hỗ-trợ-rà-soát-mã-nguồn-và-gợi-ý-định-hướng-tối-ưu-hóa-refactoring)
    - [2.1. Yêu cầu (Prompt)](#21-yêu-cầu-prompt)
    - [2.2. Nội dung AI rà soát và gợi ý](#22-nội-dung-ai-rà-soát-và-gợi-ý)
      - [Gợi ý 1: Trùng lặp module ca khám giữa `client/js/booking.js` và `client/js/lookup.js`](#gợi-ý-1-trùng-lặp-module-ca-khám-giữa-clientjsbookingjs-và-clientjslookupjs)
      - [Gợi ý 2: Xử lý ẩn/hiện Section lặp lại thủ công trong `client/js/doctor-auth.js`](#gợi-ý-2-xử-lý-ẩnhiện-section-lặp-lại-thủ-công-trong-clientjsdoctor-authjs)
      - [Gợi ý 3: Phân mảnh hàm hiển thị thông báo Toast (`showToast`)](#gợi-ý-3-phân-mảnh-hàm-hiển-thị-thông-báo-toast-showtoast)
      - [Gợi ý 4: Tệp tin rỗng dư thừa ở backend `server/lambda/index.mjs`](#gợi-ý-4-tệp-tin-rỗng-dư-thừa-ở-backend-serverlambdaindexmjs)
      - [Đánh giá tổng quan từ AI](#đánh-giá-tổng-quan-từ-ai)
    - [2.3. Quá trình sinh viên trực tiếp đánh giá, hiện thực và hoàn thiện](#23-quá-trình-sinh-viên-trực-tiếp-đánh-giá-hiện-thực-và-hoàn-thiện)

---

<a id="1-khai-bao-cong-cu-ai"></a>

## 1. Khai báo công cụ AI

- **Công cụ AI sử dụng:** Gemini
- **Model:** Gemini 3.8 Flash
- **Phạm vi hỗ trợ:** Công cụ AI đóng vai trò như một **trợ lý rà soát mã nguồn (Code Reviewer)**, hỗ trợ quét qua toàn bộ cấu trúc dự án để chỉ ra những vị trí có khả năng trùng lặp logic, dư thừa mã lệnh hoặc xung đột DOM tiềm ẩn.
- **Vai trò chủ đạo của sinh viên:** Sinh viên trực tiếp phân tích kiến trúc, đối chiếu các phản hồi của AI với thực tế dự án, tự đưa ra quyết định kỹ thuật, tự tay viết lại toàn bộ mã nguồn tái cấu trúc (refactoring), dọn dẹp cây thư mục và độc lập thực hiện kiểm tra cú pháp (`node -c`) cùng kiểm thử E2E trên hệ thống thực tế.

---

<a id="2-ho-tro-ra-soat-ma-nguon-va-goi-y-dinh-huong-toi-uu-hoa-refactoring"></a>

## 2. Hỗ trợ rà soát mã nguồn và gợi ý định hướng tối ưu hóa (Refactoring)

<a id="21-yeu-cau-prompt"></a>

### 2.1. Yêu cầu (Prompt)

> Hãy đóng vai trò Code Reviewer, hỗ trợ tôi quét nhanh toàn bộ source code của project CareSync (cả Client frontend lẫn Server AWS Lambda) để chỉ ra các đoạn mã có dấu hiệu trùng lặp (duplicate), dư thừa logic hoặc xung đột DOM. Đưa ra các gợi ý định hướng để tôi tham khảo và tự tay tối ưu lại codebase cho gọn gàng, sạch sẽ, chuẩn chỉ.

---

<a id="22-noi-dung-ai-ra-soat-va-goi-y"></a>

### 2.2. Nội dung AI rà soát và gợi ý

Sau khi quét qua mã nguồn các module của dự án, AI đã tổng hợp và gợi ý cho sinh viên 4 điểm cần lưu ý để tối ưu:

#### Gợi ý 1: Trùng lặp module ca khám giữa `client/js/booking.js` và `client/js/lookup.js`

- **Phát hiện:**
  - Ở cuối tệp `booking.js` (từ dòng 490 đến 782) còn tồn tại cụm hàm quản lý lịch hẹn từ phiên bản cũ: `initMyAppointments()`, `renderMyAppointments()`, `renderAppointmentCard()`, `openTicketModal()`, `cancelAppointment()`.
  - Trong khi đó, việc tra cứu và render danh sách phiếu khám thực tế trên giao diện hiện tại đã được tách riêng sang `lookup.js` (theo luồng tra cứu số điện thoại). Các thẻ đếm trạng thái (`countAll`, `countUpcoming`, `countCancelled`) cũng không còn trên HTML.
- **Gợi ý định hướng:**
  - Nên giữ lại hàm lưu lịch `saveNewAppointment()` trong `booking.js` khi bệnh nhân gửi form.
  - Cân nhắc cắt bỏ cụm code render cũ trong `booking.js` để tránh tình trạng cả 2 file cùng can thiệp ghi đè vào container `#myAppointmentsList`.

#### Gợi ý 2: Xử lý ẩn/hiện Section lặp lại thủ công trong `client/js/doctor-auth.js`

- **Phát hiện:**
  - Trong quá trình bác sĩ đăng nhập (`applyDoctorSession`), code tìm và gán `style.display = 'none'` cho từng phần tử: `#hero`, `#workflow`, `#doctorsDirectorySection`, `#bookingSection`, `primaryNav`, nút đặt thêm lịch...
  - Khi bác sĩ đăng xuất (`handleDoctorLogout`), code lại lặp lại y hệt từng dòng `document.getElementById(...)` đó để gán lại `display = ''`.
- **Gợi ý định hướng:**
  - Gom các ID vào một mảng danh sách và viết một hàm helper ngắn (ví dụ: `togglePatientSections(show)`) nhận cờ boolean để tái sử dụng cho cả lúc đăng nhập lẫn đăng xuất.

#### Gợi ý 3: Phân mảnh hàm hiển thị thông báo Toast (`showToast`)

- **Phát hiện:**
  - Có sự phân mảnh khi mỗi file tự xử lý thông báo toast riêng: `booking.js` dùng `showToast`, `lookup.js` dùng `safeShowToast`, còn `doctor-auth.js` tự viết thêm hàm `showToastNotification(...)` dài khoảng 30 dòng tự tạo DOM toast.
- **Gợi ý định hướng:**
  - Nên chuẩn hóa 1 hàm `window.showToast(title, message, type)` duy nhất đặt tại tệp điều hướng chung (`navigation.js` hoặc `app.js`), các file khác chỉ cần gọi dùng lại.

#### Gợi ý 4: Tệp tin rỗng dư thừa ở backend `server/lambda/index.mjs`

- **Phát hiện:** Trong thư mục `server/lambda`, có tệp `index.mjs` chỉ có 21 bytes (rỗng), trong khi toàn bộ backend đang dùng CommonJS với tệp chính `index.js`.
- **Gợi ý định hướng:** Xóa bỏ tệp `index.mjs` để tránh nhầm lẫn entrypoint khi nén package `.zip` triển khai lên AWS Lambda.

#### Đánh giá tổng quan từ AI

- Nếu dọn dẹp các điểm trên, dự án có thể giảm khoảng 350 - 400 dòng code dư thừa.
- Tránh xung đột sự kiện DOM, mã nguồn phân tách module rõ ràng và chuyên nghiệp hơn khi báo cáo.

---

<a id="23-qua-trinh-sinh-vien-truc-tiep-danh-gia-hien-thuc-va-hoan-thien"></a>

### 2.3. Quá trình sinh viên trực tiếp đánh giá, hiện thực và hoàn thiện

Sau khi tiếp nhận các phân tích gợi ý từ AI, sinh viên đã tự mình kiểm chứng lại mã nguồn thực tế và trực tiếp thực hiện toàn bộ công việc tái cấu trúc:

1. **Trực tiếp rà soát và tái cấu trúc `client/js/booking.js`:**
   - Đối chiếu giao diện HTML và xác nhận các bộ đếm `countAll`, `countUpcoming`... thực sự không còn trên DOM.
   - Xóa bỏ hơn 200 dòng mã render ca khám cũ dư thừa ở cuối file `booking.js` (`initMyAppointments`, `renderMyAppointments`, `renderAppointmentCard`, `openTicketModal`, `cancelAppointment`).
   - Giữ nguyên các hàm cốt lõi phục vụ form đặt khám và modal vé xác nhận (`handleBookingReset`, `openAppointmentTicketModal`), đồng thời xuất hàm `window.showToast` dùng chung toàn ứng dụng.
   - Bàn giao trọn vẹn trách nhiệm quản lý, tra cứu và hiển thị danh sách phiếu khám trên container `#myAppointmentsList` cho module `lookup.js`, triệt tiêu hoàn toàn nguy cơ xung đột thao tác DOM giữa hai file JS.

2. **Tự thiết kế lại cơ chế ẩn/hiện Section trong `client/js/doctor-auth.js`:**
   - Khai báo mảng cấu hình tập trung `PATIENT_SECTION_IDS = ['hero', 'workflow', 'doctorsDirectorySection', 'bookingSection']`.
   - Viết hàm helper `togglePatientSections(show)` để điều khiển trạng thái hiển thị của các section bệnh nhân và thanh điều hướng `primaryNav`.
   - Thay thế toàn bộ các đoạn code gán `style.display` rải rác trước đây bằng 1 lệnh gọi hàm duy nhất khi đăng nhập (`togglePatientSections(false)`) và đăng xuất (`togglePatientSections(true)`).

3. **Thống nhất hàm Toast Notification toàn hệ thống:**
   - Loại bỏ đoạn mã tự tạo DOM toast thủ công dài 25 dòng trong `doctor-auth.js`.
   - Chuyển toàn bộ các thông báo của cổng bác sĩ (`showToastNotification`) và module tra cứu (`safeShowToast`) về sử dụng hàm chuẩn `window.showToast(title, message, type)`, giúp giao diện thông báo đồng bộ phong cách và không bị lỗi CSS chắp vá.

4. **Dọn dẹp cây thư mục backend AWS Lambda:**
   - Kiểm tra nội dung tệp `server/lambda/index.mjs`, xác nhận đây là tệp rỗng không liên kết vào kiến trúc triển khai của nhóm và chủ động xóa khỏi repository.

---

[Quay lại đầu trang](#top)
