# SPECIFICATION & SYSTEM PROMPT CHO AI AGENT: HỆ THỐNG QUẢN LÝ MƯỢN SÁCH (LIBRARY MANAGEMENT SYSTEM)

> **Mục đích tài liệu:** Cung cấp bản đặc tả kiến trúc kỹ thuật, luồng nghiệp vụ và quy chuẩn cài đặt chi tiết để bất kỳ AI Agent nào khi đọc vào cũng có thể tự động triển khai, code và hoàn thiện hệ thống Quản lý mượn sách chuẩn chỉ, không lỗi và đáp ứng 100% yêu cầu đồ án.

---

## 1. TỔNG QUAN HỆ THỐNG & TECH STACK

- **Môn học:** Phát triển ứng dụng Web (CT449 - Đại học Cần Thơ).
- **Backend:** Node.js, Express.js (v5), MongoDB (Mongoose Schema & Models), JWT, Bcryptjs, Multer (upload ảnh).
- **Frontend:** Vue.js 3 (`<script setup>`, Composition API), Vite, Tailwind CSS (v4), Pinia, Vue Router (v4), Axios, Vue-Toastification, FontAwesome 6.
- **Cổng dịch vụ (Ports):**
  - Backend API: `http://localhost:3000`
  - Frontend App: `http://localhost:3001` (đã cấu hình Proxy `/api` và `/uploads` sang port 3000).

---

## 2. PHÂN QUYỀN HỆ THỐNG VỚI CÁC VAI TRÒ & KHÔNG GIAN RIÊNG BIỆT (RBAC)

Hệ thống hỗ trợ 3 nhóm vai trò với không gian làm việc tách biệt rõ ràng:

### 2.1. 👑 Quản trị viên (`CHUCVU: "Admin"`)
- **Trang Dashboard chính:** `/admin` (`AdminDashboard.vue`).
- **Quyền hạn:**
  - Toàn quyền xem thống kê phân tích hệ thống (Analytics Dashboard): Doanh thu, tổng tiền phạt (trễ hạn + hư hại), số sách hư hao, lượng mượn theo tháng, tỷ lệ trả đúng hạn.
  - **Duy nhất Admin có quyền truy cập module Quản lý Nhân sự** (`/admin/nhanvien`): Thêm, sửa thông tin, đặt lại mật khẩu, phân chức vụ, xóa hoặc khóa nhân viên.
  - Toàn quyền xóa các tài nguyên quan trọng (xóa sách vĩnh viễn, xóa độc giả, xóa NXB, thể loại, xóa phiếu mượn).
  - Có thể chuyển đổi sang giao diện quầy trực của Nhân viên để hỗ trợ mượn/trả và duyệt sách khi cần.

### 2.2. 🧑‍💼 Nhân viên / Thủ thư (`CHUCVU: "Nhân Viên"`)
- **Trang Dashboard chính:** `/staff` (`StaffDashboard.vue`).
- **Quyền hạn:**
  - Không gian làm việc tối ưu cho quầy trực (Librarian Desk):
    - **Duyệt yêu cầu mượn sách của độc giả:** Tiếp nhận các yêu cầu mượn trực tuyến ở trạng thái "Chờ duyệt", kiểm tra tồn kho và bấm "Duyệt" (giảm số lượng sách, chuyển sang "Đang mượn") hoặc "Từ chối".
    - **Lập phiếu mượn trực tiếp tại quầy:** Mượn sách nhanh cho độc giả đến quầy.
    - **Trả sách & Thu phạt:** Xác nhận trả sách, tự động tính tiền phạt trễ hạn; kiểm tra tình trạng sách thực tế và **tính thêm tiền phạt nếu độc giả làm hư hại/rách/hỏng/mất sách**.
  - Tra cứu sách, kiểm tra tồn kho, thêm sách mới, cập nhật số lượng sách trong kho (nhưng **không có quyền xóa vĩnh viễn sách**).
  - Quản lý thẻ độc giả: Tạo thẻ mới cho bạn đọc, cập nhật thông tin liên hệ, xem lịch sử mượn (nhưng **không được xóa độc giả**).
  - **BỊ CHẶN HOÀN TOÀN** khỏi trang `/admin/nhanvien` (cả trên giao diện menu, router guard và middleware backend).

### 2.3. 📖 Độc giả / Bạn đọc (`Role: "DocGia"`)
- **Trang chính:** `/reader` hoặc giao diện Portal dành cho độc giả (`ReaderPortal.vue` / `DocGiaDashboard.vue`).
- **Quyền hạn:**
  - **Đăng ký tài khoản trực tuyến:** Độc giả tự đăng ký tài khoản (họ tên, ngày sinh, phái, địa chỉ, số điện thoại, mật khẩu).
  - **Đăng nhập hệ thống:** Đăng nhập an toàn bằng Mã độc giả (hoặc SĐT) và Mật khẩu.
  - **Tra cứu & Tìm kiếm sách:** Xem danh mục sách, thể loại, nhà xuất bản, tình trạng còn/hết sách, tiền cọc quy định.
  - **Gửi yêu cầu mượn sách trực tuyến:** Chọn sách cần mượn, chọn thời hạn mượn (7, 14, 21, 30 ngày) và bấm gửi yêu cầu ➔ Phiếu mượn được tạo ở trạng thái **"Chờ duyệt"**.
  - **Theo dõi lịch sử & Phiếu mượn cá nhân:** Xem danh sách các sách đang chờ duyệt, sách đang mượn, hạn trả sách, sách đã trả, các khoản phạt trễ hạn hoặc phạt do hư hại sách (nếu có).
  - Độc giả bị hạn chế hoàn toàn, không được truy cập vào các không gian quản trị (`/admin`, `/staff`, `/nhanvien`).

---

## 3. CƠ SỞ DỮ LIỆU & DATA MODELS (MONGOOSE SCHEMAS)

### 3.1. Collection `NhanVien` (`app/models/NhanVien.js`)
- `MSNV`: String, unique, required, uppercase, trim.
- `HOTENNV`: String, required, trim.
- `PASSWORD`: String, required (tự động hash bằng bcryptjs).
- `CHUCVU`: String, enum: `["Admin", "Nhân Viên"]`, default: `"Nhân Viên"`.
- `DIACHI`: String, trim.
- `SODIENTHOAI`: String, required, maxlength: 10, trim.
- `TRANGTHAI`: Boolean, default: true (hoạt động/khóa).
- Phương thức `comparePassword(candidatePassword)`.
- `timestamps: true`.

### 3.2. Collection `DOCGIA` (`app/models/DocGia.js`)
- `MADOCGIA`: String, unique, required, uppercase, trim.
- `HOLOT`: String, required, trim.
- `TEN`: String, required, trim.
- `NGAYSINH`: Date, required.
- `PHAI`: String, enum: `["Nam", "Nữ", "Khác"]`, default: `"Nam"`.
- `DIACHI`: String, required, trim.
- `DIENTHOAI`: String, required, maxlength: 10, trim.
- `PASSWORD`: String, required: true (mật khẩu phục vụ độc giả đăng ký/đăng nhập, tự động hash bằng bcryptjs).
- `TRANGTHAI`: String, enum: `["HoatDong", "KhoaThe"]`, default: `"HoatDong"`.
- Phương thức `comparePassword(candidatePassword)`.
- `timestamps: true`.

### 3.3. Collection `NHAXUATBAN` (`app/models/NhaXuatBan.js`)
- `MANXB`: String, unique, required, uppercase, trim.
- `TENNXB`: String, required, trim.
- `DIACHI`: String, trim.
- `timestamps: true`.

### 3.4. Collection `THELOAI` (`app/models/TheLoai.js`)
- `MATL`: String, unique, required, uppercase, trim.
- `TENTL`: String, required, trim.
- `timestamps: true`.

### 3.5. Collection `SACH` (`app/models/Sach.js`)
- `MASACH`: String, unique, required, uppercase, trim.
- `TENSACH`: String, required, trim.
- `MATL`: String, required, uppercase, trim.
- `DONGIA`: Number, required, min: 0.
- `TIENCOC`: Number, min: 0, default: 50000.
- `SOQUYEN`: Number, required, min: 0 (Số quyển tồn kho có thể cho mượn).
- `NAMXUATBAN`: Number, required.
- `MANXB`: String, required, uppercase, trim.
- `NGUONGOC/TACGIA`: String, required, trim.
- `HINHAH` / `HINHANH`: String, default: "" (Đường dẫn tĩnh `/uploads/...`).
- `timestamps: true`.

### 3.6. Collection `THEODOIMUONSACH` (`app/models/TheoDoiMuonSach.js`)
- `MADOCGIA`: String, required, uppercase, trim.
- `MASACH`: String, required, uppercase, trim.
- `MSNV`: String, default: null, trim (Mã nhân viên duyệt / lập phiếu; null khi độc giả tạo yêu cầu trực tuyến).
- `NGAYMUON`: Date, required, default: Date.now.
- `NGAYHENTRA`: Date, required.
- `NGAYTRA`: Date, default: null.
- `TRANGTHAI`: String, required, enum: `["Chờ Duyệt", "Đang Mượn", "Đã Trả", "Trễ Hạn", "Từ Chối"]`, default: `"Đang Mượn"`.
- `TIENCOC`: Number, required, min: 0, default: 0.
- `TIENPHAT`: Number, required, min: 0, default: 0 (Tổng tiền phạt: bao gồm phạt trễ hạn + phạt hư hại sách nếu có).
- `timestamps: true`.

---

## 4. CHI TIẾT NGHIỆP VỤ CỐT LÕI (CORE BUSINESS LOGIC)

### 4.1. Đăng ký & Đăng nhập cho Độc giả (Reader Register & Login)
1. **Đăng ký tài khoản (`POST /api/auth/docgia/register`):**
   - Độc giả điền thông tin: `HOLOT`, `TEN`, `NGAYSINH`, `PHAI`, `DIACHI`, `DIENTHOAI`, `PASSWORD`.
   - Hệ thống tự sinh `MADOCGIA` duy nhất (ví dụ: `DG` + 6 số ngẫu nhiên hoặc timestamp) hoặc cho phép nhập.
   - Kiểm tra `DIENTHOAI` và `MADOCGIA` không được trùng với độc giả đã có.
   - Mã hóa `PASSWORD` bằng bcryptjs trước khi lưu vào MongoDB.
2. **Đăng nhập (`POST /api/auth/docgia/login`):**
   - Độc giả nhập `MADOCGIA` (hoặc `DIENTHOAI`) và `PASSWORD`.
   - Kiểm tra trạng thái thẻ `TRANGTHAI === "KhoaThe"` thì thông báo khóa, không cho đăng nhập.
   - Xác thực mật khẩu qua `comparePassword`. Cấp JWT token kèm thông tin `{ id: docGia._id, role: "DocGia", madocgia: docGia.MADOCGIA }`.
3. **Lấy thông tin tài khoản hiện tại (`GET /api/auth/docgia/me`):**
   - Xác thực qua token, trả về thông tin độc giả (ẩn mật khẩu).

### 4.2. Độc giả Gửi yêu cầu Mượn sách & Quy trình Chờ Duyệt (Borrow Request & Approval Flow)
1. **Độc giả gửi yêu cầu mượn (`POST /api/theodoimuonsach/yeucau`):**
   - Độc giả chọn sách cần mượn (`MASACH`) và số ngày mượn (`SONGAYMUON`: mặc định 14 ngày).
   - Kiểm tra:
     - Thẻ độc giả có đang bị khóa hay không.
     - Độc giả có đang mượn quá số sách quy định (tối đa ví dụ 5 cuốn) hoặc đang nợ sách quá hạn chưa trả không.
     - Sách có tồn tại và còn số quyển khả dụng (`SOQUYEN > 0`) không.
   - Tạo bản ghi phiếu mượn với:
     - `TRANGTHAI = "ChoDuyet"` (Chờ Duyệt).
     - `TIENCOC`: Lấy theo `TIENCOC` của sách (hoặc `DONGIA`).
     - `MSNV = null`.
     - *Lưu ý:* Chưa trừ tồn kho `SOQUYEN` ở bước này (hoặc tạm giữ chỗ nếu nghiệp vụ yêu cầu, nhưng tối ưu nhất là trừ kho chính thức khi duyệt).
2. **Thủ thư / Admin Duyệt yêu cầu (`PUT /api/theodoimuonsach/:id/duyet`):**
   - Kiểm tra lại tồn kho sách `SOQUYEN > 0`.
   - Giảm tồn kho: `await Sach.updateOne({ MASACH }, { $inc: { SOQUYEN: -1 } })`.
   - Cập nhật phiếu mượn:
     - `TRANGTHAI = "DangMuon"` (Đang Mượn).
     - `MSNV`: Mã nhân viên đang đăng nhập thực hiện duyệt.
     - `NGAYMUON = new Date()`.
     - `NGAYHENTRA = new Date(NGAYMUON + SONGAYMUON ngày)`.
3. **Thủ thư / Admin Từ chối yêu cầu (`PUT /api/theodoimuonsach/:id/tuchoi`):**
   - Nhập lý do từ chối `LYDOTUCHOI`.
   - Cập nhật `TRANGTHAI = "TuChoi"`. Không trừ tồn kho sách.

### 4.3. Quy trình Trả sách, Tính phạt Quá hạn & Phạt Hư hại sách (Return & Penalty Flow)
1. **Tiếp nhận trả sách:**
   - Nhân viên mở phiếu mượn đang mượn hoặc trễ hạn.
2. **Tính tiền phạt trễ hạn (nếu có):**
   - `NGAYTRA = new Date()`.
   - Tính số ngày trễ:
     ```javascript
     const diffMs = startOfDay(NGAYTRA) - startOfDay(new Date(phieu.NGAYHENTRA));
     const ngayTre = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
     let tienPhatTre = 0;
     let tichThuCoc = false;
     
     // Quy tắc quá hạn 30 ngày: Tịch thu cọc
     if (ngayTre > 30) {
       tichThuCoc = true;
       tienPhatTre = phieu.TIENCOC > 0 ? phieu.TIENCOC : 100000;
     } else if (ngayTre > 0) {
       tienPhatTre = ngayTre * 5000; // 5.000 VNĐ / ngày trễ
     }
     ```
3. **Tính thêm tiền phạt nếu làm hư hại sách:**
   - Nhân viên kiểm tra sách khi độc giả mang trả.
   - Nếu phát hiện hư hại (rách trang, vẽ bẩn, ướt nước, mất bìa, hỏng bìa hoặc mất hoàn toàn sách):
     - Nhân viên nhập số tiền phạt hư hại: `TIENPHATHUHAI` (ví dụ: hỏng nhẹ 20.000đ - 50.000đ; rách nát / mất sách: phạt 100% - 200% đơn giá sách).
     - Nhân viên ghi rõ lý do vào: `GHICHUHUHAI` (ví dụ: *"Rách trang 15-20, mất gáy sách"*).
4. **Tổng tiền phạt & Hoàn / Giữ tiền cọc:**
   - **Tổng tiền phạt** = `tienPhatTre` + `TIENPHATHUHAI`.
   - So khớp với tiền cọc `TIENCOC`:
     - Nếu `tichThuCoc === true`: Tịch thu toàn bộ cọc + Độc giả nộp thêm `TIENPHATHUHAI` (nếu có).
     - Nếu không tịch thu cọc:
       - Nếu `TongTienPhat <= TIENCOC`: Trừ trực tiếp vào cọc, hoàn trả phần dư `(TIENCOC - TongTienPhat)` cho độc giả.
       - Nếu `TongTienPhat > TIENCOC`: Giữ lại toàn bộ cọc và độc giả phải đóng thêm `(TongTienPhat - TIENCOC)`.
5. **Cập nhật phiếu & Hoàn trả kho sách:**
   - Cập nhật phiếu mượn:
     - `NGAYTRA = new Date()`.
     - `TRANGTHAI = "DaTra"`.
     - `TIENPHAT = tienPhatTre`.
     - `TIENPHATHUHAI = tienPhatHuHai`.
     - `GHICHUHUHAI = ghiChuHuHai`.
   - Hoàn trả 1 quyển vào kho nếu sách còn tái sử dụng được: `await Sach.updateOne({ MASACH }, { $inc: { SOQUYEN: 1 } })`.

---

## 5. BỘ LỌC VÀ TÌM KIẾM (SEARCH & FILTERS SPECIFICATION)

Tất cả các API lấy danh sách (`GET`) và giao diện Frontend tương ứng phải hỗ trợ các bộ lọc sau:

### 5.1. Danh mục Sách (`/api/sach`)
- `keyword`: Tìm kiếm mờ (regex) trên `TENSACH`, `MASACH`, `NGUONGOC/TACGIA`.
- `manxb`: Lọc chính xác theo Nhà xuất bản.
- `matheloai`: Lọc chính xác theo Thể loại.
- `tinhtrang`: `con-sach` (`SOQUYEN > 0`) hoặc `het-sach` (`SOQUYEN = 0`).

### 5.2. Quản lý Mượn Sách (`/api/theodoimuonsach`)
- `madocgia`: Lọc phiếu mượn của 1 độc giả.
- `masach`: Lọc phiếu mượn của 1 cuốn sách.
- `trangthai`: Hỗ trợ đầy đủ các tab:
  - `"ALL"`: Tất cả phiếu.
  - `"ChoDuyet"`: Phiếu độc giả gửi yêu cầu đang chờ thủ thư duyệt.
  - `"DangMuon"`: Phiếu đang trong thời hạn mượn.
  - `"TreHan"`: Phiếu đã quá hạn hẹn trả mà chưa trả.
  - `"DaTra"`: Phiếu đã hoàn tất trả sách.
  - `"TuChoi"`: Phiếu yêu cầu bị từ chối.
- `search`: Tìm kiếm nhanh mã độc giả, tên độc giả, mã sách, tên sách.

### 5.3. Quản lý Độc giả (`/api/docgia`)
- `keyword`: Tìm theo `MADOCGIA`, `TEN`, `HOLOT`, `DIENTHOAI`.

---

## 6. ĐẶC TẢ GIAO DIỆN FRONTEND (UI/UX PAGES)

### 6.1. Trang Quản trị viên: `src/views/Dashboard.vue` (Chỉ Admin)
- Metric Cards: Tổng số sách, số độc giả, số nhân viên, phiếu đang mượn, phiếu chờ duyệt, phiếu quá hạn.
- Doanh thu & Thống kê tài chính: Tổng tiền phạt trễ hạn đã thu, tổng tiền phạt hư hại sách đã thu, số tiền cọc đang giữ.
- Bảng Top sách mượn nhiều nhất & Nhật ký hoạt động gần đây.

### 6.2. Trang Thủ thư / Quầy trực: `src/views/TheoDoiMuonSach.vue`
- **Thanh Tab lọc trạng thái:**
  - `Tất cả` | `Chờ duyệt (Pending)` | `Đang mượn` | `Trễ hạn` | `Đã trả` | `Từ chối`.
  - Có badge số lượng động trên từng tab.
- **Tab Chờ duyệt:**
  - Hiển thị danh sách các yêu cầu mượn trực tuyến của độc giả.
  - Cột thao tác:
    - Nút **"Duyệt"** (màu xanh): Click mở xác nhận ➔ Duyệt mượn, trừ 1 sách trong kho, gán ngày hẹn trả.
    - Nút **"Từ chối"** (màu đỏ): Click mở modal nhập lý do từ chối và hủy yêu cầu.
- **Modal Lập phiếu mượn trực tiếp tại quầy:** Nhập Mã độc giả, Mã sách, chọn thời hạn mượn ➔ Bấm xác nhận cho mượn.
- **Modal Xác nhận Trả sách (Kèm phạt hư hại sách):**
  - Hiển thị thông tin sách, độc giả, tiền cọc, số ngày trễ hạn và tiền phạt quá hạn tự động.
  - **Mục "Kiểm tra tình trạng sách":**
    - Checkbox: "Sách bình thường / nguyên vẹn" vs "Sách bị hư hại / rách / mất".
    - Khi tích chọn hư hại: Hiện ô nhập **Số tiền phạt hư hại sách (VNĐ)** và **Ghi chú lý do hư hại**.
    - Tự động cộng tổng: `Tổng tiền phạt = Phạt trễ hạn + Phạt hư hại`.
    - Tính toán hiển thị số tiền hoàn lại cho độc giả hoặc số tiền độc giả phải nộp thêm.

### 6.3. Không gian dành cho Độc giả:
- **Trang Đăng ký Độc giả (`Register.vue`):** Form đăng ký tài khoản với các trường thông tin đầy đủ, kiểm tra dữ liệu hợp lệ trước khi submit.
- **Trang Đăng nhập Độc giả (`Login.vue`):** Có tab chuyển đổi giữa "Nhân viên / Thủ thư" và "Độc giả" (hoặc màn hình đăng nhập thân thiện).
- **Trang Portal / Tra cứu & Mượn sách của Độc giả (`ReaderPortal.vue` / `Sach.vue`):**
  - Xem danh mục sách dạng lưới / thẻ kèm ảnh bìa, tác giả, thể loại, tình trạng còn sách.
  - Nút **"Mượn sách"**: Độc giả click vào sách muốn mượn ➔ Chọn thời hạn mượn (7, 14, 21 ngày) ➔ Xác nhận gửi yêu cầu.
- **Trang Lịch sử & Theo dõi mượn của Độc giả (`ReaderHistory.vue` / `MyLoans.vue`):**
  - Xem các phiếu đang chờ duyệt, phiếu đang mượn, ngày hẹn trả.
  - Cảnh báo rõ ràng nếu phiếu sắp đến hạn hoặc đang quá hạn.
  - Xem chi tiết các khoản phạt: Phạt trễ hạn & Phạt do làm hư hại sách (kèm lý do ghi chú của thủ thư) để minh bạch tài chính.

### 6.4. Trang Quản trị Nhân sự: `src/views/NhanVien.vue` (Chỉ Admin)
- Bảng danh sách nhân viên, avatar, MSNV, Họ tên, Chức vụ (Admin / Nhân Viên), SĐT.
- Thêm nhân viên mới / Sửa thông tin / Đặt lại mật khẩu.
- Chặn không cho xóa tài khoản của chính mình hoặc tài khoản Admin duy nhất.

### 6.5. Trang Quản lý Sách: `src/views/Sach.vue`
- Bảng sách kèm hình ảnh thumbnail bìa sách.
- Modal Thêm/Sửa sách: Chọn ảnh bìa preview trực tiếp.
- Nút Xóa chỉ hiển thị với Admin (`v-if="auth.isAdmin"`).

---

## 7. CẤU HÌNH ROUTER GUARD & PINIA AUTH STORE

### 7.1. Pinia Store (`src/stores/auth.js`)
Lưu trữ đồng thời trạng thái đăng nhập cho cả Nhân viên và Độc giả:
- `user`: Thông tin người dùng hiện tại (Nhân viên hoặc Độc giả).
- `role`: `"Admin"` | `"Nhân Viên"` | `"DocGia"`.
- `token`: Lưu tại `localStorage`.
- Getters: `isAuthenticated`, `isAdmin`, `isStaff`, `isDocGia`.
- Actions: `loginStaff()`, `loginDocGia()`, `registerDocGia()`, `logout()`, `fetchCurrentUser()`.

### 7.2. Navigation Guard (`src/router/index.js`)
- Nếu chưa đăng nhập mà vào trang yêu cầu `requiresAuth` ➔ Chuyển về trang `Login`.
- Nếu là `DocGia` cố vào các trang của thư viện/admin (`/admin`, `/theodoimuonsach`, `/nhanvien`) ➔ Chuyển hướng về trang Portal của độc giả (`/reader` hoặc `/sach`).
- Nếu là `Nhân Viên` cố vào trang Admin (`/admin`, `/nhanvien`) ➔ Chuyển hướng về `/theodoimuonsach` hoặc `/staff`.
- Nếu là `Admin` ➔ Toàn quyền truy cập mọi tính năng.

---

## 8. BẢO VỆ PHÍA BACKEND (SECURITY & MIDDLEWARES)

Cần cấu hình middleware xác thực và phân quyền trong `Backend/app/controllers/authController.js` và `routes/`:
- `authenticate`: Xác thực JWT token, nhận diện người dùng là Nhân viên hay Độc giả.
- `authorizeAdmin`: Chỉ cho phép tài khoản nhân viên có `CHUCVU === "Admin"`.
- `authorizeAdminOrStaff`: Cho phép Admin và Nhân viên quầy trực.
- `authorizeDocGia`: Cho phép độc giả thực hiện các hành động cá nhân (gửi yêu cầu mượn, xem phiếu mượn của chính mình).

---

## 9. QUY TRÌNH KIỂM THỬ HOÀN THIỆN (DEFINITION OF DONE)

Một AI Agent sau khi hoàn thành phải đảm bảo kiểm tra đạt các tiêu chí sau:
1. `npm run build` ở thư mục `Frontend` thành công không có bất kỳ lỗi cú pháp nào.
2. **Độc giả:**
   - Đăng ký tài khoản độc giả mới thành công và có thể đăng nhập được ngay.
   - Chọn sách và gửi yêu cầu mượn ➔ Tạo phiếu mượn ở trạng thái "Chờ duyệt" (`ChoDuyet`).
   - Độc giả theo dõi được danh sách mượn và lịch sử phạt của mình.
3. **Thủ thư / Admin duyệt mượn:**
   - Trong danh sách mượn sách xuất hiện tab "Chờ duyệt" có phiếu của độc giả.
   - Bấm "Duyệt" ➔ Phiếu chuyển sang "Đang mượn", kho sách tự động giảm 1 quyển.
   - Hoặc bấm "Từ chối" ➔ Phiếu chuyển sang "Từ chối", kho sách không bị giảm.
4. **Trả sách & Phạt hư hại:**
   - Trả sách quá hạn ➔ Tự động tính đúng tiền phạt theo số ngày trễ (hoặc tịch thu cọc nếu quá 30 ngày).
   - Nhập tiền phạt hư hại sách (ví dụ: làm rách sách phạt 30.000đ, kèm ghi chú lý do) ➔ Lưu chính xác vào `TIENPHATHUHAI` và `GHICHUHUHAI`.
   - Tổng tiền phạt = Phạt trễ hạn + Phạt hư hại. Tiền cọc được trừ và hoàn trả chính xác.
   - Sách được hoàn lại vào kho (`SOQUYEN += 1`).
5. **Phân quyền chặt chẽ:** Admin có toàn quyền xem Dashboard và Nhân viên; Thủ thư quản lý mượn trả và sách; Độc giả chỉ thao tác trên không gian tra cứu và mượn sách cá nhân.
