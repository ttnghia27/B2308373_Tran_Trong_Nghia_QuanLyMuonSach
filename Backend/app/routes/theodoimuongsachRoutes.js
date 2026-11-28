const express = require("express");
const router = express.Router();
const {
  getAllTheoDoiMuonSach,
  getMyLoans,
  getTheoDoiMuonSachById,
  yeuCauMuonSach,
  duyetMuonSach,
  tuChoiMuonSach,
  createTheoDoiMuonSach,
  updateTheoDoiMuonSach,
  deleteTheoDoiMuonSach,
  deleteAllTheoDoiMuonSach,
  muonSach,
  traSach,
  getSachTreHan,
} = require("../controllers/theodoimuonsachController");
const {
  authenticate,
  authorizeAdminOrStaff,
  authorizeAdmin,
} = require("../controllers/authController");

// Tất cả các route đều yêu cầu đăng nhập
router.use(authenticate);

// Route dành cho Độc Giả:
// 1. Độc giả gửi yêu cầu mượn sách trực tuyến (trạng thái Chờ Duyệt)
router.post("/yeu-cau", yeuCauMuonSach);
// 2. Độc giả xem danh sách phiếu mượn của chính mình
router.get("/cua-toi", getMyLoans);
// 3. Độc giả CÓ THỂ TRẢ SÁCH của chính mình (và Thủ thư cũng dùng endpoint này để nhận trả)
router.put("/:id/tra", traSach);

// Các route bên dưới dành riêng cho Nhân Viên và Admin:
router.use(authorizeAdminOrStaff);

router.get("/tre-han", getSachTreHan);
router.post("/muon", muonSach);
router.put("/:id/duyet", duyetMuonSach);
router.put("/:id/tu-choi", tuChoiMuonSach);

router.get("/", getAllTheoDoiMuonSach);
router.get("/:id", getTheoDoiMuonSachById);
router.post("/", createTheoDoiMuonSach);
router.put("/:id", updateTheoDoiMuonSach);

// Chỉ Admin mới được xóa phiếu mượn
router.delete("/:id", authorizeAdmin, deleteTheoDoiMuonSach);
router.delete("/", authorizeAdmin, deleteAllTheoDoiMuonSach);

module.exports = router;
