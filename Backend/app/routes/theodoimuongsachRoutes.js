const express = require("express");
const router = express.Router();
const {
  getAllTheoDoiMuonSach,
  getTheoDoiMuonSachById,
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
} = require("../controllers/authController");

router.use(authenticate);
router.use(authorizeAdminOrStaff);

router.get("/tre-han", getSachTreHan);
router.post("/muon", muonSach);
router.put("/:id/tra", traSach);

router.get("/", getAllTheoDoiMuonSach);
router.get("/:id", getTheoDoiMuonSachById);
router.post("/", createTheoDoiMuonSach);
router.put("/:id", updateTheoDoiMuonSach);
router.delete("/:id", deleteTheoDoiMuonSach);
router.delete("/", deleteAllTheoDoiMuonSach);
module.exports = router;
