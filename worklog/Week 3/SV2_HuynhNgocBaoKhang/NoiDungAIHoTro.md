<a id="top"></a>

# KHAI BÁO SỬ DỤNG CÔNG CỤ AI – CARESYNC (TUẦN 3)

**Sinh viên 2:** Huỳnh Ngọc Bảo Khang  
**MSSV:** 24110241  
**Vai trò:** SV2 – Backend Serverless, DynamoDB GSI, Triển khai SNS & Hosting  
**Công cụ AI sử dụng:** ChatGPT  
**Model:** ChatGPT-4o  

---

## Mục lục

- [1. Khai báo công cụ AI](#1-khai-bao-cong-cu-ai)
- [2. Hỗ trợ quy trình Hosting S3 kết hợp Amazon CloudFront CDN](#2-ho-tro-quy-trinh-hosting-s3-ket-hop-amazon-cloudfront-cdn)
  - [2.1. Yêu cầu (Prompt)](#21-yeu-cau-prompt)
  - [2.2. Nội dung AI sinh ra](#22-noi-dung-ai-sinh-ra)
  - [2.3. Sinh viên đã hoàn thiện & Xử lý tình huống kỹ thuật thực tế](#23-sinh-vien-da-hoan-thien--xu-ly-tinh-huong-ky-thuat-thuc-te)

---

<a id="1-khai-bao-cong-cu-ai"></a>

## 1. Khai báo công cụ AI

- **Công cụ AI sử dụng:** ChatGPT
- **Model:** ChatGPT-4o
- **Mục đích:** Tham vấn quy trình kỹ thuật chuẩn của AWS về việc phân phối website tĩnh từ Amazon S3 thông qua mạng phân phối nội dung Amazon CloudFront CDN kết hợp cơ chế bảo mật Origin Access Control (OAC), ép chuyển hướng giao thức an toàn HTTPS.

---

<a id="2-ho-tro-quy-trinh-hosting-s3-ket-hop-amazon-cloudfront-cdn"></a>

## 2. Hỗ trợ quy trình Hosting S3 kết hợp Amazon CloudFront CDN

<a id="21-yeu-cau-prompt"></a>

### 2.1. Yêu cầu (Prompt)

> Hướng dẫn các bước cấu hình chi tiết trên AWS Console để host website tĩnh trên Amazon S3 kết hợp Amazon CloudFront CDN, sử dụng Origin Access Control (OAC) để bảo mật bucket (chỉ cho phép CloudFront truy cập) và cấu hình chuyển hướng HTTP sang HTTPS.

---

<a id="22-noi-dung-ai-sinh-ra"></a>

### 2.2. Nội dung AI sinh ra

Dưới đây là quy trình 4 bước chuẩn theo Best Practices của AWS để triển khai hosting website tĩnh an toàn với S3 và CloudFront OAC:

#### Bước 1: Chuẩn bị mã nguồn và Upload lên S3 Bucket
1. Mở **Amazon S3 Console** $\rightarrow$ Chọn Bucket lưu trữ frontend (ví dụ: `appointment-booking-web-demo`).
2. Tải toàn bộ nội dung mã nguồn giao diện lên thư mục gốc của bucket:
   - Tệp tin `index.html` (đặt tại root bucket).
   - Các thư mục tài nguyên: `css/`, `js/`, `assets/`.
   - *Lưu ý:* Kiểm tra các cấu hình gọi API trong tệp `api.js` đã trỏ đúng endpoint API Gateway.

#### Bước 2: Khởi tạo Amazon CloudFront Distribution với OAC
1. Mở **Amazon CloudFront Console** $\rightarrow$ Bấm nút **Create distribution**.
2. Cấu hình các thông số quan trọng:
   - **Origin domain:** Chọn S3 Bucket tương ứng (`<bucket-name>.s3.us-east-1.amazonaws.com`).
   - **Origin access:** Chọn **Origin access control settings (recommended)** $\rightarrow$ Bấm **Create control setting** $\rightarrow$ Nhấn **Create**.
   - **Viewer protocol policy:** Chọn **Redirect HTTP to HTTPS** (đảm bảo mọi truy cập đều được mã hóa SSL/TLS).
   - **Allowed HTTP methods:** Chọn `GET, HEAD`.
   - **Web Application Firewall (WAF):** Chọn **Do not enable security protections** (để tối ưu chi phí và phù hợp bài thực hành).
   - **Default root object:** Nhập `index.html`.
3. Bấm **Create distribution** và chờ hệ thống phân phối tạo các Edge Location trên toàn cầu.

#### Bước 3: Cập nhật S3 Bucket Policy cấp quyền cho CloudFront OAC
1. Sau khi khởi tạo CloudFront xong, bấm nút **Copy policy** trên thanh thông báo màu vàng của CloudFront Console.
2. Quay lại **Amazon S3 Console** $\rightarrow$ Chọn Bucket $\rightarrow$ Tab **Permissions** $\rightarrow$ Mục **Bucket policy** $\rightarrow$ Bấm **Edit**.
3. Dán chính sách (Policy) cấp quyền đọc cho dịch vụ CloudFront:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "AllowCloudFrontServicePrincipalReadOnly",
         "Effect": "Allow",
         "Principal": {
           "Service": "cloudfront.amazonaws.com"
         },
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::<your-bucket-name>/*",
         "Condition": {
           "StringEquals": {
             "AWS:SourceArn": "arn:aws:cloudfront::<account-id>:distribution/<distribution-id>"
           }
         }
       }
     ]
   }
   ```
4. Bấm **Save changes**.

#### Bước 4: Kiểm tra và nghiệm thu website
1. Lấy tên miền phân phối **Distribution domain name** (ví dụ: `https://d123456abcdef.cloudfront.net`).
2. Mở trình duyệt web truy cập tên miền để kiểm tra: website có ổ khóa bảo mật HTTPS, tải đầy đủ hình ảnh, CSS và giao tiếp API mượt mà.

---

<a id="23-sinh-vien-da-hoan-thien--xu-ly-tinh-huong-ky-thuat-thuc-te"></a>

### 2.3. Sinh viên đã hoàn thiện & Xử lý tình huống kỹ thuật thực tế

Dựa trên hướng dẫn của AI, sinh viên đã áp dụng vào dự án thực tế và xử lý linh hoạt bài toán phân quyền:

1. **Thực thi:** Đồng bộ endpoint API Gateway và upload toàn bộ 19 file giao diện `client/` lên S3 Bucket `appointment-booking-web-demo`.
2. **Xử lý rào cản IAM:** Khi cấu hình CloudFront OAC, tài khoản AWS Academy bị chặn quyền (`AccessDenied` do chính sách Permission Boundary).
3. **Giải pháp kiến trúc dự phòng:** Chủ động chuyển sang kích hoạt **S3 Static Website Hosting** kết hợp Bucket Policy `PublicReadGetObject`. Website hoạt động ổn định tại:  
   `http://appointment-booking-web-demo.s3-website-us-east-1.amazonaws.com`.

*Chi tiết cấu hình và hình ảnh nghiệm thu được trình bày tại [MinhChungThucHanh.md](MinhChungThucHanh.md#4-triển-khai-hosting-s3-và-phân-tích-rào-cản-phân-quyền-cloudfront).*

---

[↑ Quay lại đầu trang](#top)
