<template>
  <main class="min-h-screen flex items-center justify-center bg-bg-page p-4">
    <div
      class="w-full max-w-lg rounded-card border border-border-base bg-bg-card p-8 shadow-card"
    >
      <!-- Logo & Header -->
      <div class="flex items-center justify-center gap-3.5 mb-6">
        <img
          src="../assets/images/catbook.png"
          alt="Logo"
          class="h-14 w-14 rounded-btn bg-primary p-1.5 object-contain"
        />
        <h1 class="text-2xl font-bold text-text-main">ĐĂNG KÝ THẺ ĐỘC GIẢ</h1>
      </div>

      <!-- Success Alert -->
      <div v-if="successMessage" class="space-y-4">
        <div
          class="p-3.5 rounded-input bg-success-bg border border-success-border text-success text-xs space-y-1"
        >
          <p class="font-bold">{{ successMessage }}</p>
          <p v-if="registeredId">
            Mã độc giả của bạn: <strong>{{ registeredId }}</strong
            >. Bạn có thể dùng mã này hoặc số điện thoại để đăng nhập.
          </p>
        </div>
        <RouterLink
          to="/login?tab=docgia"
          class="block w-full text-center rounded-btn bg-primary hover:bg-primary-hover py-3 font-bold text-btn-text"
        >
          Đăng Nhập Ngay
        </RouterLink>
      </div>

      <!-- Register Form -->
      <form v-else @submit.prevent="handleRegister" class="space-y-3">
        <!-- Họ lót & Tên -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="sm:col-span-2">
            <label
              for="holot"
              class="block text-xs font-bold uppercase text-text-label py-1.5"
            >
              Họ và tên đệm
            </label>
            <input
              id="holot"
              v-model.trim="form.HOLOT"
              type="text"
              required
              autofocus
              class="w-full rounded-input border border-border-input bg-bg-input px-4 py-3 text-sm text-text-main outline-none focus:bg-bg-card focus:border-primary"
            />
          </div>

          <div>
            <label
              for="ten"
              class="block text-xs font-bold uppercase text-text-label py-1.5"
            >
              Tên
            </label>
            <input
              id="ten"
              v-model.trim="form.TEN"
              type="text"
              required
              class="w-full rounded-input border border-border-input bg-bg-input px-4 py-3 text-sm text-text-main outline-none focus:bg-bg-card focus:border-primary"
            />
          </div>
        </div>

        <!-- Ngày sinh & Giới tính -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              for="ngaysinh"
              class="block text-xs font-bold uppercase text-text-label py-1.5"
            >
              Ngày sinh
            </label>
            <input
              id="ngaysinh"
              v-model="form.NGAYSINH"
              type="date"
              required
              class="w-full rounded-input border border-border-input bg-bg-input px-4 py-3 text-sm text-text-main outline-none focus:bg-bg-card focus:border-primary"
            />
          </div>

          <div>
            <label
              for="phai"
              class="block text-xs font-bold uppercase text-text-label py-1.5"
            >
              Giới tính
            </label>
            <select
              id="phai"
              v-model="form.PHAI"
              class="w-full rounded-input border border-border-input bg-bg-input px-4 py-3 text-sm text-text-main outline-none focus:bg-bg-card focus:border-primary"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>

        <!-- Số điện thoại -->
        <div>
          <label
            for="dienthoai"
            class="block text-xs font-bold uppercase text-text-label py-1.5"
          >
            Số điện thoại
          </label>
          <div class="relative">
            <i
              class="fa-solid fa-phone absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
            ></i>
            <input
              id="dienthoai"
              v-model.trim="form.DIENTHOAI"
              type="tel"
              maxlength="10"
              placeholder="Nhập số điện thoại"
              required
              class="w-full rounded-input border border-border-input bg-bg-input pl-10 pr-4 py-3 text-sm text-text-main outline-none focus:bg-bg-card focus:border-primary"
            />
          </div>
        </div>

        <!-- Địa chỉ -->
        <div>
          <label
            for="diachi"
            class="block text-xs font-bold uppercase text-text-label py-1.5"
          >
            Địa chỉ liên hệ
          </label>
          <div class="relative">
            <i
              class="fa-solid fa-location-dot absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
            ></i>
            <input
              id="diachi"
              v-model.trim="form.DIACHI"
              type="text"
              placeholder="Nhập địa chỉ liên hệ"
              required
              class="w-full rounded-input border border-border-input bg-bg-input pl-10 pr-4 py-3 text-sm text-text-main outline-none focus:bg-bg-card focus:border-primary"
            />
          </div>
        </div>

        <!-- Mật khẩu & Xác nhận mật khẩu -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              for="password"
              class="block text-xs font-bold uppercase text-text-label py-1.5"
            >
              Mật khẩu
            </label>
            <div class="relative">
              <i
                class="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
              ></i>
              <input
                id="password"
                v-model="form.PASSWORD"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Tối thiểu 3 ký tự"
                required
                minlength="3"
                class="w-full rounded-input border border-border-input bg-bg-input pl-10 pr-10 py-3 text-sm text-text-main outline-none focus:bg-bg-card focus:border-primary"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
              >
                <i
                  class="fa-solid"
                  :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
                ></i>
              </button>
            </div>
          </div>

          <div>
            <label
              for="confirm-password"
              class="block text-xs font-bold uppercase text-text-label py-1.5"
            >
              Nhập lại mật khẩu
            </label>
            <div class="relative">
              <i
                class="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
              ></i>
              <input
                id="confirm-password"
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Nhập lại mật khẩu"
                required
                class="w-full rounded-input border border-border-input bg-bg-input pl-10 pr-4 py-3 text-sm text-text-main outline-none focus:bg-bg-card focus:border-primary"
              />
            </div>
          </div>
        </div>

        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="p-3 rounded-input bg-danger-bg border border-danger-border text-danger text-xs"
        >
          {{ errorMessage }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="!mt-6 w-full rounded-btn bg-primary hover:bg-primary-hover py-3 font-bold text-btn-text flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <i v-if="isLoading" class="fa-solid fa-spinner fa-spin"></i>
          {{ isLoading ? "Đang tạo tài khoản..." : "Đăng Ký" }}
        </button>
      </form>

      <!-- Footer link -->
      <div class="mt-6 pt-4 border-t border-border-subtle text-center text-xs">
        <RouterLink
          to="/login?tab=docgia"
          class="font-bold text-primary hover:underline"
        >
          Đăng Nhập
        </RouterLink>
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
  PHAI: "",
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
