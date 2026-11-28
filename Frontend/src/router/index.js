import { createWebHistory, createRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

import AdminDashboard from "@/views/Dashboard.vue"; // Admin Dashboard
import DocGia from "@/views/DocGia.vue";
import Login from "@/views/Login.vue";
import NhanVien from "@/views/NhanVien.vue";
import NhaXuatBan from "@/views/NhaXuatBan.vue";
import NotFound from "@/views/NotFound.vue";
import Sach from "@/views/Sach.vue";
import TheLoai from "@/views/TheLoai.vue";
import TheoDoiMuonSach from "@/views/TheoDoiMuonSach.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    redirect: () => {
      const auth = useAuthStore();
      if (!auth.isAuthenticated) return { name: "Login" };
      return auth.isAdmin
        ? { name: "AdminDashboard" }
        : { name: "TheoDoiMuonSach" };
    },
  },
  {
    path: "/admin",
    name: "AdminDashboard",
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/staff",
    redirect: { name: "TheoDoiMuonSach" },
  },
  {
    path: "/sach",
    name: "Sach",
    component: Sach,
    meta: { requiresAuth: true },
  },
  {
    path: "/docgia",
    name: "DocGia",
    component: DocGia,
    meta: { requiresAuth: true },
  },
  {
    path: "/nhanvien",
    name: "NhanVien",
    component: NhanVien,
    meta: { requiresAuth: true, requiresAdmin: true }, // Chỉ Admin mới được vào
  },
  {
    path: "/nhaxuatban",
    name: "NhaXuatBan",
    component: NhaXuatBan,
    meta: { requiresAuth: true },
  },
  {
    path: "/theloai",
    name: "TheLoai",
    component: TheLoai,
    meta: { requiresAuth: true },
  },
  {
    path: "/theodoimuonsach",
    name: "TheoDoiMuonSach",
    component: TheoDoiMuonSach,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
    meta: { hideHeader: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (auth.token && !auth.isNhanVienLoaded) {
    try {
      await auth.fetchCurrentNhanVien();
    } catch (error) {
      console.error("Không thể khôi phục phiên đăng nhập:", error);
      auth.logout();
    }
  }

  // 1. Chưa đăng nhập mà vào route yêu cầu Auth
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: "Login",
      query: { redirect: to.fullPath },
    };
  }

  // 2. Đã đăng nhập nhưng cố vào trang Login
  if (to.name === "Login" && auth.isAuthenticated) {
    return auth.isAdmin
      ? { name: "AdminDashboard" }
      : { name: "TheoDoiMuonSach" };
  }

  // 3. Nhân viên cố vào route chỉ dành riêng cho Admin
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: "TheoDoiMuonSach" };
  }

  return true;
});

export default router;
