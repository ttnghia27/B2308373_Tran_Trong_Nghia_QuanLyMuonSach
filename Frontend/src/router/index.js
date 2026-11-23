import { createWebHistory, createRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import Dashboard from "@/views/Dashboard.vue";
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
    component: Dashboard,
    meta: { requiresAuth: true },
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
    meta: { requiresAuth: true, requiresAdmin: true },
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
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return { el: to.hash, behavior: "smooth" };
    }
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

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: "Login",
      query: { redirect: to.fullPath },
    };
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: "Home" };
  }

  if (to.name === "Login" && auth.isAuthenticated) {
    return { name: "Home" };
  }

  return true;
});

export default router;
