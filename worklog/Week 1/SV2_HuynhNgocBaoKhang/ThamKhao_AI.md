# Nội dung AI tạo ra

- **Công cụ:** Gemini
- **Model:** Gemini 3.8 Flash
---

# 1. Tìm hiểu API Gateway và Lambda: chức năng, cách hoạt động, cách kết nối

### Prompt đã dùng:

> *"Hãy giải thích chi tiết chức năng, cách thức hoạt động của AWS Lambda và Amazon API Gateway (loại HTTP API). Phân tích cơ chế kết nối giữa API Gateway và Lambda."*

### Nội dung AI tạo ra:

> Trong kiến trúc Serverless trên AWS, Amazon API Gateway (HTTP API) và AWS Lambda là cặp đôi kinh điển đóng vai trò tương đương với tầng Web Server/Reverse Proxy (như Nginx) và Application Logic / Controller.
>
> #### 1. Amazon API Gateway (HTTP API)
>
> - **Chức năng chính:** API Gateway hoạt động như "cửa ngõ" đón nhận toàn bộ request từ client (Web, Mobile, Postman, IoT). HTTP API là phiên bản tối ưu thế hệ 2 của API Gateway, được thiết kế nhằm thay thế REST API cho các tác vụ chuẩn:
>   - **Routing & Path Mapping:** Điều hướng request dựa trên URL path và HTTP method (ví dụ: `POST /appointments`, `GET /users/{id}`).
>   - **Cross-Origin Resource Sharing (CORS):** Quản lý cấu hình CORS trực tiếp trên giao diện/config mà không cần can thiệp logic backend.
>   - **Xác thực & Ủy quyền (Authentication/Authorization):** Tích hợp sẵn OAuth 2.0 / OpenID Connect (OIDC) qua JWT Authorizer (hỗ trợ Cognito, Auth0, Firebase) hoặc Lambda Authorizer.
>   - **Tối ưu chi phí & Hiệu năng:** Rẻ hơn tới ~70% và có độ trễ thấp hơn đáng kể so với REST API cũ, lược bỏ các tính năng phức tạp (như SOAP XML transform hay Request Validation qua JSON Schema).
> - **Cách thức hoạt động:**
>   - **Tiếp nhận Request:** Nhận HTTPS request từ internet thông qua public endpoint dạng `https://{api-id}.execute-api.{region}.amazonaws.com/{stage}` (hoặc Custom Domain).
>   - **Khớp Route:** Dò tìm cấu hình Route tương ứng (METHOD + Path). Nếu không khớp, API Gateway tự động phản hồi `404 Not Found`.
>   - **Xử lý tiền kỳ (Pre-processing):** Kiểm tra JWT token (nếu route có Authorizer) và xử lý CORS preflight (OPTIONS).
>   - **Proxy qua Lambda:** Đóng gói toàn bộ thông tin request (headers, query params, path parameters, body, identity context) thành một JSON payload chuẩn (Payload Format version 2.0) rồi chuyển tiếp tới Lambda.
>   - **Xử lý phản hồi (Post-processing):** Nhận JSON phản hồi từ Lambda, giải nén status code, headers, body và gửi trả về cho Client.
>
> #### 2. AWS Lambda
>
> - **Chức năng chính:** AWS Lambda là dịch vụ điện toán không máy chủ (Function-as-a-Service - FaaS):
>   - **Event-Driven Execution:** Mã nguồn chỉ chạy khi có sự kiện kích hoạt (HTTP request, S3 upload, DynamoDB stream, EventBridge cron job).
>   - **Tự động mở rộng (Auto-scaling):** Tự động scale từ 0 lên hàng nghìn instance đồng thời (concurrency) tương ứng với lưu lượng truy cập thực tế.
>   - **Tính tiền theo thời gian chạy:** Bạn chỉ trả tiền cho thời lượng execution (được đo bằng mili-giây) và dung lượng RAM cấu hình, không mất phí khi idle.
>   - **Môi trường cách ly (MicroVM):** Mỗi execution environment chạy trên một Firecracker microVM độc lập, bảo mật và an toàn.
> - **Vòng đời & Cách thức hoạt động nội bộ:**
>   - **Cold Start (Khởi động nguội):** Xảy ra khi một request đến mà chưa có container/MicroVM nào đang rảnh (Download Code/Image $\rightarrow$ Init Runtime $\rightarrow$ Run Init Code ngoài handler $\rightarrow$ Invoke Handler).
>   - **Warm Start (Khởi động ấm):** Các request tiếp theo đến trong khoảng thời gian container chưa bị hủy (~5–15 phút), Lambda tái sử dụng container và chạy thẳng vào handler. Các biến global, kết nối database client (DynamoDB DocumentClient) khởi tạo ở phạm vi ngoài handler sẽ được giữ lại, giúp giảm thiểu độ trễ.
>
> #### 3. Cơ chế bắt tay giữa HTTP API và Lambda
>
> Mô hình chuẩn nhất khi kết hợp hai dịch vụ là cơ chế **Lambda Proxy Integration** (Payload Format Version 2.0):
>
> ```text
> [Client] 
>    │  HTTPS POST /appointments
>    ▼
> [Amazon API Gateway (HTTP API)]
>    │  1. Kiểm tra CORS / JWT Authorizer
>    │  2. Đóng gói request thành JSON event
>    ▼
> [AWS Lambda (Node.js Handler)]
>    │  1. Đọc event.body, event.pathParameters
>    │  2. Business Logic (query DynamoDB, S3, v.v.)
>    │  3. Trả về format { statusCode, body, headers }
>    ▼
> [Amazon API Gateway (HTTP API)]
>    │  Chuyển JSON response thành HTTP status/headers thật
>    ▼
> [Client] (Nhận 200 OK + Data)
> ```
>
> - **Cấu trúc Input Event (API Gateway gửi tới Lambda):**
>   ```json
>   {
>     "version": "2.0",
>     "routeKey": "POST /appointments",
>     "rawPath": "/appointments",
>     "rawQueryString": "filter=today",
>     "headers": {
>       "content-type": "application/json",
>       "authorization": "Bearer eyJhbGciOi..."
>     },
>     "queryStringParameters": {
>       "filter": "today"
>     },
>     "requestContext": {
>       "http": {
>         "method": "POST",
>         "path": "/appointments",
>         "protocol": "HTTP/1.1",
>         "sourceIp": "203.0.113.1"
>       },
>       "authorizer": {
>         "jwt": {
>           "claims": { "sub": "user_123", "email": "khang@example.com" }
>         }
>       }
>     },
>     "body": "{\"patientName\":\"Nguyen Van A\",\"time\":\"10:00\"}",
>     "isBase64Encoded": false
>   }
>   ```
> - **Cấu trúc Output Response (Lambda trả về cho API Gateway):**
>   ```json
>   {
>     "statusCode": 201,
>     "headers": {
>       "Content-Type": "application/json"
>     },
>     "body": "{\"message\":\"Tạo lịch hẹn thành công\",\"id\":\"apt_001\"}"
>   }
>   ```
>
> #### 4. Bảng so sánh: HTTP API vs. REST API
>
>
> | Tiêu chí                | HTTP API                                  | REST API                                    |
> | :------------------------ | :---------------------------------------- | :------------------------------------------ |
> | **Độ trễ (Latency)**   | Thấp hơn đáng kể                     | Cao hơn (do nhiều tầng mapping)          |
> | **Chi phí**              | ~$1.00 / 1 triệu requests                | ~$3.50 / 1 triệu requests                  |
> | **Payload Version**       | Mặc định v2.0 (tinh gọn, phẳng hơn) | v1.0 (phức tạp hơn)                      |
> | **Xác thực tích hợp** | JWT Authorizers natively (OIDC/Cognito)   | IAM, Cognito User Pools, Custom Lambda      |
> | **CORS**                  | Cấu hình bật/tắt chỉ với vài click | Cần setup mock integration / route OPTIONS |
> | **Request Validation**    | Không hỗ trợ (validate trong Lambda)   | Hỗ trợ JSON Schema model                  |

### Hoàn thiện nội dung:

*(Hoàn thiện nội dung đưa vào file `APIGateway_Lambda.md`)*

#### AWS Lambda:

- **Khái niệm:** Là dịch vụ điện toán không máy chủ (Serverless Compute) cho phép thực thi mã nguồn (chạy môi trường Node.js) mà không cần cấu hình, khởi tạo hay quản lý hệ điều hành máy chủ.
- **Đặc điểm & Ưu điểm:**
  - Lambda tự động co giãn (auto-scaling) theo số lượng yêu cầu gọi vào từ người dùng.
  - Tối ưu chi phí: chỉ tính phí theo thời gian chạy thực tế (tính theo mili-giây) và số lượng yêu cầu xử lý, không phát sinh chi phí khi ở trạng thái nhàn rỗi (idle).

#### Amazon API Gateway (HTTP API):

- **Vai trò:** Đóng vai trò làm cổng tiếp nhận (entry point) và định tuyến các yêu cầu HTTP từ phía client (trình duyệt web, ứng dụng di động) đến các dịch vụ xử lý backend như AWS Lambda.
- **Lý do lựa chọn HTTP API:**
  - Giảm độ trễ và tối ưu chi phí hơn so với REST API truyền thống.
  - Hỗ trợ cấu hình CORS (Cross-Origin Resource Sharing) nhanh chóng và trực quan cho các ứng dụng web tĩnh lưu trữ trên Amazon S3.

#### Cơ chế kết nối giữa API Gateway và Lambda:

- **Lambda Proxy Integration:** API Gateway sử dụng cơ chế tích hợp proxy để chuyển tiếp toàn bộ ngữ cảnh yêu cầu.
  - **Phía tiếp nhận (Request):** Khi có HTTP Request gửi đến, API Gateway tự động đóng gói toàn bộ thông tin (HTTP Method, Path, Headers, Body, Query Parameters) thành đối tượng sự kiện (`event`) và chuyển cho hàm handler của Lambda xử lý.
  - **Phía phản hồi (Response):** Sau khi thực thi xong, Lambda trả về kết quả theo định dạng chuẩn gồm `statusCode`, `headers` và `body` dạng chuỗi JSON:
    ```json
    {
      "statusCode": 200,
      "headers": {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      "body": "{\"message\": \"Thành công\"}"
    }
    ```
  - API Gateway tiếp nhận định dạng chuẩn này và chuyển tiếp nguyên vẹn phản hồi HTTP về cho phía client.

---

# 2. Tìm hiểu DynamoDB: cấu trúc bảng, key, CRUD và Conditional Write chống trùng lịch

### Prompt đã dùng:

> *"Hãy giải thích về Amazon DynamoDB, có khác gì so với các DB khác như mysql và t-sql"*

### Nội dung AI tạo ra:

> Amazon DynamoDB là dịch vụ cơ sở dữ liệu NoSQL dạng Key-Value và Document, hoàn toàn Serverless và được AWS quản lý toàn diện (Fully Managed). Điểm đặc trưng lớn nhất của DynamoDB là cung cấp độ trễ ổn định ở mức mili-giây (single-digit millisecond latency) ở mọi quy mô truy cập.
>
> Trước khi so sánh, cần làm rõ một khái niệm:
>
> - **MySQL** là một hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) mã nguồn mở.
> - **T-SQL (Transact-SQL)** là ngôn ngữ mở rộng độc quyền của Microsoft dùng cho Microsoft SQL Server (SQL Server) và Azure SQL Database.
>
> Vì vậy, so sánh DynamoDB với MySQL / T-SQL bản chất là cuộc đối đầu giữa **NoSQL (Key-Value / Document, Serverless)** và **RDBMS truyền thống (Relational Database)**.
>
> #### 1. Các điểm khác biệt cốt lõi
>
> - **Mô hình dữ liệu & Schema:**
>   - *MySQL / SQL Server (T-SQL):* Bắt buộc định nghĩa cấu trúc bảng cố định (Schema-first). Dữ liệu tổ chức thành các dòng (Rows) và cột (Columns). Mối quan hệ giữa các bảng được ràng buộc chặt chẽ thông qua khóa chính (Primary Key) và khóa ngoại (Foreign Key).
>   - *DynamoDB:* Là Schemaless. Mỗi bảng chỉ yêu cầu xác định khóa chính (Partition Key, hoặc kết hợp Partition Key + Sort Key). Mỗi bản ghi (Item) trong cùng một bảng có thể chứa các thuộc tính (Attributes) hoàn toàn khác nhau mà không cần `ALTER TABLE`.
> - **Ngôn ngữ & Cơ chế truy vấn:**
>   - *MySQL / T-SQL:* Sử dụng SQL chuẩn kết hợp các phần mở rộng mạnh mẽ (như Procedure, Function, Trigger, Cursor, CTE, View trong T-SQL). Có thể dễ dàng thực hiện các phép JOIN nhiều bảng, GROUP BY, HAVING hay tính toán phức tạp ngay trên database engine.
>   - *DynamoDB:* Không hỗ trợ JOIN. Truy vấn chủ yếu thông qua API SDK (GetItem, Query, PutItem, BatchWriteItem) hoặc PartiQL. DynamoDB yêu cầu thiết kế mô hình dữ liệu dựa trên cách ứng dụng sẽ đọc dữ liệu (Access Patterns), thường gom nhóm dữ liệu liên quan vào cùng một bảng (Single-Table Design).
> - **Khả năng mở rộng (Scalability):**
>   - *MySQL / SQL Server:* Mở rộng chủ yếu theo chiều dọc (Vertical Scaling - nâng cấp CPU, RAM, SSD). Dù có thể scale theo chiều ngang qua Read Replicas hoặc Sharding thủ công, việc quản lý và đảm bảo tính nhất quán trên nhiều server phân tán rất phức tạp.
>   - *DynamoDB:* Tự động mở rộng theo chiều ngang (Horizontal Scaling). AWS tự động chia nhỏ dữ liệu ra các phân vùng vật lý (Partitions) dựa trên giá trị băm (hash) của Partition Key. Dù bảng có 1.000 bản ghi hay 10 tỷ bản ghi, tốc độ đọc theo Primary Key vẫn giữ nguyên mức 2–5ms.
> - **Quản trị & Hạ tầng (Server Management):**
>   - *MySQL / SQL Server:* Cần quản lý máy chủ (hoặc dùng RDS / Azure SQL), cấu hình dung lượng ổ cứng, connection pool, backup schedule, cập nhật bản vá hệ điều hành/engine.
>   - *DynamoDB:* Hoàn toàn Serverless. Không cần quan tâm máy chủ, RAM hay hệ điều hành. Hỗ trợ hai chế độ thanh toán: On-Demand (tính theo số lượt đọc/ghi thực tế) hoặc Provisioned (đặt trước throughput RCU/WCU).
> - **Tính nhất quán (Data Consistency) & Transaction:**
>   - *MySQL / SQL Server:* Đảm bảo chặt chẽ tính toàn vẹn ACID mặc định với Immediate Consistency và các mức Transaction Isolation.
>   - *DynamoDB:* Mặc định là Eventual Consistency. Hỗ trợ Strongly Consistent Reads và ACID Transactions đa bảng/đa item (thông qua `TransactWriteItems`, `TransactGetItems`).
>
> #### 2. Bảng so sánh tổng hợp
>
>
> | Tiêu chí                       | Amazon DynamoDB                                        | MySQL / SQL Server (T-SQL)                                        |
> | :------------------------------- | :----------------------------------------------------- | :---------------------------------------------------------------- |
> | **Loại DB**                     | NoSQL (Key-Value & Document)                           | Relational (RDBMS)                                                |
> | **Cấu trúc dữ liệu**         | Schema-less (Item, Attribute)                          | Schema cố định (Bảng, Dòng, Cột)                            |
> | **Ngôn ngữ truy vấn**         | API SDK, PartiQL                                       | SQL chuẩn, cú pháp mở rộng (T-SQL)                           |
> | **Quan hệ & JOIN**              | Không hỗ trợ JOIN (dùng Single-Table Design)       | Hỗ trợ JOIN đa bảng mạnh mẽ                                 |
> | **Stored Procedures / Triggers** | Không có (thay bằng DynamoDB Streams + Lambda)      | Hỗ trợ đầy đủ Stored Procedure, Triggers, Functions         |
> | **Mở rộng (Scaling)**          | Mở rộng ngang tự động (Scale-out)                 | Mở rộng dọc (Scale-up là chính)                              |
> | **Độ trễ**                    | Ổn định ở mức single-digit ms ở mọi quy mô     | Thay đổi tùy theo độ phức tạp truy vấn & số lượng JOIN |
> | **Hạ tầng**                    | Serverless 100%, không cần bảo trì hạ tầng       | Phải cấu hình server/cluster (EC2, RDS, on-premise)            |
> | **Môi trường phù hợp**      | Serverless stack (API Gateway + Lambda), Microservices | Ứng dụng truyền thống, ERP, CRM, báo cáo phân tích        |
>
> #### 3. Khi nào nên dùng loại nào?
>
> - **Nên chọn DynamoDB khi:** Xây dựng kiến trúc Serverless / Event-Driven cùng với AWS Lambda và API Gateway; ứng dụng yêu cầu lưu lượng đọc/ghi cực lớn, tải biến động mạnh (User Session, IoT, đơn hàng); các mẫu truy vấn (access patterns) đã được xác định rõ trước khi code; cần TTL để tự hủy bản ghi hết hạn hoặc DynamoDB Streams để kích hoạt trigger tự động.
> - **Nên chọn MySQL hoặc SQL Server (T-SQL) khi:** Dữ liệu có mối quan hệ đa chiều phức tạp, yêu cầu Foreign Key, Constraints nghiêm ngặt; thường xuyên cần báo cáo kinh doanh, truy vấn thống kê động (GROUP BY, aggregation ad-hoc); nghiệp vụ tài chính - kế toán đòi hỏi các logic phức tạp chạy trực tiếp trên database qua Stored Procedure và Trigger.

### Hoàn thiện nội dung:

*(Hoàn thiện đưa vào file `Dynamo.md`)*

- **Amazon DynamoDB:**

  - **Khái niệm:** Là dịch vụ cơ sở dữ liệu NoSQL dạng Key-Value và Document có hiệu năng cao, độ trễ thấp tính bằng mili-giây ở mọi quy mô và khả năng mở rộng tự động.
  - **Cơ chế Schema:** DynamoDB không yêu cầu khai báo schema cố định cho toàn bộ các thuộc tính (Schemaless) mà chỉ cần xác định cấu trúc khóa chính (Primary Key) khi khởi tạo bảng.
- **Cấu trúc bảng và Khóa chính (Primary Key):**

  - **Partition Key (PK):** Dùng để băm (hash) và phân tán dữ liệu đồng đều trên các phân vùng vật lý (partitions) của AWS (ví dụ: `DoctorId`).
  - **Composite Primary Key (PK + Sort Key):**
    - Kết hợp Partition Key và Sort Key (ví dụ: `DoctorId` và `SlotKey`) để tạo thành khóa chính phức hợp duy nhất.
    - Cho phép định danh chính xác từng khung giờ khám của từng bác sĩ cụ thể, đồng thời hỗ trợ truy vấn nhanh danh sách các khung giờ của một bác sĩ.
- **Thao tác CRUD trong hệ thống:**

  - Hệ thống sử dụng AWS SDK (v3) để thực thi các tác vụ:
    - **Scan:** Quét toàn bộ bảng danh sách bác sĩ (`Doctors`) để lấy thông tin hiển thị lên giao diện đặt khám.
    - **PutItem / PutCommand:** Ghi thông tin lịch khám mới vào bảng `Appointments`.
    - **GetItem / GetCommand:** Truy vấn chi tiết thông tin một lịch hẹn hoặc bác sĩ theo khóa chính.
    - **DeleteItem / UpdateItem:** Thực hiện hủy hoặc cập nhật trạng thái phiếu khám (ví dụ: từ `CONFIRMED` sang `CANCELLED`).
- **Cơ chế Conditional Write chống trùng lịch:**

  - **Vai trò:** Đây là tính năng then chốt của bài toán đặt lịch khám trong dự án CareSync nhằm giải quyết tranh chấp ghi đồng thời (race condition).
  - **Cơ chế hoạt động:**
    - Khi người dùng gửi yêu cầu ghi lịch hẹn vào bảng `Appointments`, Lambda gửi lệnh `PutCommand` kèm biểu thức điều kiện (Condition Expression):
      ```sql
      attribute_not_exists(DoctorId) AND attribute_not_exists(SlotKey)
      ```
    - Cơ chế này đảm bảo thao tác ghi mang tính nguyên tử (atomic operation) ở mức cơ sở dữ liệu.
    - **Xử lý xung đột:** Nếu một bệnh nhân khác đã đặt trùng khung giờ (`DoctorId`, `SlotKey`) đó trước đó, DynamoDB sẽ lập tức từ chối thao tác ghi và trả về lỗi `ConditionalCheckFailedException`.
    - Backend Lambda sẽ bắt ngoại lệ này và phản hồi mã trạng thái HTTP `409 Conflict` kèm thông báo lỗi rõ ràng về cho client, ngăn chặn tuyệt đối tình trạng đặt trùng lịch (double-booking).
