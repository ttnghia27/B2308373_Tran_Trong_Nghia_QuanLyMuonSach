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

## 2. PHÂN QUYỀN 2 VAI TRÒ VỚI 2 KHÔNG GIAN RIÊNG BIỆT (RBAC)

Hệ thống có 2 nhóm quyền tài khoản (Lưu tại trường `CHUCVU` trong Collection `NhanVien`):

### 2.1. 👑 Quản trị viên (`CHUCVU: "Admin"`)
- **Trang Dashboard chính:** `/admin` (`AdminDashboard.vue`).
- **Quyền hạn:**
  - Toàn quyền xem thống kê phân tích hệ thống (Analytics Dashboard): Doanh thu/tiền phạt, số sách hư hao, lượng mượn theo tháng, tỷ lệ trả đúng hạn.
  - **Duy nhất Admin có quyền truy cập module Nhân sự** (`/admin/nhanvien`): Thêm, sửa thông tin, đặt lại mật khẩu, phân chức vụ, xóa hoặc khóa nhân viên.
  - Toàn quyền xóa các tài nguyên quan trọng (xóa sách vĩnh viễn, xóa độc giả, xóa NXB, thể loại).
  - Có thể chuyển sang giao diện của Nhân viên để hỗ trợ mượn/trả sách khi cần.

### 2.2. 🧑‍💼 Nhân viên / Thủ thư (`CHUCVU: "Nhân Viên"`)
- **Trang Dashboard chính:** `/staff` (`StaffDashboard.vue`).
- **Quyền hạn:**
  - Không gian làm việc tối ưu cho quầy trực (Librarian Desk POS): Mượn sách nhanh, trả sách 1-click, thu tiền phạt trễ hạn.
  - Tra cứu sách, kiểm tra tồn kho, thêm sách mới, cập nhật số lượng sách trong kho (nhưng **không có quyền xóa vĩnh viễn sách**).
  - Quản lý thẻ độc giả: Tạo thẻ mới cho bạn đọc, cập nhật thông tin liên hệ, xem lịch sử mượn (nhưng **không được xóa độc giả**).
  - **BỊ CHẶN HOÀN TOÀN** khỏi trang `/admin/nhanvien` (cả trên giao diện menu, router guard và middleware backend).

---

## 3. CƠ SỞ DỮ LIỆU & DATA MODELS (MONGOOSE SCHEMAS)

### 3.1. Collection `NhanVien` (`app/models/NhanVien.js`)
- `MSNV`: String, unique, required, uppercase, trim.
- `HOTENNV`: String, required, trim.
- `PASSWORD`: String, required (được tự động hash bằng bcrypt).
- `CHUCVU`: String, enum: `["Admin", "Nhân Viên"]`, default: `"Nhân Viên"`.
- `DIACHI`: String, trim.
- `SODIENTHOAI`: String, trim.
- `TRANGTHAI`: Boolean, default: true (hoạt động/khóa).
- `timestamps: true`.

### 3.2. Collection `DOCGIA` (`app/models/DocGia.js`)
- `MADOCGIA`: String, unique, required, uppercase, trim.
- `HOLOT`: String, required, trim.
- `TEN`: String, required, trim.
- `NGAYSINH`: Date, required.
- `PHAI`: String, enum: `["Nam", "Nữ", "Khác"]`, default: `"Nam"`.
- `DIACHI`: String, required, trim.
- `DIENTHOAI`: String, required, trim.
- `PASSWORD`: String, default: null (phục vụ độc giả tra cứu trực tuyến nếu có).
- `TRANGTHAI`: String, enum: `["HoatDong", "KhoaThe"]`, default: `"HoatDong"`.
- `timestamps: true`.

### 3.3. Collection `NHAXUATBAN` (`app/models/NhaXuatBan.js`)
- `MANXB`: String, unique, required, uppercase, trim.
- `TENNXB`: String, required, trim.
- `DIACHI`: String, trim.
- `timestamps: true`.

### 3.4. Collection `THELOAI` (`app/models/TheLoai.js`)
- `MATHELOAI`: String, unique, required, uppercase, trim.
- `TENTHELOAI`: String, required, trim.
- `MOTA`: String, default: "".
- `timestamps: true`.

### 3.5. Collection `SACH` (`app/models/Sach.js`)
- `MASACH`: String, unique, required, uppercase, trim.
- `TENSACH`: String, required, trim.
- `DONGIA`: Number, required, min: 0.
- `SOQUYEN`: Number, required, min: 0 (Số quyển tồn kho có thể cho mượn).
- `NAMXUATBAN`: Number, required.
- `MANXB`: String, required, uppercase, trim.
- `MATHELOAI`: String, uppercase, trim (tùy chọn hoặc liên kết Thể loại).
- `NGUONGOC/TACGIA`: String, required, trim (kèm Virtual alias `TACGIA`).
- `HINHANH`: String, default: "" (Đường dẫn tĩnh `/uploads/...`).
- `timestamps: true`.

### 3.6. Collection `THEODOIMUONSACH` (`app/models/TheoDoiMuonSach.js`)
- `MADOCGIA`: String, required, uppercase, trim.
- `MASACH`: String, required, uppercase, trim.
- `MSNV`: String, required (Mã nhân viên lập phiếu mượn).
- `NGAYMUON`: Date, required, default: Date.now.
- `HANTRA`: Date, required (Mặc định: `NGAYMUON + 14 ngày`).
- `NGAYTRA`: Date, default: null.
- `TIENPHAT`: Number, default: 0 (Đơn giá phạt mặc định: 5.000 VNĐ/ngày trễ hạn).
- `TRANGTHAI_PHAT`: String, enum: `["KhongPhat", "ChuaNop", "DaNop"]`, default: `"KhongPhat"`.
- `TRANGTHAI`: String, enum: `["DangMuon", "DaTra", "QuaHan"]`, default: `"DangMuon"`.
- `timestamps: true`.

---

## 4. CHI TIẾT NGHIỆP VỤ CỐT LÕI (CORE BUSINESS LOGIC)

### 4.1. Quy trình Mượn sách (Borrow Flow)
1. **Tiếp nhận:** Nhân viên nhập `MADOCGIA` và `MASACH` (hoặc quét mã vạch).
2. **Kiểm tra hợp lệ:**
   - Độc giả có tồn tại không? Trạng thái thẻ có bị khóa hoặc đang nợ tiền phạt chưa nộp không?
   - Số sách độc giả đang mượn có vượt quá giới hạn không (tối đa ví dụ 5 cuốn)?
   - Sách có tồn tại không? `SOQUYEN` trong kho có `> 0` không?
3. **Thực thi:**
   - Giảm tồn kho: `sach.SOQUYEN -= 1; await sach.save();`
   - Tạo phiếu mượn: `HANTRA = NGAYMUON + 14 ngày`, `TRANGTHAI = "DangMuon"`.
4. **Phản hồi:** Trả về chi tiết phiếu mượn kèm thông tin sách và độc giả.

### 4.2. Quy trình Trả sách & Tính phạt tự động (Return & Penalty Flow)
1. **Tiếp nhận:** Chọn phiếu mượn hoặc quét mã phiếu/sách để trả.
2. **Xử lý ngày tháng & Tính phạt trễ hạn:**
   - Ngày trả thực tế: `NGAYTRA = new Date()`.
   - Tính chênh lệch:
     ```javascript
     const diffTime = new Date(NGAYTRA) - new Date(HANTRA);
     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
     if (diffDays > 0) {
       TIENPHAT = diffDays * 5000; // 5.000 VNĐ / ngày trễ
       TRANGTHAI_PHAT = "ChuaNop"; // hoặc "DaNop" nếu thu tiền ngay tại quầy
     } else {
       TIENPHAT = 0;
       TRANGTHAI_PHAT = "KhongPhat";
     }
     ```
3. **Hoàn trả kho:** Tăng tồn kho `sach.SOQUYEN += 1; await sach.save();`
4. **Cập nhật phiếu:** Chuyển `TRANGTHAI = "DaTra"`.

### 4.3. Quản lý Thu tiền phạt (Penalty Settlement)
- Endpoint: `PUT /api/muonsach/:id/thupat`
- Cho phép nhân viên cập nhật `TRANGTHAI_PHAT = "DaNop"` khi độc giả đã thanh toán xong tiền phạt.

---

## 5. BỘ LỌC VÀ TÌM KIẾM (SEARCH & FILTERS SPECIFICATION)

Tất cả các API lấy danh sách (`GET`) và giao diện Frontend tương ứng phải hỗ trợ các bộ lọc sau:

### 5.1. Danh mục Sách (`/api/sach`)
- `keyword`: Tìm kiếm mờ (regex) trên `TENSACH`, `MASACH`, `NGUONGOC/TACGIA`.
- `manxb`: Lọc chính xác theo Nhà xuất bản.
- `matheloai`: Lọc chính xác theo Thể loại.
- `tinhtrang`: `con-sach` (`SOQUYEN > 0`) hoặc `het-sach` (`SOQUYEN = 0`).

### 5.2. Quản lý Mượn Sách (`/api/muonsach`)
- `madocgia`: Lọc phiếu mượn của 1 độc giả.
- `masach`: Lọc phiếu mượn của 1 cuốn sách.
- `trangthai`: `"DangMuon"`, `"DaTra"`, `"QuaHan"`.
- `quahan`: Boolean `true` để lấy ngay danh sách các phiếu quá hạn mà chưa trả.
- `chuanopphat`: Boolean `true` để lấy danh sách phiếu có `TRANGTHAI_PHAT == "ChuaNop"`.

### 5.3. Độc giả (`/api/docgia`)
- `keyword`: Tìm theo `MADOCGIA`, `TEN`, `HOLOT`, `DIENTHOAI`.

---

## 6. ĐẶC TẢ GIAO DIỆN FRONTEND (UI/UX PAGES)

### 6.1. Trang 1: `src/views/admin/AdminDashboard.vue` (Chỉ Admin)
- **Khu vực Thống kê (Metric Cards):**
  - Tổng số đầu sách & Tổng số quyển trong kho.
  - Số lượng độc giả đang hoạt động.
  - Số nhân viên thư viện.
  - Số phiếu đang mượn & Số phiếu đang quá hạn cảnh báo đỏ.
  - Tổng số tiền phạt đã thu & tiền phạt còn nợ.
- **Biểu đồ / Danh sách giám sát:**
  - Bảng top 5 cuốn sách được mượn nhiều nhất.
  - Nhật ký các hoạt động mượn/trả gần nhất của nhân viên trong ngày.

### 6.2. Trang 2: `src/views/staff/StaffDashboard.vue` (Dành cho Nhân viên)
- **Bàn làm việc Quầy trực (Librarian Desk):**
  - **Widget 1: Form Mượn sách Nhanh:** Nhập Mã độc giả + Mã sách ➔ Nút "Mượn sách". Tự động hiển thị tên độc giả và tên sách để nhân viên xác nhận trước khi lưu.
  - **Widget 2: Quét/Nhập Trả sách Nhanh:** Nhập mã phiếu/mã sách ➔ Tự động tính số ngày trễ, hiện số tiền phạt nếu có ➔ Nút "Xác nhận trả & Thu tiền".
  - **Widget 3: Danh sách Cảnh báo Quá hạn:** Bảng danh sách các phiếu mượn quá hạn kèm số điện thoại độc giả để nhân viên gọi điện nhắc nhở.

### 6.3. Trang Quản trị Nhân sự: `src/views/admin/NhanVienManager.vue` (Chỉ Admin)
- Bảng danh sách nhân viên, avatar, MSNV, Họ tên, Chức vụ (Admin / Nhân Viên), SĐT.
- Modal Thêm nhân viên mới / Sửa thông tin / Đặt lại mật khẩu.
- Nút khóa / kích hoạt tài khoản.
- Chặn không cho xóa tài khoản của chính mình hoặc tài khoản Admin duy nhất.

### 6.4. Trang Quản lý Sách: `src/views/SachManager.vue`
- Bảng sách kèm hình ảnh thumbnail bìa sách (`/uploads/...`).
- Ô tìm kiếm từ khóa + Dropdown lọc Thể loại + Lọc NXB.
- Modal Thêm/Sửa sách: Có trường chọn file ảnh bìa (preview ảnh trước khi upload).
- Cột thao tác: Sửa, Xóa (Nút Xóa chỉ hiển thị với Admin: `v-if="auth.isAdmin"`).

### 6.5. Trang Mượn - Trả: `src/views/MuonSachManager.vue`
- Bộ lọc Tabs: `Tất cả` | `Đang mượn` | `Quá hạn` | `Đã trả`.
- Badge màu trạng thái: Xanh lá (Đã trả), Vàng (Đang mượn), Đỏ (Quá hạn).
- Nút "Trả sách" mở modal xác nhận hiển thị tiền phạt nếu quá hạn.

---

## 7. CẤU HÌNH ROUTER GUARD (VUE ROUTER)

Tệp `src/router/index.js` phải cài đặt Navigation Guard:

```javascript
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/",
    redirect: () => {
      const auth = useAuthStore();
      if (!auth.isAuthenticated) return "/login";
      return auth.isAdmin ? "/admin" : "/staff";
    },
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
  },
  // ADMIN ROUTES
  {
    path: "/admin",
    name: "AdminDashboard",
    component: () => import("@/views/admin/AdminDashboard.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/nhanvien",
    name: "NhanVienManager",
    component: () => import("@/views/admin/NhanVienManager.vue"),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  // STAFF ROUTES
  {
    path: "/staff",
    name: "StaffDashboard",
    component: () => import("@/views/staff/StaffDashboard.vue"),
    meta: { requiresAuth: true },
  },
  // MODULES CHUNG
  {
    path: "/sach",
    name: "SachManager",
    component: () => import("@/views/SachManager.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/docgia",
    name: "DocGiaManager",
    component: () => import("@/views/DocGiaManager.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/muonsach",
    name: "MuonSachManager",
    component: () => import("@/views/MuonSachManager.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
  const auth = useAuthStore();

  if (auth.token && !auth.isNhanVienLoaded) {
    try {
      await auth.fetchCurrentNhanVien();
    } catch {
      auth.logout();
    }
  }

  // 1. Chưa đăng nhập
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: "Login", query: { redirect: to.fullPath } };
  }

  // 2. Đã đăng nhập nhưng vào trang Login
  if (to.name === "Login" && auth.isAuthenticated) {
    return auth.isAdmin ? { name: "AdminDashboard" } : { name: "StaffDashboard" };
  }

  // 3. Nhân viên cố vào route của Admin -> Điều hướng về /staff
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: "StaffDashboard" };
  }

  return true;
});

export default router;
```

---

## 8. BẢO VỆ PHÍA BACKEND (SECURITY & MIDDLEWARES)

Cần gắn middleware xác thực và phân quyền trong `Backend/app/routes/`:
- `authenticate`: Xác thực token hợp lệ.
- `authorizeAdmin`: Chỉ cho phép nhân viên có `CHUCVU === "Admin"` thực hiện (`POST`, `PUT`, `DELETE` trên `/api/nhanvien`, `DELETE` trên `/api/sach`).
- `authorizeAdminOrStaff`: Cả 2 quyền đều được thực hiện thao tác nghiệp vụ mượn/trả.

---

## 9. QUY TRÌNH KIỂM THỬ HOÀN THIỆN (DEFINITION OF DONE)

Một AI Agent sau khi hoàn thành phải đảm bảo kiểm tra đạt các tiêu chí sau:
1. `npm run build` ở thư mục `Frontend` thành công không có lỗi cú pháp hay import.
2. Đăng nhập tài khoản Admin (`ADMIN001` / `admin123`) ➔ Tự động chuyển hướng vào `/admin`, thấy đầy đủ menu Quản lý Nhân viên.
3. Đăng nhập tài khoản Nhân viên thường ➔ Tự động chuyển hướng vào `/staff`, menu không có Quản lý nhân viên, nếu cố gõ URL `/admin` sẽ bị chặn chuyển về `/staff`.
4. Thực hiện mượn 1 cuốn sách: Số lượng tồn kho giảm 1.
5. Thực hiện trả sách sau ngày hạn trả: Hệ thống tự động tính ra số ngày trễ và hiển thị đúng số tiền phạt.
6. Tìm kiếm sách theo từ khóa và lọc theo Thể loại / NXB hoạt động mượt mà.
