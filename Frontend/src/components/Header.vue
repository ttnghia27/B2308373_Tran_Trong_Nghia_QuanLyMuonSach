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
      <span class="text-xs text-text-muted hidden sm:inline-block">
        Xin chào, <strong>{{ auth.displayName || "Bạn" }}</strong>
      </span>
      <button
        type="button"
        @click="handleLogout"
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-danger bg-danger-bg hover:bg-danger-hover-bg transition"
      >
        <i class="fa-solid fa-right-from-bracket"></i>
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
      return "Trang Chủ Thống Kê";
    case "Sach":
      return "Quản Lý Sách";
    case "DocGia":
      return "Quản Lý Độc Giả";
    case "NhanVien":
      return "Quản Lý Nhân Viên";
    case "NhaXuatBan":
      return "Quản Lý Nhà Xuất Bản";
    case "TheLoai":
      return "Quản Lý Thể Loại Sách";
    case "TheoDoiMuonSach":
      return "Quản Lý Mượn Sách & Duyệt Yêu Cầu";
    case "ReaderPortal":
      return "Cổng Dịch Vụ Độc Giả";
    default:
      return "Hệ Thống Quản Lý Thư Viện";
  }
});
</script>
