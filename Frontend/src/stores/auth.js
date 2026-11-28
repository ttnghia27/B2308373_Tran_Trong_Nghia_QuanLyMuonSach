import { defineStore } from "pinia";
import authService from "../services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    role: localStorage.getItem("user_role") || null,
    isUserLoaded: false,
    token: localStorage.getItem("token") || null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
    isAdmin: (state) =>
      state.role === "Admin" || state.user?.CHUCVU === "Admin",
    isStaff: (state) =>
      state.role === "Nhân Viên" || state.user?.CHUCVU === "Nhân Viên",
    isDocGia: (state) =>
      state.role === "DocGia" ||
      (!state.user?.CHUCVU && Boolean(state.user?.MADOCGIA)),
    // Giữ tương thích ngược cho các component dùng auth.nhanVien
    nhanVien: (state) => state.user,
    isNhanVienLoaded: (state) => state.isUserLoaded,
    displayName: (state) => {
      if (!state.user) return "";
      if (state.user.HOTENNV) return state.user.HOTENNV;
      return `${state.user.HOLOT || ""} ${state.user.TEN || ""}`.trim();
    },
  },

  actions: {
    async fetchCurrentUser() {
      this.isUserLoaded = false;

      if (!this.token) {
        this.user = null;
        this.role = null;
        this.isUserLoaded = true;
        return null;
      }

      try {
        const response = await authService.getMe();
        this.user = response.data;
        this.role = response.role || (response.data?.CHUCVU ? response.data.CHUCVU : "DocGia");
        localStorage.setItem("user_role", this.role);
        return this.user;
      } catch (error) {
        if (error.response?.status === 401) {
          this.logout();
          return null;
        }
        throw error;
      } finally {
        this.isUserLoaded = true;
      }
    },

    // Giữ tương thích ngược với fetchCurrentNhanVien
    async fetchCurrentNhanVien() {
      return this.fetchCurrentUser();
    },

    // Đăng nhập Nhân viên / Admin
    async login(credentials) {
      const response = await authService.login(credentials);

      if (!response.token || !response.data) {
        throw new Error("Phản hồi đăng nhập không hợp lệ.");
      }

      this.token = response.token;
      this.user = response.data;
      this.role = response.data.CHUCVU || "Nhân Viên";
      this.isUserLoaded = true;

      localStorage.setItem("token", response.token);
      localStorage.setItem("user_role", this.role);

      return this.user;
    },

    // Đăng nhập Độc Giả
    async loginDocGia(credentials) {
      const response = await authService.loginDocGia(credentials);

      if (!response.token || !response.data) {
        throw new Error("Phản hồi đăng nhập không hợp lệ.");
      }

      this.token = response.token;
      this.user = response.data;
      this.role = "DocGia";
      this.isUserLoaded = true;

      localStorage.setItem("token", response.token);
      localStorage.setItem("user_role", "DocGia");

      return this.user;
    },

    // Đăng ký Độc Giả
    async registerDocGia(userData) {
      return await authService.registerDocGia(userData);
    },

    logout() {
      this.token = null;
      this.user = null;
      this.role = null;
      this.isUserLoaded = true;
      localStorage.removeItem("token");
      localStorage.removeItem("user_role");
    },
  },
});
