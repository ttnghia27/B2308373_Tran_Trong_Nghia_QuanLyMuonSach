import apiService from "./apiService";

class SachService {
  constructor(baseUrl = "/sach") {
    this.api = apiService;
    this.baseUrl = baseUrl;
  }

  async getAllSach() {
    return (await this.api.get(this.baseUrl)).data;
  }

  async getSachById(id) {
    return (await this.api.get(`${this.baseUrl}/${id}`)).data;
  }

  async createSach(data) {
    return (await this.api.post(this.baseUrl, data)).data;
  }

  async updateSach(id, data) {
    return (await this.api.put(`${this.baseUrl}/${id}`, data)).data;
  }

  async deleteSach(id) {
    return (await this.api.delete(`${this.baseUrl}/${id}`)).data;
  }

  async deleteAllSach() {
    return (await this.api.delete(this.baseUrl)).data;
  }
}
export default new SachService();
