# Hướng dẫn agent xây dựng giao diện frontend

Tài liệu này mô tả hợp đồng API và quyền truy cập hiện có của backend để agent triển khai giao diện quản lý thư viện. Ưu tiên giữ nguyên quy ước hiện tại của dự án; không tự giả định backend có chức năng hoặc endpoint chưa được liệt kê ở đây.

## 1. Công nghệ và cấu trúc hiện tại

- Frontend dùng Vue 3, Vite, Vue Router và Pinia.
- Dùng `apiService` hiện có để gọi API. Service đặt `baseURL` là `/api` và tự thêm `Authorization: Bearer <token>` khi có token.
- Vite proxy `/api` và `/uploads` tới backend tại `http://localhost:3000`; frontend chạy cổng `3001`.
- Router, store và các service hiện hữu nằm trong `src/router`, `src/stores` và `src/services`. Hãy mở rộng các phần này thay vì tạo cơ chế xác thực/API song song.
- `src/router/index.js` đang dùng `Login.vue` cho `/login`; hãy triển khai màn hình đăng nhập tại view đó và giữ cách điều hướng hiện có.

## 2. Đăng nhập và thông tin phiên

### Đăng nhập

```http
POST /api/auth/login
Content-Type: application/json
```

Body:

```json
{
  "MSNV": "mã nhân viên",
  "PASSWORD": "mật khẩu"
}
```

Thành công trả `200`:

```json
{
  "message": "Đăng nhập thành công.",
  "token": "<JWT>",
  "data": {
    "_id": "...",
    "MSNV": "...",
    "HOTENNV": "...",
    "CHUCVU": "Admin",
    "DIACHI": "...",
    "SODIENTHOAI": "..."
  }
}
```

`CHUCVU` chỉ có thể là `"Admin"` hoặc `"Nhân Viên"`. Mật khẩu không được trả về trong dữ liệu nhân viên. JWT hết hạn sau một ngày.

Lỗi thông tin đăng nhập trả `401` cùng `message`; hãy hiển thị thông báo cho người dùng và không ghi token khi đăng nhập thất bại.

### Khôi phục phiên / đăng xuất

- `GET /api/auth/me` yêu cầu Bearer token; thành công trả `{ message, data }`, trong đó `data` là nhân viên hiện tại và không có `PASSWORD`.
- Store `src/stores/auth.js` đã quản lý token trong `localStorage`, gọi `/auth/me`, và có các getter `isAdmin`, `isLibrarian`, `isAuthenticated`.
- Dùng `auth.logout()` để đăng xuất. Khi gặp `401`, service hiện tại xóa token và chuyển về `/login`.
- Không xem việc ẩn nút trên giao diện là cơ chế bảo mật. Backend mới là nơi quyết định quyền; giao diện cần xử lý rõ phản hồi `401` và `403`.

## 3. Quyền Admin và Nhân viên

| Khu vực / thao tác | Admin | Nhân viên |
|---|---:|---:|
| Đăng nhập, xem hồ sơ hiện tại | Có | Có |
| Dashboard | Có | Có |
| Quản lý sách | Có | Có |
| Quản lý độc giả | Có | Có |
| Quản lý nhà xuất bản | Có | Có |
| Quản lý thể loại | Có | Có |
| Theo dõi mượn, trả, sách trễ hạn | Có | Có |
| Quản lý nhân viên | Có | Không |

Tất cả API dữ liệu ở các nhóm trên yêu cầu đăng nhập. API nhân viên yêu cầu thêm quyền Admin. Router frontend hiện đã đánh dấu `/nhanvien` là `requiresAdmin`; hãy áp dụng cùng quy tắc cho menu, nút điều hướng và các hành động trên giao diện. Người không phải Admin bị chuyển về trang chính khi truy cập route này.

Không có quyền chỉ đọc riêng cho Nhân viên trong backend: cả hai vai trò hiện được phép gọi đầy đủ CRUD trên sách, độc giả, nhà xuất bản, thể loại và phiếu mượn. Tuy nhiên, không nên đưa thao tác xóa toàn bộ dữ liệu thành nút thông thường dù endpoint đó tồn tại.

## 4. Các API nghiệp vụ

Mọi đường dẫn dưới đây có tiền tố `/api`, trừ khi đã ghi đầy đủ. Các nhóm dữ liệu đều yêu cầu đăng nhập.

| Tài nguyên | Endpoint gốc | Quyền |
|---|---|---|
| Nhân viên | `/nhanvien` | Chỉ Admin |
| Độc giả | `/docgia` | Admin và Nhân viên |
| Sách | `/sach` | Admin và Nhân viên |
| Nhà xuất bản | `/nhaxuatban` | Admin và Nhân viên |
| Thể loại | `/theloai` | Admin và Nhân viên |
| Theo dõi mượn sách | `/theodoimuonsach` | Admin và Nhân viên |

Mỗi nhóm CRUD thông thường hỗ trợ:

- `GET /`: lấy danh sách, backend sắp xếp bản ghi mới nhất trước.
- `GET /:id`: lấy một bản ghi theo MongoDB `_id`.
- `POST /`: tạo bản ghi.
- `PUT /:id`: cập nhật bản ghi.
- `DELETE /:id`: xóa một bản ghi.
- `DELETE /`: xóa tất cả bản ghi; đây là thao tác nguy hiểm, không tạo nút thao tác nhanh.

Backend hiện không đọc tham số tìm kiếm, lọc, phân trang hoặc sắp xếp từ query string. Nếu làm tìm kiếm/lọc, thực hiện phía frontend trên dữ liệu đã tải và không mô tả đó là tìm kiếm server-side.

### Trường dữ liệu

Tên trường có phân biệt chữ hoa/thường; gửi và đọc đúng chính tả như dưới đây. Các bản ghi thường có thêm `_id`, `createdAt`, `updatedAt`.

| Tài nguyên | Trường |
|---|---|
| Nhân viên | `MSNV` (mã, bắt buộc, duy nhất), `HOTENNV` (bắt buộc), `PASSWORD` (bắt buộc khi tạo), `CHUCVU` (`Admin` hoặc `Nhân Viên`), `DIACHI` (bắt buộc), `SODIENTHOAI` (bắt buộc, tối đa 10 ký tự) |
| Độc giả | `MADOCGIA` (mã, bắt buộc, duy nhất), `HOLOT`, `TEN`, `NGAYSINH`, `PHAI` (`Nam` hoặc `Nữ`), `DIACHI`, `DIENTHOAI` (tối đa 10 ký tự), `TRANGTHAI` (boolean, mặc định `true`) |
| Sách | `MASACH` (mã, bắt buộc, duy nhất), `TENSACH`, `MATL`, `DONGIA` (số, không âm), `TIENCOC` (số, không âm), `SOQUYEN` (số, không âm), `NAMXUATBAN` (số, không âm), `MANXB`, `NGUONGOC/TACGIA`, `MOTA` (tùy chọn), `HINHAH` (tùy chọn) |
| Nhà xuất bản | `MANXB` (mã, bắt buộc, duy nhất), `TENNXB`, `DIACHI` |
| Thể loại | `MATL` (mã, bắt buộc, duy nhất), `TENTL`, `MOTATL` (tùy chọn) |
| Phiếu mượn | `MADOCGIA`, `MASACH`, `NGAYMUON`, `NGAYHENTRA`, `NGAYTRA` (có thể `null`), `TRANGTHAI` (`Đang Mượn`, `Đã Trả`, `Trễ Hạn`), `TIENPHAT` (số không âm) |

Mã quan hệ trong các bản ghi là chuỗi mã như `MATL`, `MANXB`, `MADOCGIA`, `MASACH`; backend không populate thành đối tượng liên quan. Khi cần hiện tên độc giả/sách/thể loại/NXB trên bảng, ghép với danh sách tương ứng theo mã. Không đổi tên trường `HINHAH` thành `HINHANH` khi gửi API.

## 5. Quy trình mượn và trả sách

### Lấy dữ liệu mượn

- `GET /api/theodoimuonsach/tre-han`: danh sách phiếu đang trễ hạn, chưa trả. Backend cập nhật trạng thái và tiền phạt trước khi trả danh sách.
- `GET /api/theodoimuonsach`: danh sách phiếu mượn.

### Tạo phiếu mượn

```http
POST /api/theodoimuonsach/muon
```

Body cần có:

```json
{
  "MADOCGIA": "mã độc giả",
  "MASACH": "mã sách"
}
```

Backend tự đặt ngày mượn hiện tại, hạn trả sau 14 ngày và trạng thái `Đang Mượn`; giảm tồn kho một quyển. Chỉ độc giả đang hoạt động và sách còn hàng mới được mượn. Một độc giả không thể mượn cùng sách nếu đã có phiếu còn `Đang Mượn` hoặc `Trễ Hạn`.

### Trả sách

```http
PUT /api/theodoimuonsach/:id/tra
```

Backend tự đặt ngày trả, tăng tồn kho và tính phạt `5.000` đồng cho mỗi ngày trễ theo ngày lịch; trả thành công có dạng:

```json
{
  "message": "Trả sách thành công.",
  "SONGAYTRE": 0,
  "TIENPHAT": 0,
  "phieu": {}
}
```

Phiếu đã trả không thể trả lần nữa (`409`). Hãy xác nhận trước thao tác trả và hiển thị số tiền phạt được backend trả về; không tự tính một con số khác để thay thế kết quả API.

## 6. Quy tắc giao diện và xử lý API

- Dùng `CHUCVU` để hiển thị vai trò, và getter trong auth store để kiểm soát giao diện. Nhân viên không thấy mục quản lý nhân viên.
- Dùng form có nhãn tiếng Việt, validate trường bắt buộc và ràng buộc enum/số theo schema. Hiển thị lỗi API từ `response.data.message` khi có.
- Response CRUD không đồng nhất: `GET` danh sách thường trả mảng trực tiếp; `GET/:id` trả đối tượng trực tiếp; `POST`/`PUT` thường trả `{ message, ... }`. Đăng nhập trả `{ message, token, data }`. Mượn/trả có cấu trúc riêng như trên. Không giả định mọi response đều có `data`.
- Mã trùng thường trả `400`; bản ghi không tồn tại trả `404`; lỗi xác thực trả `401`; sai quyền trả `403`; trả phiếu không hợp lệ/trùng xử lý có thể trả `409`.
- Không đưa `PASSWORD` vào bảng, hồ sơ, log giao diện hoặc form sửa nhân viên sau khi tạo. Nếu màn hình tạo nhân viên cần mật khẩu thì chỉ gửi trường này ở yêu cầu tạo.
- Backend chưa có endpoint upload ảnh, báo cáo/thống kê, xuất Excel/PDF, tìm kiếm hoặc phân trang. Không tạo nút UI giả vờ rằng các chức năng này đã được hỗ trợ; ảnh sách chỉ dùng URL/giá trị hiện có nếu có.
- Format ngày/tiền có thể xử lý ở lớp hiển thị; khi gửi ngày lên API, dùng chuỗi ngày ISO phù hợp.
- Các nút xóa cần xác nhận rõ ràng. Tránh gọi `DELETE /` từ giao diện quản trị thông thường.

## 7. Danh sách route frontend hiện có

| Đường dẫn | View | Truy cập |
|---|---|---|
| `/` | Dashboard | Cần đăng nhập |
| `/sach` | Sách | Cần đăng nhập |
| `/docgia` | Độc giả | Cần đăng nhập |
| `/nhanvien` | Nhân viên | Chỉ Admin |
| `/nhaxuatban` | Nhà xuất bản | Cần đăng nhập |
| `/theloai` | Thể loại | Cần đăng nhập |
| `/theodoimuonsach` | Theo dõi mượn sách | Cần đăng nhập |
| `/login` | Đăng nhập | Chuyển về trang chính nếu đã đăng nhập |

Giữ route name/meta và các quy ước trong `src/router/index.js` nhất quán khi bổ sung trang hoặc component. Mọi trang nghiệp vụ hiện thuộc hai vai trò đã đăng nhập; không nhầm điều này với quyền truy cập công khai của độc giả.

## 8. Chạy và kiểm tra frontend

Trong thư mục `Frontend`:

```sh
npm install
npm run dev
npm run build
```

Kiểm tra tối thiểu: đăng nhập với từng vai trò, tải lại trang khi đang đăng nhập, truy cập `/nhanvien` bằng Nhân viên, thao tác dữ liệu nghiệp vụ bằng cả hai vai trò, và hiển thị lỗi API khi token hết hạn hoặc request bị từ chối.
