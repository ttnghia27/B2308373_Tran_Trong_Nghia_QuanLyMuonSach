import apiService from "./apiService";

class ThongKeService {
  constructor(baseUrl = "/thongke") {
    this.api = apiService;
    this.baseUrl = baseUrl;
  }

  async getTongQuan() {
    return (await this.api.get(`${this.baseUrl}/tong-quan`)).data;
  }

  async getThuTheoThoiGian(params) {
    return (
      await this.api.get(`${this.baseUrl}/thu-theo-thoi-gian`, { params })
    ).data;
  }
}

export default new ThongKeService();
