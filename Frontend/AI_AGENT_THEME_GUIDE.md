# Hướng dẫn AI Agent đồng bộ giao diện theo @theme

## Mục tiêu

Khi được yêu cầu chỉnh sửa giao diện frontend, đưa các trang còn lại về cùng phong cách với `src/views/NhaXuatBan.vue`: đơn giản, nền sáng, chữ rõ ràng, xanh lá làm màu chính và sử dụng utility class được tạo từ `@theme`.

`src/views/NhaXuatBan.vue` là mẫu giao diện tham chiếu. `src/views/DocGia.vue` là mẫu bổ sung cho cách hiển thị danh sách và form.

## Phạm vi

Áp dụng cho các trang trong `src/views/`, đặc biệt:

- `Dashboard.vue`
- `StaffDashboard.vue`
- `Sach.vue`
- `NhanVien.vue`
- `TheLoai.vue`
- `TheoDoiMuonSach.vue`
- `NotFound.vue`

Không tự ý thay đổi giao diện đăng nhập trong `Login.vue`, component dùng chung, API, dữ liệu mẫu hoặc backend nếu yêu cầu chỉ giới hạn ở các trang trên. Nếu có trang mới, áp dụng cùng quy tắc nhưng giữ nguyên mục đích riêng của trang.

## Theme và màu sắc

Đọc `src/assets/main.css` trước khi thêm hoặc sửa màu. Dùng utility class sinh từ `@theme`, ví dụ:

- Màu chính và nút: `bg-primary`, `hover:bg-primary-hover`, `active:bg-primary-active`, `text-btn-text`.
- Nền: `bg-bg-page`, `bg-bg-card`, `bg-bg-input`.
- Chữ: `text-text-main`, `text-text-label`, `text-text-muted`.
- Viền: `border-border-base`, `border-border-input`, `border-border-subtle`.
- Trạng thái: `text-success`, `bg-success-bg`, `text-warning`, `bg-warning-bg`, `text-danger`, `bg-danger-bg`, `text-info`, `bg-info-bg`.
- Bo góc và bóng: `rounded-card`, `rounded-input`, `rounded-btn`, `shadow-card`.
- Font: `font-sans`, `font-mono` khi hiển thị mã.

Không đặt mã màu trực tiếp, không dùng màu Tailwind cố định như `emerald-500`, `slate-100`, `red-600` trong các trang đã chuyển theme, và không tạo token mới nếu token hiện tại đã đáp ứng nhu cầu. Các utility về bố cục, kích thước, căn lề và responsive của Tailwind vẫn được phép.

## Mẫu bố cục

### Trang danh sách / CRUD

- Khung trang: `space-y-6 font-sans text-text-main`.
- Hàng tiêu đề: tiêu đề bên trái, thao tác bên phải; dùng flex responsive để nút không bị tràn trên màn hình nhỏ.
- Nút chính: nền `primary`, chữ `text-btn-text`, có trạng thái hover/active và bo góc `rounded-btn`.
- Tìm kiếm: input và nút nằm trong cùng một `<form role="search">`; trên màn hình nhỏ xếp dọc, trên màn hình rộng nằm cùng hàng. Dùng input có nền `bg-bg-input`, viền `border-border-input` và trạng thái focus theo màu `primary`.
- Bảng: card trắng, viền nhẹ, header nền `bg-bg-page`, hàng có hover nhẹ, bảng có `overflow-x-auto` để hỗ trợ màn hình hẹp.
- Form/modal: nền `bg-bg-card`, input/select/textarea dùng token input, nút submit dùng màu chính; nút hủy là nút phụ.
- Trạng thái rỗng, đang tải, lỗi và badge phải dùng token trạng thái từ theme.

### Dashboard và trang tác vụ

Dùng cùng font, màu chữ, nền, viền, nút và style card như trang tham chiếu. Giữ các số liệu, widget, cảnh báo và thao tác nghiệp vụ đặc thù; không biến dashboard hoặc màn hình mượn-trả thành bảng CRUD nếu không phù hợp.

### Trang đặc biệt

Trang lỗi như `NotFound.vue` có thể giữ bố cục riêng, nhưng nên dùng nền sáng, card, màu chữ và nút theo theme. Không ép trang đăng nhập hoặc trang đặc thù vào bố cục CRUD.

## Quy tắc bảo toàn chức năng

- Chỉ sửa template/class giao diện trong phạm vi yêu cầu; không đổi API, tên trường, validation, quyền truy cập, route hoặc luồng nghiệp vụ.
- Giữ nguyên tìm kiếm và lọc hiện có (lọc trực tiếp khi gõ hay tìm khi submit). Nút tìm kiếm phải nằm cùng form với input và không được tải lại trang.
- Giữ các thao tác thêm/sửa/xóa, phân trang, tải ảnh, mượn-trả và thông báo hiện có.
- Không sao chép nguyên các trường, nhãn nút hoặc dữ liệu của `NhaXuatBan.vue` sang trang khác; chỉ tái sử dụng cách trình bày.
- Tìm và sửa class token sai sau khi thay đổi; không để lại class không được định nghĩa.

## Quy trình và kiểm tra

1. Đọc `NhaXuatBan.vue`, `main.css` và trang đích trước khi sửa.
2. Xác định các phần giao diện tương ứng; giữ nguyên script và business logic nếu không cần thay đổi.
3. Chạy build frontend:

   ```powershell
   Set-Location Frontend
   npm run build
   ```

4. Chạy `git diff --check` từ thư mục gốc và xem lại diff để đảm bảo chỉ có thay đổi đúng phạm vi.

