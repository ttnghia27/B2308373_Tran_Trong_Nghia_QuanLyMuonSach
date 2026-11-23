import apiService from "./apiService";

class TheoDoiMuonSachService {
  constructor(baseUrl = "/theodoimuonsach") {
    this.api = apiService;
    this.baseUrl = baseUrl;
  }

  async getSachTreHan(params) {
    return (await this.api.get(`${this.baseUrl}/tre-han`, { params })).data;
  }

  async muonSach(data) {
    return (await this.api.post(`${this.baseUrl}/muon`, data)).data;
  }

  async traSach(id, data = {}) {
    if (!id) throw new Error("Thiếu id phiếu mượn");
    return (await this.api.put(`${this.baseUrl}/${id}/tra`, data)).data;
  }

  async getAllTheoDoiMuonSach() {
    return (await this.api.get(this.baseUrl)).data;
  }

  async getTheoDoiMuonSachById(id) {
    return (await this.api.get(`${this.baseUrl}/${id}`)).data;
  }

  async createTheoDoiMuonSach(data) {
    return (await this.api.post(this.baseUrl, data)).data;
  }

  async updateTheoDoiMuonSach(id, data) {
    return (await this.api.put(`${this.baseUrl}/${id}`, data)).data;
  }

  async deleteTheoDoiMuonSach(id) {
    return (await this.api.delete(`${this.baseUrl}/${id}`)).data;
  }

  async deleteAllTheoDoiMuonSach() {
    return (await this.api.delete(this.baseUrl)).data;
  }
}
export default new TheoDoiMuonSachService();
