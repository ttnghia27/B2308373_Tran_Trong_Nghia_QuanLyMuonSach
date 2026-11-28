<template>
  <main
    class="min-h-screen flex items-center justify-center bg-bg-page px-4 py-12 font-sans select-none"
  >
    <div class="w-full max-w-md">
      <div
        class="rounded-card border border-border-base bg-bg-card p-8 shadow-card"
      >
        <div class="flex items-center justify-center gap-3.5 mb-8 pb-2">
          <div
            class="bg-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-btn p-1.5 shadow-md"
          >
            <img
              src="../assets/images/catbook.png"
              alt="Logo"
              class="h-full w-full object-contain"
            />
          </div>
          <h1 class="text-2xl font-bold text-text-main">QUẢN LÝ MƯỢN SÁCH</h1>
        </div>
        <div
          class="grid grid-cols-2 gap-1.5 p-1 bg-bg-input rounded-input mb-6"
        >
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            @click="switchTab(tab.value)"
            class="py-2 text-xs font-bold rounded-lg transition"
            :class="
              activeTab === tab.value
                ? 'bg-bg-card text-primary shadow-sm'
                : 'text-text-muted hover:text-text-main'
            "
          >
            {{ tab.label }}
          </button>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label
              for="login-id"
              class="block text-xs font-bold uppercase tracking-wider text-text-label py-2"
            >
              {{ activeTab === "staff" ? "Mã số nhân viên" : "Mã độc giả" }}
            </label>
            <div class="relative">
              <i
                class="fa-solid fa-user pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm"
              ></i>
              <input
                id="login-id"
                v-model.trim="username"
                type="text"
                :placeholder="
                  activeTab === 'staff'
                    ? 'Nhập mã số nhân viên'
                    : 'Nhập mã độc giả'
                "
                required
                autofocus
                class="w-full rounded-input border border-border-input bg-bg-input pl-10 pr-4 py-3 text-sm text-text-main placeholder-text-muted outline-none transition focus:bg-bg-card focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          <div>
            <label
              for="password"
              class="block text-xs font-bold uppercase tracking-wider text-text-label py-2"
            >
              Mật khẩu
            </label>
            <div class="relative">
              <i
                class="fa-solid fa-lock pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm"
              ></i>
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
                  class="fa-solid"
                  :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
                ></i>
              </button>
            </div>
          </div>

          <div
            v-if="errorMessage"
            class="p-3 rounded-input bg-danger-bg border border-danger-border text-danger text-xs"
          >
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="!mt-6 w-full rounded-btn bg-primary hover:bg-primary-hover active:bg-primary-active py-3 text-base font-bold text-btn-text shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
          >
            <i v-if="isLoading" class="fa-solid fa-spinner fa-spin"></i>
            Đăng Nhập
          </button>
        </form>

        <div
          v-if="activeTab === 'reader'"
          class="mt-6 pt-4 border-t border-border-subtle text-center text-xs"
        >
          <RouterLink
            to="/register"
            class="font-bold text-primary hover:underline"
          >
            Đăng Ký
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const tabs = [
  { label: "Admin / Nhân Viên", value: "staff" },
  { label: "Độc Giả", value: "reader" },
];

const isReaderQuery =
  route.query.tab === "docgia" || route.query.role === "reader";
const activeTab = ref(isReaderQuery ? "reader" : "staff");

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

const switchTab = (tab) => {
  activeTab.value = tab;
  errorMessage.value = "";
};

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
