import apiService from "./apiService";

class ThongKeService {
  constructor(baseUrl = "/thongke") {
    this.api = apiService;
    this.baseUrl = baseUrl;
  }

  async getTongQuan() {
    return (await this.api.get(`${this.baseUrl}/tong-quan`)).data;
  }
}

export default new ThongKeService();
