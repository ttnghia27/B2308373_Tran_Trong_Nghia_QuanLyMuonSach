<template>
  <div class="space-y-6 text-text-main">
    <!-- Header -->
    <div
      class="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <h1 class="text-2xl font-extrabold tracking-tight">Sách</h1>
      <button
        type="button"
        @click="openModal()"
        class="px-4 py-2 rounded-btn bg-primary hover:bg-primary-hover text-btn-text text-xs font-bold flex items-center gap-1.5 transition-colors"
      >
        <i class="fa-solid fa-plus"></i>
        <span>Thêm sách</span>
      </button>
    </div>

    <!-- Search -->
    <form
      @submit.prevent
      class="pb-3 flex flex-col sm:flex-row gap-2"
      role="search"
    >
      <div class="relative flex-1">
        <i
          class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs"
        ></i>
        <input
          v-model.trim="searchKeyword"
          type="search"
          placeholder="Tìm theo tên sách, tác giả, mã sách..."
          :class="[inputClass, 'pl-9 pr-4 placeholder:text-text-muted']"
        />
      </div>
      <button
        type="submit"
        class="p-2 rounded-btn bg-primary hover:bg-primary-hover text-btn-text text-xs font-bold flex items-center justify-center gap-2"
      >
        <i class="fa-solid fa-magnifying-glass"></i>
        <span>Tìm kiếm</span>
      </button>
    </form>

    <!-- Table -->
    <div
      class="bg-bg-card rounded-card border border-border-base shadow-sm overflow-x-auto"
    >
      <table class="w-full text-left text-xs">
        <thead>
          <tr class="uppercase font-sans tracking-wider border-b">
            <th class="py-3 px-3.5">Mã Sách</th>
            <th class="py-3 px-3.5">Bìa Sách</th>
            <th class="py-3 px-3.5">Tên Sách</th>
            <th class="py-3 px-3.5">Tác Giả / Nguồn Gốc</th>
            <th class="py-3 px-3.5">Đơn Giá</th>
            <th class="py-3 px-3.5">Tiền Cọc</th>
            <th class="py-3 px-3.5">Số Quyển</th>
            <th class="py-3 px-3.5 text-right">Tùy Chỉnh</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-border-base">
          <tr
            v-for="book in filteredBooks"
            :key="book._id"
            class="hover:bg-bg-page transition-colors"
          >
            <td class="py-3 px-3.5">{{ book.MASACH }}</td>
            <td class="py-3 px-3.5">
              <div
                class="h-12 w-9 rounded-md bg-bg-input border border-border-base overflow-hidden flex items-center justify-center"
              >
                <img
                  v-if="book.HINHAH || book.HINHANH"
                  :src="book.HINHAH || book.HINHANH"
                  class="h-full w-full object-cover"
                  alt="cover"
                />
                <i v-else class="fa-solid fa-book text-text-muted"></i>
              </div>
            </td>
            <td class="py-3 px-3.5">
              <div class="font-bold">{{ book.TENSACH }}</div>
              <div>Năm xuất bản: {{ book.NAMXUATBAN }}</div>
            </td>
            <td class="py-3 px-3.5">
              {{ book["NGUONGOC/TACGIA"] || book.TACGIA }}
            </td>
            <td class="py-3 px-3.5">{{ formatCurrency(book.DONGIA) }}</td>
            <td class="py-3 px-3.5">
              {{ formatCurrency(book.TIENCOC || book.DONGIA) }}
            </td>
            <td class="py-3 px-3.5">
              {{ book.SOQUYEN > 0 ? book.SOQUYEN : "Hết sách" }}
            </td>
            <td class="py-3 px-3.5 text-right space-x-1.5 whitespace-nowrap">
              <button
                type="button"
                @click="openModal(book)"
                class="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-semibold transition-colors"
                title="Sửa sách"
              >
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button
                v-if="auth.isAdmin"
                type="button"
                @click="handleDelete(book._id)"
                class="px-2.5 py-1.5 rounded-lg bg-danger-bg text-danger hover:opacity-80 font-semibold transition-colors"
                title="Xóa sách (Chỉ Admin)"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>

          <tr v-if="!filteredBooks.length">
            <td colspan="8" class="text-center py-12 text-text-muted">
              {{
                isLoading
                  ? "Đang tải dữ liệu..."
                  : "Không tìm thấy cuốn sách nào phù hợp."
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-text-main/50 p-4 overflow-y-auto"
    >
      <div
        class="w-full max-w-lg rounded-card bg-bg-card p-6 shadow-2xl my-8 space-y-4"
      >
        <div class="flex items-center justify-between pb-3">
          <h3 class="font-bold text-base">
            {{ isEdit ? "Cập Nhật Thông Tin Sách" : "Thêm Sách Mới" }}
          </h3>
          <button
            type="button"
            @click="closeModal"
            class="text-text-muted hover:text-text-main"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-text-label mb-1"
                >MÃ SÁCH</label
              >
              <input
                v-model.trim="form.MASACH"
                :disabled="isEdit"
                required
                :class="[inputClass, 'font-mono uppercase disabled:bg-bg-page']"
              />
            </div>
            <div>
              <label class="block font-bold text-text-label mb-1"
                >TÊN SÁCH</label
              >
              <input v-model.trim="form.TENSACH" required :class="inputClass" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-text-label mb-1"
                >THỂ LOẠI</label
              >
              <select v-model="form.MATL" required :class="inputClass">
                <option
                  v-for="tl in theLoaiList"
                  :key="tl.MATL || tl.MATHELOAI"
                  :value="tl.MATL || tl.MATHELOAI"
                >
                  {{ tl.TENTL || tl.TENTHELOAI }}
                </option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-text-label mb-1"
                >NHÀ XUẤT BẢN</label
              >
              <select v-model="form.MANXB" required :class="inputClass">
                <option
                  v-for="nxb in nxbList"
                  :key="nxb.MANXB"
                  :value="nxb.MANXB"
                >
                  {{ nxb.TENNXB }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-text-label mb-1"
                >TÁC GIẢ / NGUỒN GỐC</label
              >
              <input
                v-model.trim="form['NGUONGOC/TACGIA']"
                required
                :class="inputClass"
              />
            </div>
            <div>
              <label class="block font-bold text-text-label mb-1"
                >NĂM XUẤT BẢN</label
              >
              <input
                v-model.number="form.NAMXUATBAN"
                type="number"
                required
                :class="inputClass"
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block font-bold text-text-label mb-1"
                >ĐƠN GIÁ (VNĐ)</label
              >
              <input
                v-model.number="form.DONGIA"
                type="number"
                min="0"
                required
                :class="inputClass"
              />
            </div>
            <div>
              <label class="block font-bold text-text-label mb-1"
                >TIỀN CỌC (VNĐ)</label
              >
              <input
                v-model.number="form.TIENCOC"
                type="number"
                min="0"
                required
                :class="inputClass"
              />
            </div>
            <div>
              <label class="block font-bold text-text-label mb-1"
                >SỐ QUYỂN TỒN</label
              >
              <input
                v-model.number="form.SOQUYEN"
                type="number"
                min="0"
                required
                :class="inputClass"
              />
            </div>
          </div>

          <div>
            <label for="book-cover" class="block font-bold text-text-label mb-1"
              >ẢNH BÌA SÁCH</label
            >
            <input
              id="book-cover"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              @change="handleImageChange"
              :class="inputClass"
            />
            <p class="mt-1 text-[10px] text-text-muted">
              JPG, PNG hoặc WEBP, tối đa 5 MB.
            </p>
            <img
              v-if="imagePreview"
              :src="imagePreview"
              alt="Xem trước ảnh bìa"
              class="mt-3 h-32 w-24 rounded-lg border border-border-base object-cover"
            />
          </div>

          <div class="flex justify-end gap-3 pt-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 rounded-btn border border-border-base font-semibold text-text-label hover:bg-bg-page transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-5 py-2 rounded-btn bg-primary hover:bg-primary-hover text-btn-text font-bold flex items-center gap-1.5 transition-colors"
            >
              <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin"></i>
              <span>{{ isEdit ? "Lưu Thay Đổi" : "Thêm Vào Kho" }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import sachService from "@/services/sachService";
import theloaiService from "@/services/theloaiService";
import nhaxuatbanService from "@/services/nhaxuatbanService";

const auth = useAuthStore();
const bookList = ref([]);
const theLoaiList = ref([]);
const nxbList = ref([]);
const searchKeyword = ref("");
const isLoading = ref(false);
const isSubmitting = ref(false);

const showModal = ref(false);
const editingId = ref(null);
const isEdit = computed(() => Boolean(editingId.value));

const inputClass =
  "w-full rounded-input border border-border-input bg-bg-input px-3 py-2 text-xs focus:bg-bg-card focus:border-primary outline-none transition-colors";

const emptyForm = () => ({
  MASACH: "",
  TENSACH: "",
  MATL: theLoaiList.value[0]?.MATL || theLoaiList.value[0]?.MATHELOAI || "",
  DONGIA: 0,
  TIENCOC: 0,
  SOQUYEN: 0,
  NAMXUATBAN: new Date().getFullYear(),
  MANXB: nxbList.value[0]?.MANXB || "",
  "NGUONGOC/TACGIA": "",
  HINHAH: "",
});

const form = ref(emptyForm());

// Xử lý ảnh bìa
const selectedImage = ref(null);
const selectedImagePreview = ref("");
const imagePreview = computed(
  () => selectedImagePreview.value || form.value.HINHAH,
);

const clearSelectedImage = () => {
  if (selectedImagePreview.value)
    URL.revokeObjectURL(selectedImagePreview.value);
  selectedImage.value = null;
  selectedImagePreview.value = "";
};

const handleImageChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    e.target.value = "";
    return alert("Ảnh bìa chỉ hỗ trợ định dạng JPG, PNG hoặc WEBP.");
  }
  if (file.size > 5 * 1024 * 1024) {
    e.target.value = "";
    return alert("Ảnh bìa không được vượt quá 5 MB.");
  }

  clearSelectedImage();
  selectedImage.value = file;
  selectedImagePreview.value = URL.createObjectURL(file);
};

const formatCurrency = (val) => `${Number(val || 0).toLocaleString("vi-VN")} đ`;

const filteredBooks = computed(() => {
  const kw = searchKeyword.value.toLowerCase();
  if (!kw) return bookList.value;
  return bookList.value.filter((b) =>
    `${b.MASACH} ${b.TENSACH} ${b["NGUONGOC/TACGIA"] || b.TACGIA || ""}`
      .toLowerCase()
      .includes(kw),
  );
});

const openModal = (book = null) => {
  clearSelectedImage();
  editingId.value = book?._id || null;
  form.value = book
    ? {
        MASACH: book.MASACH || "",
        TENSACH: book.TENSACH || "",
        MATL: book.MATL || "",
        DONGIA: book.DONGIA ?? 0,
        TIENCOC: book.TIENCOC ?? book.DONGIA ?? 0,
        SOQUYEN: book.SOQUYEN ?? 0,
        NAMXUATBAN: book.NAMXUATBAN || new Date().getFullYear(),
        MANXB: book.MANXB || "",
        "NGUONGOC/TACGIA": book["NGUONGOC/TACGIA"] || book.TACGIA || "",
        HINHAH: book.HINHAH || book.HINHANH || "",
      }
    : emptyForm();
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  clearSelectedImage();
};

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [books, tls, nxbs] = await Promise.all([
      sachService.getAllSach(),
      theloaiService.getAllTheLoai(),
      nhaxuatbanService.getAllNhaXuatBan(),
    ]);
    bookList.value = books || [];
    theLoaiList.value = tls || [];
    nxbList.value = nxbs || [];
  } catch (err) {
    console.error("Lỗi khi tải dữ liệu sách:", err);
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const payload = new FormData();
    Object.entries(form.value).forEach(([k, v]) => payload.append(k, v ?? ""));
    if (selectedImage.value) payload.append("cover", selectedImage.value);

    if (isEdit.value) {
      await sachService.updateSach(editingId.value, payload);
    } else {
      await sachService.createSach(payload);
    }
    alert(
      isEdit.value ? "Cập nhật sách thành công!" : "Thêm sách mới thành công!",
    );
    closeModal();
    await fetchData();
  } catch (err) {
    alert(err.response?.data?.message || err.message || "Lỗi lưu sách");
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async (id) => {
  if (!confirm("Bạn có chắc chắn muốn xóa cuốn sách này khỏi kho?")) return;
  try {
    await sachService.deleteSach(id);
    alert("Xóa sách thành công!");
    await fetchData();
  } catch (err) {
    alert(err.response?.data?.message || "Lỗi khi xóa sách");
  }
};

onMounted(fetchData);
onBeforeUnmount(clearSelectedImage);
</script>
