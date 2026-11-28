const express = require("express");
const router = express.Router();
const {
  getAllNhaXuatBan,
  getNhaXuatBanById,
  createNhaXuatBan,
  updateNhaXuatBan,
  deleteNhaXuatBan,
  deleteAllNhaXuatBan,
} = require("../controllers/nhaxuatbanController");
const {
  authenticate,
  authorizeAdminOrStaff,
  authorizeAdmin,
} = require("../controllers/authController");

router.use(authenticate);

// Độc giả và Nhân viên đều xem được NXB
router.get("/", getAllNhaXuatBan);
router.get("/:id", getNhaXuatBanById);

router.post("/", authorizeAdminOrStaff, createNhaXuatBan);
router.put("/:id", authorizeAdminOrStaff, updateNhaXuatBan);
router.delete("/:id", authorizeAdmin, deleteNhaXuatBan);
router.delete("/", authorizeAdmin, deleteAllNhaXuatBan);

module.exports = router;
