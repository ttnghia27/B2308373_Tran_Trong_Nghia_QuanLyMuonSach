<template>
  <main
    class="min-h-screen flex items-center justify-center bg-bg-page px-4 py-8 font-sans select-none"
  >
    <div class="w-full max-w-lg">
      <!-- Logo & Header -->
      <div class="flex items-center justify-center gap-3.5 mb-6">
        <div
          class="bg-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-btn p-1.5 shadow-md"
        >
          <img
            src="../assets/images/catbook.png"
            alt="Logo"
            class="h-full w-full object-contain"
          />
        </div>
        <h1 class="text-2xl font-bold text-text-main">ĐĂNG KÝ THẺ ĐỘC GIẢ</h1>
      </div>

      <!-- Registration Card -->
      <div
        class="rounded-card border border-border-base bg-bg-card p-6 sm:p-8 shadow-card"
      >
        <p class="text-xs text-text-muted mb-5 text-center">
          Đăng ký tài khoản để tra cứu và gửi yêu cầu mượn sách trực tuyến
        </p>

        <!-- Success Alert -->
        <div v-if="successMessage" class="mb-5">
          <div
            class="p-4 rounded-input bg-success-bg border border-success-border text-success text-xs flex items-center gap-2"
          >
            <i class="fa-solid fa-circle-check shrink-0 text-base"></i>
            <div>
              <p class="font-bold">{{ successMessage }}</p>
              <p v-if="registeredId" class="mt-0.5">
                Mã độc giả của bạn: <strong>{{ registeredId }}</strong>. Bạn có thể dùng mã này hoặc số điện thoại để đăng nhập.
              </p>
            </div>
          </div>
          <div class="mt-4 text-center">
            <RouterLink
              to="/login?tab=docgia"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-btn bg-primary text-btn-text text-sm font-bold shadow hover:bg-primary-hover transition"
            >
              <span>Đến trang Đăng nhập</span>
              <i class="fa-solid fa-arrow-right"></i>
            </RouterLink>
          </div>
        </div>

        <form v-else @submit.prevent="handleRegister" class="space-y-4">
          <!-- Họ lót & Tên -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <label
                for="holot"
                class="block text-xs font-bold uppercase tracking-wider text-text-label pb-1.5"
              >
                Họ và tên đệm <span class="text-danger">*</span>
              </label>
              <input
                id="holot"
                v-model.trim="form.HOLOT"
                type="text"
                placeholder="Nguyễn Văn"
                required
                class="w-full rounded-input border border-border-input bg-bg-input px-3.5 py-2.5 text-xs text-text-main placeholder-text-muted outline-none transition focus:bg-bg-card focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label
                for="ten"
                class="block text-xs font-bold uppercase tracking-wider text-text-label pb-1.5"
              >
                Tên <span class="text-danger">*</span>
              </label>
              <input
                id="ten"
                v-model.trim="form.TEN"
                type="text"
                placeholder="An"
                required
                class="w-full rounded-input border border-border-input bg-bg-input px-3.5 py-2.5 text-xs text-text-main placeholder-text-muted outline-none transition focus:bg-bg-card focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <!-- Ngày sinh & Phái -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                for="ngaysinh"
                class="block text-xs font-bold uppercase tracking-wider text-text-label pb-1.5"
              >
                Ngày sinh <span class="text-danger">*</span>
              </label>
              <input
                id="ngaysinh"
                v-model="form.NGAYSINH"
                type="date"
                required
                class="w-full rounded-input border border-border-input bg-bg-input px-3.5 py-2.5 text-xs text-text-main outline-none transition focus:bg-bg-card focus:border-primary"
              />
            </div>
            <div>
              <label
                for="phai"
                class="block text-xs font-bold uppercase tracking-wider text-text-label pb-1.5"
              >
                Giới tính
              </label>
              <select
                id="phai"
                v-model="form.PHAI"
                class="w-full rounded-input border border-border-input bg-bg-input px-3.5 py-2.5 text-xs text-text-main outline-none transition focus:bg-bg-card focus:border-primary"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <!-- Điện thoại -->
          <div>
            <label
              for="dienthoai"
              class="block text-xs font-bold uppercase tracking-wider text-text-label pb-1.5"
            >
              Số điện thoại <span class="text-danger">*</span>
            </label>
            <div class="relative">
              <span
                class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs"
              >
                <i class="fa-solid fa-phone"></i>
              </span>
              <input
                id="dienthoai"
                v-model.trim="form.DIENTHOAI"
                type="tel"
                maxlength="10"
                placeholder="0912345678"
                required
                class="w-full rounded-input border border-border-input bg-bg-input pl-9 pr-3.5 py-2.5 text-xs text-text-main placeholder-text-muted outline-none transition focus:bg-bg-card focus:border-primary"
              />
            </div>
          </div>

          <!-- Địa chỉ -->
          <div>
            <label
              for="diachi"
              class="block text-xs font-bold uppercase tracking-wider text-text-label pb-1.5"
            >
              Địa chỉ liên hệ <span class="text-danger">*</span>
            </label>
            <div class="relative">
              <span
                class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs"
              >
                <i class="fa-solid fa-location-dot"></i>
              </span>
              <input
                id="diachi"
                v-model.trim="form.DIACHI"
                type="text"
                placeholder="Số nhà, đường, phường/xã, TP..."
                required
                class="w-full rounded-input border border-border-input bg-bg-input pl-9 pr-3.5 py-2.5 text-xs text-text-main placeholder-text-muted outline-none transition focus:bg-bg-card focus:border-primary"
              />
            </div>
          </div>

          <!-- Mật khẩu -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                for="password"
                class="block text-xs font-bold uppercase tracking-wider text-text-label pb-1.5"
              >
                Mật khẩu <span class="text-danger">*</span>
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.PASSWORD"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Tối thiểu 6 ký tự"
                  required
                  minlength="6"
                  class="w-full rounded-input border border-border-input bg-bg-input px-3.5 py-2.5 text-xs text-text-main placeholder-text-muted outline-none transition focus:bg-bg-card focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label
                for="confirm-password"
                class="block text-xs font-bold uppercase tracking-wider text-text-label pb-1.5"
              >
                Nhập lại mật khẩu <span class="text-danger">*</span>
              </label>
              <div class="relative">
                <input
                  id="confirm-password"
                  v-model="confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Khớp với mật khẩu trên"
                  required
                  class="w-full rounded-input border border-border-input bg-bg-input px-3.5 py-2.5 text-xs text-text-main placeholder-text-muted outline-none transition focus:bg-bg-card focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs pt-1">
            <label class="flex items-center gap-1.5 cursor-pointer text-text-muted hover:text-text-main">
              <input
                type="checkbox"
                v-model="showPassword"
                class="rounded border-border-input text-primary focus:ring-0"
              />
              <span>Hiển thị mật khẩu</span>
            </label>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="pt-1">
            <div
              class="p-3 rounded-input bg-danger-bg border border-danger-border text-danger text-xs flex items-center gap-2"
            >
              <i class="fa-solid fa-circle-exclamation shrink-0"></i>
              <span>{{ errorMessage }}</span>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-3">
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full rounded-btn bg-primary hover:bg-primary-hover active:bg-primary-active py-3 text-base font-bold text-btn-text shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              <i
                v-if="isLoading"
                class="fa-solid fa-spinner fa-spin text-base"
              ></i>
              <span>{{ isLoading ? "Đang tạo tài khoản..." : "Đăng Ký Tài Khoản" }}</span>
            </button>
          </div>
        </form>

        <!-- Footer link -->
        <div class="mt-6 pt-4 border-t border-border-subtle text-center text-xs text-text-muted">
          Đã có tài khoản bạn đọc?
          <RouterLink
            to="/login?tab=docgia"
            class="font-bold text-primary hover:underline ml-1"
          >
            Đăng nhập ngay
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

const form = ref({
  HOLOT: "",
  TEN: "",
  NGAYSINH: "",
  PHAI: "Nam",
  DIACHI: "",
  DIENTHOAI: "",
  PASSWORD: "",
});

const confirmPassword = ref("");
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const registeredId = ref("");

const handleRegister = async () => {
  if (form.value.PASSWORD !== confirmPassword.value) {
    errorMessage.value = "Mật khẩu xác nhận không khớp.";
    return;
  }
  if (form.value.DIENTHOAI.length < 9) {
    errorMessage.value = "Số điện thoại không hợp lệ.";
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    const res = await authStore.registerDocGia(form.value);

    successMessage.value = res.message || "Đăng ký thành công!";
    registeredId.value = res.data?.MADOCGIA || "";
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
  } finally {
    isLoading.value = false;
  }
};
</script>
