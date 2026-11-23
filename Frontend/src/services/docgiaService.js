import apiService from "./apiService";

class DocGiaService {
  constructor(baseUrl = "/docgia") {
    this.api = apiService;
    this.baseUrl = baseUrl;
  }

  async getAllDocGia() {
    return (await this.api.get(this.baseUrl)).data;
  }

  async getDocGiaById(id) {
    return (await this.api.get(`${this.baseUrl}/${id}`)).data;
  }

  async createDocGia(data) {
    return (await this.api.post(this.baseUrl, data)).data;
  }

  async updateDocGia(id, data) {
    return (await this.api.put(`${this.baseUrl}/${id}`, data)).data;
  }

  async deleteDocGia(id) {
    return (await this.api.delete(`${this.baseUrl}/${id}`)).data;
  }

  async deleteAllDocGia() {
    return (await this.api.delete(this.baseUrl)).data;
  }
}
export default new DocGiaService();
