<template>
  <aside
    class="w-64 bg-sidebar text-white min-h-screen flex flex-col shadow-xl select-none shrink-0"
  >
    <div class="p-5 border-b border-sidebar-divider flex items-center gap-3">
      <div
        class="h-10 w-10 rounded-btn bg-primary p-1.5 flex items-center justify-center shrink-0"
      >
        <img
          src="../assets/images/catbook.png"
          alt="Logo"
          class="h-full w-full object-contain"
        />
      </div>
      <p class="text-xs font-bold tracking-wider">QUẢN LÝ MƯỢN SÁCH</p>
    </div>

    <div
      class="p-4 mx-3 my-3 bg-sidebar-user border border-sidebar-user-border flex items-center gap-3"
    >
      <div class="flex items-center justify-between gap-2 min-w-0 flex-1">
        <p class="font-bold tracking-wider text-xs truncate">
          {{ auth.displayName || "Người dùng" }}
        </p>
        <span
          class="shrink-0 font-bold tracking-wider text-xs px-2 py-0.5 rounded text-[10px] uppercase"
          :class="
            auth.isDocGia
              ? 'bg-amber-500/20 text-amber-400'
              : auth.isAdmin
                ? 'bg-primary/20 text-primary-light'
                : 'bg-blue-500/20 text-blue-400'
          "
        >
          {{ auth.isDocGia ? "Độc Giả" : auth.nhanVien?.CHUCVU || "Nhân Viên" }}
        </span>
      </div>
    </div>

    <nav class="py-2 flex-1 px-3 space-y-1 overflow-y-auto">
      <!-- Menu dành riêng cho Độc Giả -->
      <template v-if="auth.isDocGia">
        <RouterLink
          to="/reader"
          class="block px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-hover hover:text-white"
          active-class="bg-primary text-white font-semibold"
        >
          <span>Cổng Dịch Vụ Độc Giả</span>
        </RouterLink>
      </template>

      <!-- Menu dành cho Thủ Thư và Admin -->
      <template v-else>
        <template v-if="auth.isAdmin">
          <RouterLink
            to="/admin"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover hover:text-white transition"
            active-class="bg-primary text-white font-semibold"
          >
            <span>Trang chủ</span>
          </RouterLink>
          <RouterLink
            to="/nhanvien"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover hover:text-white transition"
            active-class="bg-primary text-white font-semibold"
          >
            <span>Quản lý nhân viên</span>
          </RouterLink>
        </template>

        <RouterLink
          to="/theodoimuonsach"
          class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover hover:text-white transition"
          active-class="bg-primary text-white font-semibold"
        >
          <span>Quản Lý Mượn Sách</span>
        </RouterLink>
        <RouterLink
          to="/sach"
          class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover hover:text-white transition"
          active-class="bg-primary text-white font-semibold"
        >
          <span>Quản lý sách</span>
        </RouterLink>
        <RouterLink
          to="/theloai"
          class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover hover:text-white transition"
          active-class="bg-primary text-white font-semibold"
        >
          <span>Quản lý thể loại sách</span>
        </RouterLink>
        <RouterLink
          to="/nhaxuatban"
          class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover hover:text-white transition"
          active-class="bg-primary text-white font-semibold"
        >
          <span>Quản lý nhà xuất bản</span>
        </RouterLink>
        <RouterLink
          to="/docgia"
          class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          active-class="bg-emerald-600 text-white font-semibold"
        >
          <span>Quản lý độc giả</span>
        </RouterLink>
      </template>
    </nav>
  </aside>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
</script>
