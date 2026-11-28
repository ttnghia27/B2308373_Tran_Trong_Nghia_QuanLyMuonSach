<template>
  <div class="space-y-6 text-text-main">
    <!-- Header -->
    <div
      class="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <h1 class="text-2xl font-extrabold tracking-tight">Độc giả</h1>
      <button
        type="button"
        @click="openModal()"
        class="px-4 py-2 rounded-btn bg-primary hover:bg-primary-hover text-btn-text text-xs font-bold flex items-center gap-1.5"
      >
        <i class="fa-solid fa-plus"></i>
        <span>Thêm độc giả</span>
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
          placeholder="Tìm theo Mã độc giả, Họ tên, SĐT..."
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
            <th class="py-3 px-3.5">Mã Độc Giả</th>
            <th class="py-3 px-3.5">Họ và Tên</th>
            <th class="py-3 px-3.5">Phái</th>
            <th class="py-3 px-3.5">Ngày Sinh</th>
            <th class="py-3 px-3.5">Địa Chỉ</th>
            <th class="py-3 px-3.5 text-right">Tùy chỉnh</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-border-base">
          <tr v-for="dg in filteredList" :key="dg._id" class="hover:bg-bg-page">
            <td class="py-3 px-3.5">{{ dg.MADOCGIA }}</td>
            <td class="py-3 px-3.5">
              <div class="font-bold">{{ dg.HOLOT }} {{ dg.TEN }}</div>
              <div>SĐT: {{ dg.DIENTHOAI }}</div>
            </td>
            <td class="py-3 px-3.5">{{ dg.PHAI || "Nam" }}</td>
            <td class="py-3 px-3.5">{{ formatDate(dg.NGAYSINH) }}</td>
            <td class="py-3 px-3.5" :title="dg.DIACHI">{{ dg.DIACHI }}</td>
            <td class="py-3 px-3.5 text-right space-x-1.5 whitespace-nowrap">
              <button
                type="button"
                @click="openModal(dg)"
                class="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-semibold"
                title="Sửa thông tin"
              >
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button
                v-if="auth.isAdmin"
                type="button"
                @click="handleDelete(dg._id)"
                class="px-2.5 py-1.5 rounded-lg bg-danger-bg text-danger hover:bg-danger-hover-bg font-semibold"
                title="Xóa độc giả (Chỉ Admin)"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>

          <tr v-if="!filteredList.length">
            <td colspan="6" class="text-center py-12 text-text-muted">
              {{
                isLoading
                  ? "Đang tải dữ liệu..."
                  : "Không tìm thấy hồ sơ độc giả nào."
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
        class="w-full max-w-md rounded-card bg-bg-card p-6 shadow-2xl space-y-4"
      >
        <div class="flex items-center justify-between pb-3">
          <h3 class="font-bold text-base">
            {{ isEdit ? "Cập Nhật Hồ Sơ Độc Giả" : "Cấp Thẻ Độc Giả Mới" }}
          </h3>
          <button
            type="button"
            @click="showModal = false"
            class="text-text-muted hover:text-text-main"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-text-label mb-1"
              >MÃ ĐỘC GIẢ</label
            >
            <input
              v-model.trim="form.MADOCGIA"
              :disabled="isEdit"
              required
              :class="[inputClass, 'uppercase disabled:bg-bg-page']"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-text-label mb-1">HỌ LÓT</label>
              <input v-model.trim="form.HOLOT" required :class="inputClass" />
            </div>
            <div>
              <label class="block font-bold text-text-label mb-1">TÊN</label>
              <input v-model.trim="form.TEN" required :class="inputClass" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-text-label mb-1">PHÁI</label>
              <select v-model="form.PHAI" :class="inputClass">
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-text-label mb-1"
                >NGÀY SINH</label
              >
              <input
                v-model="form.NGAYSINH"
                type="date"
                required
                :class="inputClass"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-text-label mb-1"
              >SỐ ĐIỆN THOẠI</label
            >
            <input
              v-model.trim="form.DIENTHOAI"
              type="tel"
              required
              :class="inputClass"
            />
          </div>

          <div>
            <label class="block font-bold text-text-label mb-1">ĐỊA CHỈ</label>
            <input v-model.trim="form.DIACHI" required :class="inputClass" />
          </div>

          <div class="flex justify-end gap-3 pt-3">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 rounded-btn border border-border-base font-semibold text-text-label hover:bg-bg-page"
            >
              Hủy
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-5 py-2 rounded-btn bg-primary hover:bg-primary-hover text-btn-text font-bold flex items-center gap-1.5"
            >
              <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin"></i>
              <span>{{ isEdit ? "Lưu Thay Đổi" : "Cấp Thẻ Mới" }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import docgiaService from "@/services/docgiaService";

const auth = useAuthStore();
const docGiaList = ref([]);
const searchKeyword = ref("");
const isLoading = ref(false);
const isSubmitting = ref(false);

const showModal = ref(false);
const editingId = ref(null);
const isEdit = computed(() => Boolean(editingId.value));

// Gom class dùng chung cho các ô input/select
const inputClass =
  "w-full rounded-input border border-border-input bg-bg-input px-3 py-2 text-xs focus:bg-bg-card focus:border-primary outline-none";

const emptyForm = () => ({
  MADOCGIA: "",
  HOLOT: "",
  TEN: "",
  PHAI: "Nam",
  NGAYSINH: "",
  DIENTHOAI: "",
  DIACHI: "",
});

const form = ref(emptyForm());

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("vi-VN") : "-";

const filteredList = computed(() => {
  const kw = searchKeyword.value.toLowerCase();
  if (!kw) return docGiaList.value;
  return docGiaList.value.filter((dg) =>
    `${dg.MADOCGIA} ${dg.HOLOT} ${dg.TEN} ${dg.DIENTHOAI}`
      .toLowerCase()
      .includes(kw),
  );
});

const openModal = (dg = null) => {
  editingId.value = dg?._id || null;
  form.value = dg
    ? {
        MADOCGIA: dg.MADOCGIA || "",
        HOLOT: dg.HOLOT || "",
        TEN: dg.TEN || "",
        PHAI: dg.PHAI || "Nam",
        NGAYSINH: dg.NGAYSINH?.slice(0, 10) || "",
        DIENTHOAI: dg.DIENTHOAI || "",
        DIACHI: dg.DIACHI || "",
      }
    : emptyForm();
  showModal.value = true;
};

const fetchData = async () => {
  isLoading.value = true;
  try {
    docGiaList.value = (await docgiaService.getAllDocGia()) || [];
  } catch (err) {
    console.error("Lỗi khi tải độc giả:", err);
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    if (isEdit.value) {
      await docgiaService.updateDocGia(editingId.value, form.value);
    } else {
      await docgiaService.createDocGia(form.value);
    }
    alert(
      isEdit.value
        ? "Cập nhật độc giả thành công!"
        : "Cấp thẻ độc giả mới thành công!",
    );
    showModal.value = false;
    await fetchData();
  } catch (err) {
    alert(err.response?.data?.message || err.message || "Lỗi lưu độc giả");
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async (id) => {
  if (!confirm("Bạn có chắc chắn muốn xóa hồ sơ độc giả này?")) return;
  try {
    await docgiaService.deleteDocGia(id);
    alert("Xóa thành công!");
    await fetchData();
  } catch (err) {
    alert(err.response?.data?.message || "Lỗi khi xóa độc giả");
  }
};

onMounted(fetchData);
</script>
