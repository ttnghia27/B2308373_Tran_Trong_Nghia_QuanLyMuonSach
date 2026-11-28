<template>
  <main
    class="min-h-screen flex items-center justify-center bg-bg-page px-4 py-12 font-sans select-none"
  >
    <div class="w-full max-w-md">
      <!-- Logo & Header -->
      <div class="flex items-center justify-center gap-3.5 mb-8 pb-1">
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
        <!-- Role Tabs -->
        <div class="grid grid-cols-2 gap-1.5 p-1 bg-bg-input rounded-input mb-6">
          <button
            type="button"
            @click="switchTab('staff')"
            class="py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
            :class="
              activeTab === 'staff'
                ? 'bg-bg-card text-primary shadow-sm'
                : 'text-text-muted hover:text-text-main'
            "
          >
            <i class="fa-solid fa-user-tie"></i>
            <span>Nhân Viên / Quản Trị</span>
          </button>
          <button
            type="button"
            @click="switchTab('reader')"
            class="py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
            :class="
              activeTab === 'reader'
                ? 'bg-bg-card text-primary shadow-sm'
                : 'text-text-muted hover:text-text-main'
            "
          >
            <i class="fa-solid fa-book-reader"></i>
            <span>Độc Giả</span>
          </button>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Identifier: MSNV or Mã Độc Giả / SĐT -->
          <div>
            <label
              for="login-id"
              class="block text-xs font-bold uppercase tracking-wider text-text-label pb-2"
            >
              {{ activeTab === 'staff' ? 'Mã số nhân viên (MSNV)' : 'Mã độc giả hoặc Số điện thoại' }}
            </label>
            <div class="relative">
              <span
                class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm"
              >
                <i :class="activeTab === 'staff' ? 'fa-solid fa-id-badge' : 'fa-solid fa-user'"></i>
              </span>
              <input
                id="login-id"
                v-model.trim="username"
                type="text"
                :placeholder="activeTab === 'staff' ? 'Nhập MSNV (ví dụ: ADMIN001)' : 'Nhập Mã độc giả hoặc SĐT'"
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
              class="block text-xs font-bold uppercase tracking-wider text-text-label pb-2"
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
          <div v-if="errorMessage" class="pt-1">
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
              class="w-full rounded-btn bg-primary hover:bg-primary-hover active:bg-primary-active py-3 text-base font-bold text-btn-text shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              <i
                v-if="isLoading"
                class="fa-solid fa-spinner fa-spin text-base"
              ></i>
              <span>{{
                isLoading
                  ? "Đang xác thực..."
                  : activeTab === 'staff'
                    ? "Đăng Nhập Quản Trị"
                    : "Đăng Nhập Độc Giả"
              }}</span>
            </button>
          </div>
        </form>

        <!-- Register Link for Readers -->
        <div
          v-if="activeTab === 'reader'"
          class="mt-6 pt-4 border-t border-border-subtle text-center text-xs text-text-muted"
        >
          Bạn chưa có thẻ thư viện?
          <RouterLink
            to="/register"
            class="font-bold text-primary hover:underline ml-1 inline-flex items-center gap-1"
          >
            <span>Đăng ký thẻ độc giả ngay</span>
            <i class="fa-solid fa-arrow-right text-[10px]"></i>
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute, RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const activeTab = ref("staff");
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

const switchTab = (tab) => {
  activeTab.value = tab;
  errorMessage.value = "";
};

onMounted(() => {
  if (route.query.tab === "docgia" || route.query.role === "reader") {
    activeTab.value = "reader";
  }
});

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = "Vui lòng nhập đầy đủ thông tin đăng nhập.";
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = "";

    if (activeTab.value === "staff") {
      await authStore.login({
        MSNV: username.value,
        PASSWORD: password.value,
      });

      await router.replace({
        name: authStore.isAdmin ? "AdminDashboard" : "TheoDoiMuonSach",
      });
    } else {
      await authStore.loginDocGia({
        MADOCGIA: username.value,
        PASSWORD: password.value,
      });

      await router.replace({ name: "ReaderPortal" });
    }
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
