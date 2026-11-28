import apiService from "./apiService";

class SachService {
  constructor(baseUrl = "/sach") {
    this.api = apiService;
    this.baseUrl = baseUrl;
  }

  async getAllSach(params = {}) {
    return (await this.api.get(this.baseUrl, { params })).data;
  }

  async getSachById(id) {
    return (await this.api.get(`${this.baseUrl}/${id}`)).data;
  }

  async createSach(data) {
    return (
      await this.api.post(this.baseUrl, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  }

  async updateSach(id, data) {
    return (
      await this.api.put(`${this.baseUrl}/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  }

  async deleteSach(id) {
    return (await this.api.delete(`${this.baseUrl}/${id}`)).data;
  }

  async deleteAllSach() {
    return (await this.api.delete(this.baseUrl)).data;
  }
}
export default new SachService();
