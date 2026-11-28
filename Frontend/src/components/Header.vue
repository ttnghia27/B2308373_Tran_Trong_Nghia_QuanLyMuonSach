<template>
  <header
    class="h-16 bg-bg-card border-b border-border-base px-6 flex items-center justify-between shadow-sm sticky top-0 z-30 font-sans"
  >
    <div class="flex items-center gap-3">
      <h2 class="text-lg font-bold text-text-main">
        {{ currentTitle }}
      </h2>
    </div>

    <div class="flex items-center gap-3">
      <button
        type="button"
        @click="handleLogout"
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-danger bg-danger-bg hover:bg-danger-hover-bg"
      >
        <span>Đăng xuất</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const handleLogout = () => {
  auth.logout();
  router.replace({ name: "Login" });
};

const currentTitle = computed(() => {
  switch (route.name) {
    case "AdminDashboard":
      return "Dashboard";
    case "Sach":
      return "Quản Lý Sách";
    case "DocGia":
      return "Quản Lý Đọc Giả";
    case "NhanVien":
      return "Quản Lý Nhân Viên";
    case "NhaXuatBan":
      return "Quản Lý Nhà Xuất Bản";
    case "TheLoai":
      return "Quản Lý Thể Loại Sách";
    case "TheoDoiMuonSach":
      return "Quản Lý Theo Dõi Mượn Sách";
    default:
      return "Quản Lý Mượn Sách";
  }
});
</script>
