import apiService from "./apiService";

class TheLoaiService {
  constructor(baseUrl = "/theloai") {
    this.api = apiService;
    this.baseUrl = baseUrl;
  }

  async getAllTheLoai() {
    return (await this.api.get(this.baseUrl)).data;
  }

  async getTheLoaiById(id) {
    return (await this.api.get(`${this.baseUrl}/${id}`)).data;
  }

  async createTheLoai(data) {
    return (await this.api.post(this.baseUrl, data)).data;
  }

  async updateTheLoai(id, data) {
    return (await this.api.put(`${this.baseUrl}/${id}`, data)).data;
  }

  async deleteTheLoai(id) {
    return (await this.api.delete(`${this.baseUrl}/${id}`)).data;
  }

  async deleteAllTheLoai() {
    return (await this.api.delete(this.baseUrl)).data;
  }
}
export default new TheLoaiService();
