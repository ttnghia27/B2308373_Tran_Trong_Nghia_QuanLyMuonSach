import apiService from "./apiService";

const authService = {
  async login(credentials) {
    const response = await apiService.post("/auth/login", credentials);
    return response.data;
  },

  async getMe() {
    const response = await apiService.get("/auth/me");
    return response.data;
  },
};

export default authService;
