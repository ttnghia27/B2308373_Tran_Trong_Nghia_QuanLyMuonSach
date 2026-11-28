<template>
  <aside
    class="w-64 bg-sidebar text-white min-h-screen flex flex-col shadow-xl select-none shrink-0"
  >
    <!-- Brand / Logo -->
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

    <!-- User Badge -->
    <div
      class="p-4 mx-3 my-3 bg-sidebar-user border border-sidebar-user-border flex items-center gap-3"
    >
      <div class="flex items-center justify-between gap-2 min-w-0 flex-1">
        <p class="font-bold tracking-wider text-xs">
          {{ auth.nhanVien?.HOTENNV || "Nhân viên" }}
        </p>
        <span
          class="shrink-0 font-bold tracking-wider text-xs px-2 text-[10px] uppercase"
        >
          {{ auth.nhanVien?.CHUCVU || "Nhân Viên" }}
        </span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="py-2 flex-1 px-3 space-y-1 overflow-y-auto">
      <template v-if="auth.isAdmin">
        <RouterLink
          to="/admin"
          class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover hover:text-white transition"
          active-class="bg-primary text-white font-semibold"
        >
          Dashboard
        </RouterLink>
        <RouterLink
          to="/nhanvien"
          class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover hover:text-white transition"
          active-class="bg-primary text-white font-semibold"
        >
          Quản lý nhân viên
        </RouterLink>
      </template>

      <RouterLink
        to="/theodoimuonsach"
        class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover hover:text-white transition"
        active-class="bg-primary text-white font-semibold"
      >
        Quản Lý Theo Dõi Mượn Sách
      </RouterLink>
      <RouterLink
        to="/sach"
        class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover hover:text-white transition"
        active-class="bg-primary text-white font-semibold"
      >
        Quản lý sách
      </RouterLink>
      <RouterLink
        to="/theloai"
        class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover hover:text-white transition"
        active-class="bg-primary text-white font-semibold"
      >
        Quản lý thể loại sách
      </RouterLink>
      <RouterLink
        to="/nhaxuatban"
        class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-hover hover:text-white transition"
        active-class="bg-primary text-white font-semibold"
      >
        Quản lý nhà xuất bản
      </RouterLink>
      <RouterLink
        to="/docgia"
        class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
        active-class="bg-emerald-600 text-white font-semibold"
      >
        Quản lý độc giả
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
</script>
