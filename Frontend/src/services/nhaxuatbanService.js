import apiService from "./apiService";

class NhaXuatBanService {
  constructor(baseUrl = "/nhaxuatban") {
    this.api = apiService;
    this.baseUrl = baseUrl;
  }

  async getAllNhaXuatBan() {
    return (await this.api.get(this.baseUrl)).data;
  }

  async getNhaXuatBanById(id) {
    return (await this.api.get(`${this.baseUrl}/${id}`)).data;
  }

  async createNhaXuatBan(data) {
    return (await this.api.post(this.baseUrl, data)).data;
  }

  async updateNhaXuatBan(id, data) {
    return (await this.api.put(`${this.baseUrl}/${id}`, data)).data;
  }

  async deleteNhaXuatBan(id) {
    return (await this.api.delete(`${this.baseUrl}/${id}`)).data;
  }

  async deleteAllNhaXuatBan() {
    return (await this.api.delete(this.baseUrl)).data;
  }
}
export default new NhaXuatBanService();
