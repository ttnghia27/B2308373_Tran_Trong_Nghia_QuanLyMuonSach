import apiService from "./apiService";

class TheoDoiMuonSachService {
  constructor(baseUrl = "/theodoimuonsach") {
    this.api = apiService;
    this.baseUrl = baseUrl;
  }

  // Độc giả gửi yêu cầu mượn sách trực tuyến (chờ duyệt)
  async yeuCauMuon(data) {
    return (await this.api.post(`${this.baseUrl}/yeu-cau`, data)).data;
  }

  // Độc giả xem danh sách phiếu mượn của mình
  async getMyLoans() {
    return (await this.api.get(`${this.baseUrl}/cua-toi`)).data;
  }

  // Thủ thư duyệt mượn
  async duyetMuon(id) {
    return (await this.api.put(`${this.baseUrl}/${id}/duyet`)).data;
  }

  // Thủ thư từ chối mượn
  async tuChoiMuon(id, data = {}) {
    return (await this.api.put(`${this.baseUrl}/${id}/tu-choi`, data)).data;
  }

  // Thủ thư lập phiếu mượn trực tiếp tại quầy
  async muonSach(data) {
    return (await this.api.post(`${this.baseUrl}/muon`, data)).data;
  }

  // Trả sách kèm số tiền phạt trễ hạn + phạt hư hại sách
  async traSach(id, data = {}) {
    if (!id) throw new Error("Thiếu id phiếu mượn");
    return (await this.api.put(`${this.baseUrl}/${id}/tra`, data)).data;
  }

  async getSachTreHan(params = {}) {
    return (await this.api.get(`${this.baseUrl}/tre-han`, { params })).data;
  }

  async getAllTheoDoiMuonSach(params = {}) {
    return (await this.api.get(this.baseUrl, { params })).data;
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
