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
// Độc giả gửi yêu cầu mượn sách trực tuyến (trạng thái Chờ Duyệt)
router.post("/yeu-cau", yeuCauMuonSach);
// Độc giả xem danh sách phiếu mượn của chính mình
router.get("/cua-toi", getMyLoans);

// Các route bên dưới dành riêng cho Nhân Viên và Admin:
router.use(authorizeAdminOrStaff);

router.get("/tre-han", getSachTreHan);
router.post("/muon", muonSach);
router.put("/:id/duyet", duyetMuonSach);
router.put("/:id/tu-choi", tuChoiMuonSach);
router.put("/:id/tra", traSach);

router.get("/", getAllTheoDoiMuonSach);
router.get("/:id", getTheoDoiMuonSachById);
router.post("/", createTheoDoiMuonSach);
router.put("/:id", updateTheoDoiMuonSach);

// Chỉ Admin mới được xóa phiếu mượn
router.delete("/:id", authorizeAdmin, deleteTheoDoiMuonSach);
router.delete("/", authorizeAdmin, deleteAllTheoDoiMuonSach);

module.exports = router;
