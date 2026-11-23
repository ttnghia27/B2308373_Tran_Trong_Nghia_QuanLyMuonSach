import { defineStore } from "pinia";
import authService from "../services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    nhanVien: null,
    isNhanVienLoaded: false,
    token: localStorage.getItem("token") || null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.nhanVien),
    isLibrarian: (state) => state.nhanVien?.CHUCVU === "Nhân Viên",
    isAdmin: (state) => state.nhanVien?.CHUCVU === "Admin",
  },

  actions: {
    async fetchCurrentNhanVien() {
      this.isNhanVienLoaded = false;

      if (!this.token) {
        this.nhanVien = null;
        this.isNhanVienLoaded = true;
        return null;
      }

      try {
        const response = await authService.getMe();
        this.nhanVien = response.data;
        return this.nhanVien;
      } catch (error) {
        if (error.response?.status === 401) {
          this.logout();
          return null;
        }

        throw error;
      } finally {
        this.isNhanVienLoaded = true;
      }
    },

    async login(credentials) {
      const response = await authService.login(credentials);

      if (!response.token || !response.data) {
        throw new Error("Phản hồi đăng nhập không hợp lệ.");
      }

      this.token = response.token;
      this.nhanVien = response.data;
      this.isNhanVienLoaded = true;
      localStorage.setItem("token", response.token);

      return this.nhanVien;
    },

    logout() {
      this.token = null;
      this.nhanVien = null;
      this.isNhanVienLoaded = true;
      localStorage.removeItem("token");
    },
  },
});
