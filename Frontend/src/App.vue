<template>
  <button
    v-if="auth.isAuthenticated && route.name !== 'Login'"
    type="button"
    class="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-md transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
    @click="handleLogout"
  >
    <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
    Đăng xuất
  </button>
  <RouterView />
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const handleLogout = async () => {
  auth.logout();
  await router.replace({ name: "Login" });
};
</script>
