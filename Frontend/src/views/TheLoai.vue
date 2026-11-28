<template>
  <div class="space-y-6 text-text-main">
    <!-- Header -->
    <div
      class="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <h1 class="text-2xl font-extrabold tracking-tight">Thể Loại Sách</h1>
      <button
        type="button"
        @click="openModal()"
        class="px-4 py-2 rounded-btn bg-primary hover:bg-primary-hover text-btn-text text-xs font-bold flex items-center gap-1.5"
      >
        <i class="fa-solid fa-plus"></i>
        <span>Thêm thể loại</span>
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
          placeholder="Tìm kiếm thể loại theo mã, tên..."
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
            <th class="py-3 px-3.5">Mã Thể Loại</th>
            <th class="py-3 px-3.5">Tên Thể Loại</th>
            <th class="py-3 px-3.5 text-right">Tùy Chỉnh</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-border-base">
          <tr v-for="tl in filteredList" :key="tl._id" class="hover:bg-bg-page">
            <td class="py-3 px-3.5">{{ tl.MATHELOAI || tl.MATL }}</td>
            <td class="py-3 px-3.5">{{ tl.TENTHELOAI || tl.TENTL }}</td>
            <td class="py-3 px-3.5 text-right space-x-1.5 whitespace-nowrap">
              <button
                type="button"
                @click="openModal(tl)"
                class="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-semibold"
                title="Sửa"
              >
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button
                v-if="auth.isAdmin"
                type="button"
                @click="handleDelete(tl._id)"
                class="px-2.5 py-1.5 rounded-lg bg-danger-bg text-danger hover:opacity-80 font-semibold"
                title="Xóa thể loại (Chỉ Admin)"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>

          <tr v-if="!filteredList.length">
            <td colspan="3" class="text-center py-12 text-text-muted">
              {{
                isLoading
                  ? "Đang tải dữ liệu..."
                  : "Không tìm thấy thể loại nào."
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
            {{ isEdit ? "Cập Nhật Thể Loại" : "Thêm Thể Loại Sách Mới" }}
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
              >MÃ THỂ LOẠI</label
            >
            <input
              v-model.trim="form.MATHELOAI"
              :disabled="isEdit"
              required
              :class="[inputClass, 'font-mono uppercase disabled:bg-bg-page']"
            />
          </div>

          <div>
            <label class="block font-bold text-text-label mb-1"
              >TÊN THỂ LOẠI</label
            >
            <input
              v-model.trim="form.TENTHELOAI"
              required
              :class="inputClass"
            />
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
              <span>{{ isEdit ? "Lưu Thay Đổi" : "Thêm Thể Loại" }}</span>
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
import theloaiService from "@/services/theloaiService";

const auth = useAuthStore();
const theLoaiList = ref([]);
const searchKeyword = ref("");
const isLoading = ref(false);
const isSubmitting = ref(false);

const showModal = ref(false);
const editingId = ref(null);
const isEdit = computed(() => Boolean(editingId.value));

const inputClass =
  "w-full rounded-input border border-border-input bg-bg-input px-3 py-2 text-xs focus:bg-bg-card focus:border-primary outline-none";

const emptyForm = () => ({ MATHELOAI: "", TENTHELOAI: "" });
const form = ref(emptyForm());

const filteredList = computed(() => {
  const kw = searchKeyword.value.toLowerCase();
  if (!kw) return theLoaiList.value;
  return theLoaiList.value.filter((tl) =>
    `${tl.MATHELOAI || tl.MATL || ""} ${tl.TENTHELOAI || tl.TENTL || ""}`
      .toLowerCase()
      .includes(kw),
  );
});

const openModal = (tl = null) => {
  editingId.value = tl?._id || null;
  form.value = tl
    ? {
        MATHELOAI: tl.MATHELOAI || tl.MATL || "",
        TENTHELOAI: tl.TENTHELOAI || tl.TENTL || "",
      }
    : emptyForm();
  showModal.value = true;
};

const fetchData = async () => {
  isLoading.value = true;
  try {
    theLoaiList.value = (await theloaiService.getAllTheLoai()) || [];
  } catch (err) {
    console.error("Lỗi khi tải thể loại:", err);
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const { MATHELOAI, TENTHELOAI } = form.value;
    const payload = {
      MATHELOAI,
      MATL: MATHELOAI,
      TENTHELOAI,
      TENTL: TENTHELOAI,
    };

    if (isEdit.value) {
      await theloaiService.updateTheLoai(editingId.value, payload);
    } else {
      await theloaiService.createTheLoai(payload);
    }
    alert(
      isEdit.value
        ? "Cập nhật thể loại thành công!"
        : "Thêm thể loại mới thành công!",
    );
    showModal.value = false;
    await fetchData();
  } catch (err) {
    alert(err.response?.data?.message || err.message || "Lỗi khi lưu thể loại");
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async (id) => {
  if (!confirm("Bạn có chắc chắn muốn xóa thể loại này?")) return;
  try {
    await theloaiService.deleteTheLoai(id);
    alert("Xóa thành công!");
    await fetchData();
  } catch (err) {
    alert(err.response?.data?.message || "Lỗi khi xóa thể loại");
  }
};

onMounted(fetchData);
</script>
