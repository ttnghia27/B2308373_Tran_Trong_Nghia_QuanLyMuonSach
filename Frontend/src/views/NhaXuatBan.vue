<template>
  <div class="space-y-6 text-text-main">
    <!-- Header -->
    <div
      class="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <h1 class="text-2xl font-extrabold tracking-tight">Nhà Xuất Bản</h1>
      <button
        type="button"
        @click="openModal()"
        class="px-4 py-2 rounded-btn bg-primary hover:bg-primary-hover text-btn-text text-xs font-bold flex items-center gap-1.5"
      >
        <i class="fa-solid fa-plus"></i>
        <span>Thêm nhà xuất bản</span>
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
          placeholder="Tìm kiếm NXB theo mã, tên hoặc địa chỉ..."
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
            <th class="py-3 px-3.5">Mã NXB</th>
            <th class="py-3 px-3.5">Tên Nhà Xuất Bản</th>
            <th class="py-3 px-3.5">Địa Chỉ</th>
            <th class="py-3 px-3.5 text-right">Tùy Chỉnh</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-border-base">
          <tr
            v-for="nxb in filteredList"
            :key="nxb._id"
            class="hover:bg-bg-page"
          >
            <td class="py-3 px-3.5">{{ nxb.MANXB }}</td>
            <td class="py-3 px-3.5">{{ nxb.TENNXB }}</td>
            <td class="py-3 px-3.5" :title="nxb.DIACHI">
              {{ nxb.DIACHI || "Chưa cập nhật địa chỉ" }}
            </td>
            <td class="py-3 px-3.5 text-right space-x-1.5 whitespace-nowrap">
              <button
                type="button"
                @click="openModal(nxb)"
                class="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-semibold"
                title="Sửa"
              >
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button
                v-if="auth.isAdmin"
                type="button"
                @click="handleDelete(nxb._id)"
                class="px-2.5 py-1.5 rounded-lg bg-danger-bg text-danger hover:opacity-80 font-semibold"
                title="Xóa NXB (Chỉ Admin)"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>

          <tr v-if="!filteredList.length">
            <td colspan="4" class="text-center py-12 text-text-muted">
              {{
                isLoading
                  ? "Đang tải dữ liệu..."
                  : "Không tìm thấy nhà xuất bản nào."
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
            {{ isEdit ? "Cập Nhật Nhà Xuất Bản" : "Thêm Nhà Xuất Bản Mới" }}
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
              >MÃ NHÀ XUẤT BẢN</label
            >
            <input
              v-model.trim="form.MANXB"
              :disabled="isEdit"
              required
              :class="[inputClass, 'uppercase disabled:bg-bg-page']"
            />
          </div>

          <div>
            <label class="block font-bold text-text-label mb-1"
              >TÊN NHÀ XUẤT BẢN</label
            >
            <input v-model.trim="form.TENNXB" required :class="inputClass" />
          </div>

          <div>
            <label class="block font-bold text-text-label mb-1">ĐỊA CHỈ</label>
            <textarea
              v-model.trim="form.DIACHI"
              rows="3"
              :class="inputClass"
            ></textarea>
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
              <span>{{ isEdit ? "Lưu Thay Đổi" : "Thêm NXB" }}</span>
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
import nhaxuatbanService from "@/services/nhaxuatbanService";

const auth = useAuthStore();
const nxbList = ref([]);
const searchKeyword = ref("");
const isLoading = ref(false);
const isSubmitting = ref(false);

const showModal = ref(false);
const editingId = ref(null);
const isEdit = computed(() => Boolean(editingId.value));

const inputClass =
  "w-full rounded-input border border-border-input bg-bg-input px-3 py-2 text-xs focus:bg-bg-card focus:border-primary outline-none";

const emptyForm = () => ({ MANXB: "", TENNXB: "", DIACHI: "" });
const form = ref(emptyForm());

const filteredList = computed(() => {
  const kw = searchKeyword.value.toLowerCase();
  if (!kw) return nxbList.value;
  return nxbList.value.filter((n) =>
    `${n.MANXB} ${n.TENNXB} ${n.DIACHI}`.toLowerCase().includes(kw),
  );
});

const openModal = (nxb = null) => {
  editingId.value = nxb?._id || null;
  form.value = nxb
    ? {
        MANXB: nxb.MANXB || "",
        TENNXB: nxb.TENNXB || "",
        DIACHI: nxb.DIACHI || "",
      }
    : emptyForm();
  showModal.value = true;
};

const fetchData = async () => {
  isLoading.value = true;
  try {
    nxbList.value = (await nhaxuatbanService.getAllNhaXuatBan()) || [];
  } catch (err) {
    console.error("Lỗi khi tải NXB:", err);
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    if (isEdit.value) {
      await nhaxuatbanService.updateNhaXuatBan(editingId.value, form.value);
    } else {
      await nhaxuatbanService.createNhaXuatBan(form.value);
    }
    alert(
      isEdit.value ? "Cập nhật NXB thành công!" : "Thêm NXB mới thành công!",
    );
    showModal.value = false;
    await fetchData();
  } catch (err) {
    alert(err.response?.data?.message || err.message || "Lỗi khi lưu NXB");
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async (id) => {
  if (!confirm("Bạn có chắc chắn muốn xóa nhà xuất bản này?")) return;
  try {
    await nhaxuatbanService.deleteNhaXuatBan(id);
    alert("Xóa thành công!");
    await fetchData();
  } catch (err) {
    alert(err.response?.data?.message || "Lỗi khi xóa NXB");
  }
};

onMounted(fetchData);
</script>
