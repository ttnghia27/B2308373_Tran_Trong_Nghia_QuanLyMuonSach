import apiService from "./apiService";

class NhanVienService {
  constructor(baseUrl = "/nhanvien") {
    this.api = apiService;
    this.baseUrl = baseUrl;
  }

  async getAllNhanVien() {
    return (await this.api.get(this.baseUrl)).data;
  }

  async getNhanVienById(id) {
    return (await this.api.get(`${this.baseUrl}/${id}`)).data;
  }

  async createNhanVien(data) {
    return (await this.api.post(this.baseUrl, data)).data;
  }

  async updateNhanVien(id, data) {
    return (await this.api.put(`${this.baseUrl}/${id}`, data)).data;
  }

  async deleteNhanVien(id) {
    return (await this.api.delete(`${this.baseUrl}/${id}`)).data;
  }

  async deleteAllNhanVien() {
    return (await this.api.delete(this.baseUrl)).data;
  }
}
export default new NhanVienService();
