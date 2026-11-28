import apiService from "./apiService";

const authService = {
  // Đăng nhập Nhân Viên / Admin
  async login(credentials) {
    const response = await apiService.post("/auth/login", credentials);
    return response.data;
  },

  // Đăng nhập Độc Giả
  async loginDocGia(credentials) {
    const response = await apiService.post("/auth/docgia/login", credentials);
    return response.data;
  },

  // Đăng ký Độc Giả mới
  async registerDocGia(data) {
    const response = await apiService.post("/auth/docgia/register", data);
    return response.data;
  },

  // Lấy thông tin tài khoản hiện tại
  async getMe() {
    const response = await apiService.get("/auth/me");
    return response.data;
  },
};

export default authService;
