<template>
  <div class="space-y-6 text-text-main">
    <!-- Header -->
    <div
      class="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <h1 class="text-2xl font-extrabold tracking-tight">Nhân Viên</h1>

      <button
        type="button"
        @click="openModal()"
        class="px-4 py-2 rounded-btn bg-primary hover:bg-primary-hover text-btn-text text-xs font-bold flex items-center gap-1.5"
      >
        <i class="fa-solid fa-plus"></i>
        Thêm nhân viên
      </button>
    </div>

    <!-- Search -->
    <div class="relative pb-3" role="search">
      <i
        class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs"
      ></i>
      <input
        v-model.trim="searchKeyword"
        type="search"
        placeholder="Tìm theo Mã nhân viên (MSNV), Họ tên, Chức vụ, SĐT..."
        class="w-full py-2 pl-9 pr-4 rounded-input border border-border-input bg-bg-input text-xs placeholder:text-text-muted focus:bg-bg-card focus:border-primary outline-none"
      />
    </div>

    <!-- Table -->
    <div
      class="bg-bg-card rounded-card border border-border-base shadow-sm overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="uppercase tracking-wider border-b border-border-base">
              <th class="py-3 px-3.5">Mã Số Nhân Viên</th>
              <th class="py-3 px-3.5">Họ và Tên</th>
              <th class="py-3 px-3.5">Chức Vụ</th>
              <th class="py-3 px-3.5">Địa Chỉ</th>
              <th class="py-3 px-3.5 text-right">Tùy Chỉnh</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-border-base">
            <tr
              v-for="nv in filteredList"
              :key="nv._id"
              class="hover:bg-bg-page"
            >
              <td class="py-3 px-3.5">{{ nv.MSNV }}</td>
              <td class="py-3 px-3.5">
                <div class="font-bold">{{ nv.HOTENNV }}</div>
                <div>SĐT: {{ nv.SODIENTHOAI }}</div>
              </td>
              <td class="py-3 px-3.5">
                {{ nv.CHUCVU || "Nhân Viên" }}
              </td>
              <td class="py-3 px-3.5" :title="nv.DIACHI">
                {{ nv.DIACHI || "Chưa cập nhật địa chỉ" }}
              </td>
              <td class="py-3 px-3.5 text-right space-x-1.5 whitespace-nowrap">
                <button
                  type="button"
                  @click="openModal(nv)"
                  class="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-semibold"
                  title="Sửa thông tin"
                >
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>

                <button
                  v-if="nv.MSNV !== auth.nhanVien?.MSNV"
                  type="button"
                  @click="handleDelete(nv._id)"
                  class="px-2.5 py-1.5 rounded-lg bg-danger-bg text-danger hover:opacity-80 font-semibold"
                  title="Xóa nhân viên"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>

            <tr v-if="!filteredList.length">
              <td colspan="5" class="text-center py-12 text-text-muted">
                {{
                  isLoading
                    ? "Đang tải dữ liệu..."
                    : "Không tìm thấy nhân viên nào."
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="modal.show"
      @click.self="modal.show = false"
      class="fixed inset-0 z-50 flex items-center justify-center bg-text-main/50 p-4 overflow-y-auto"
    >
      <div
        class="w-full max-w-md rounded-card bg-bg-card p-6 shadow-2xl space-y-4"
      >
        <div class="flex items-center justify-between pb-3">
          <h3 class="font-bold text-base">
            {{ modal.isEdit ? "Cập Nhật Nhân Viên" : "Thêm Nhân Viên Mới" }}
          </h3>

          <button
            type="button"
            @click="modal.show = false"
            class="text-text-muted hover:text-text-main"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-text-label mb-1">
              MÃ SỐ NHÂN VIÊN
            </label>
            <input
              v-model.trim="form.MSNV"
              :disabled="modal.isEdit"
              type="text"
              required
              class="w-full rounded-input border border-border-input bg-bg-input px-3 py-2 font-mono uppercase focus:bg-bg-card focus:border-primary outline-none disabled:bg-bg-page"
            />
          </div>

          <div>
            <label class="block font-bold text-text-label mb-1">
              HỌ VÀ TÊN
            </label>
            <input
              v-model.trim="form.HOTENNV"
              type="text"
              required
              class="w-full rounded-input border border-border-input bg-bg-input px-3 py-2 focus:bg-bg-card focus:border-primary outline-none"
            />
          </div>

          <div>
            <label class="block font-bold text-text-label mb-1">
              {{
                modal.isEdit
                  ? "MẬT KHẨU MỚI (Để trống nếu không đổi)"
                  : "MẬT KHẨU KHỞI TẠO"
              }}
            </label>
            <input
              v-model="form.PASSWORD"
              type="password"
              :required="!modal.isEdit"
              class="w-full rounded-input border border-border-input bg-bg-input px-3 py-2 focus:bg-bg-card focus:border-primary outline-none"
            />
          </div>

          <div>
            <label class="block font-bold text-text-label mb-1">CHỨC VỤ</label>
            <select
              v-model="form.CHUCVU"
              required
              class="w-full rounded-input border border-border-input bg-bg-input px-3 py-2 focus:bg-bg-card focus:border-primary outline-none"
            >
              <option value="Nhân Viên">Nhân Viên</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-text-label mb-1">
              SỐ ĐIỆN THOẠI
            </label>
            <input
              v-model.trim="form.SODIENTHOAI"
              type="tel"
              required
              class="w-full rounded-input border border-border-input bg-bg-input px-3 py-2 focus:bg-bg-card focus:border-primary outline-none"
            />
          </div>

          <div>
            <label class="block font-bold text-text-label mb-1">ĐỊA CHỈ</label>
            <input
              v-model.trim="form.DIACHI"
              type="text"
              required
              class="w-full rounded-input border border-border-input bg-bg-input px-3 py-2 focus:bg-bg-card focus:border-primary outline-none"
            />
          </div>

          <div class="flex justify-end gap-3 pt-3">
            <button
              type="button"
              @click="modal.show = false"
              class="px-4 py-2 rounded-btn border border-border-base font-semibold text-text-label hover:bg-bg-page"
            >
              Hủy
            </button>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-5 py-2 rounded-btn bg-primary hover:bg-primary-hover text-btn-text font-bold flex items-center gap-1.5 disabled:opacity-60 disabled:pointer-events-none"
            >
              <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin"></i>
              {{ modal.isEdit ? "Lưu Thay Đổi" : "Tạo Tài Khoản" }}
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
import nhanvienService from "@/services/nhanvienService";

const auth = useAuthStore();
const nhanVienList = ref([]);
const searchKeyword = ref("");
const isLoading = ref(false);
const isSubmitting = ref(false);

const defaultForm = {
  MSNV: "",
  HOTENNV: "",
  PASSWORD: "",
  CHUCVU: "Nhân Viên",
  SODIENTHOAI: "",
  DIACHI: "",
};

const form = ref({ ...defaultForm });
const modal = ref({ show: false, isEdit: false, targetId: null });

const filteredList = computed(() => {
  const kw = searchKeyword.value.toLowerCase();
  if (!kw) return nhanVienList.value;

  return nhanVienList.value.filter((nv) =>
    [nv.MSNV, nv.HOTENNV, nv.CHUCVU, nv.SODIENTHOAI]
      .filter(Boolean)
      .some((val) => String(val).toLowerCase().includes(kw)),
  );
});

const openModal = (nv = null) => {
  modal.value = {
    show: true,
    isEdit: Boolean(nv),
    targetId: nv?._id || null,
  };

  form.value = nv
    ? {
        MSNV: nv.MSNV || "",
        HOTENNV: nv.HOTENNV || "",
        PASSWORD: "",
        CHUCVU: nv.CHUCVU || "Nhân Viên",
        SODIENTHOAI: nv.SODIENTHOAI || "",
        DIACHI: nv.DIACHI || "",
      }
    : { ...defaultForm };
};

const handleSubmit = async () => {
  try {
    isSubmitting.value = true;
    const payload = { ...form.value };

    if (modal.value.isEdit && !payload.PASSWORD) {
      delete payload.PASSWORD;
    }

    if (modal.value.isEdit) {
      await nhanvienService.updateNhanVien(modal.value.targetId, payload);
      alert("Cập nhật thông tin nhân viên thành công!");
    } else {
      await nhanvienService.createNhanVien(payload);
      alert("Tạo nhân viên mới thành công!");
    }

    modal.value.show = false;
    await fetchData();
  } catch (err) {
    alert(err.response?.data?.message || err.message || "Lỗi lưu nhân viên");
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async (id) => {
  if (!confirm("Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống?")) {
    return;
  }

  try {
    await nhanvienService.deleteNhanVien(id);
    alert("Xóa thành công!");
    await fetchData();
  } catch (err) {
    alert(err.response?.data?.message || "Lỗi khi xóa nhân viên");
  }
};

const fetchData = async () => {
  try {
    isLoading.value = true;
    nhanVienList.value = (await nhanvienService.getAllNhanVien()) || [];
  } catch (err) {
    console.error("Lỗi khi tải nhân viên:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);
</script>
