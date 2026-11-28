<template>
  <main
    class="min-h-screen flex items-center justify-center bg-bg-page px-4 py-12 font-sans select-none"
  >
    <div class="w-full max-w-md">
      <!-- Logo & Header -->
      <div class="flex items-center justify-center gap-3.5 mb-8 pb-3">
        <div
          class="bg-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-btn p-1.5 shadow-md"
        >
          <img
            src="../assets/images/catbook.png"
            alt="Logo"
            class="h-full w-full object-contain"
          />
        </div>
        <h1 class="text-3xl font-bold text-text-main">QUẢN LÝ MƯỢN SÁCH</h1>
      </div>

      <!-- Login Card -->
      <div
        class="rounded-card border border-border-base bg-bg-card p-8 shadow-card"
      >
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- MSNV -->
          <div>
            <label
              for="msnv"
              class="block text-xs font-bold uppercase tracking-wider text-text-label pb-2 pt-2"
            >
              Mã số nhân viên
            </label>
            <div class="relative">
              <span
                class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm"
              >
                <i class="fa-solid fa-id-badge"></i>
              </span>
              <input
                id="msnv"
                v-model.trim="msnv"
                type="text"
                placeholder="Nhập mã số nhân viên"
                required
                autofocus
                class="w-full rounded-input border border-border-input bg-bg-input pl-10 pr-4 py-3 text-sm text-text-main placeholder-text-muted outline-none transition focus:bg-bg-card focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label
              for="password"
              class="block text-xs font-bold uppercase tracking-wider text-text-label pb-2 pt-2"
            >
              Mật khẩu
            </label>
            <div class="relative">
              <span
                class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm"
              >
                <i class="fa-solid fa-lock"></i>
              </span>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Nhập mật khẩu"
                required
                class="w-full rounded-input border border-border-input bg-bg-input pl-10 pr-10 py-3 text-sm text-text-main placeholder-text-muted outline-none transition focus:bg-bg-card focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main text-sm transition"
              >
                <i
                  :class="
                    showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'
                  "
                ></i>
              </button>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="pt-2">
            <div
              class="p-3 rounded-input bg-danger-bg border border-danger-border text-danger text-xs flex items-center gap-2"
            >
              <i class="fa-solid fa-circle-exclamation shrink-0"></i>
              <span>{{ errorMessage }}</span>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full rounded-btn bg-primary hover:bg-primary-hover active:bg-primary-active py-3 text-lg font-bold text-btn-text shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              <i
                v-if="isLoading"
                class="fa-solid fa-spinner fa-spin text-base"
              ></i>
              <span>{{ isLoading ? "Đang xử lý..." : "Đăng Nhập" }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const msnv = ref("");
const password = ref("");
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

const handleLogin = async () => {
  if (!msnv.value || !password.value) {
    errorMessage.value = "Vui lòng nhập đầy đủ MSNV và Mật khẩu.";
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = "";

    await authStore.login({
      MSNV: msnv.value,
      PASSWORD: password.value,
    });

    await router.replace({
      name: authStore.isAdmin ? "AdminDashboard" : "TheoDoiMuonSach",
    });
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
  } finally {
    isLoading.value = false;
  }
};
</script>
