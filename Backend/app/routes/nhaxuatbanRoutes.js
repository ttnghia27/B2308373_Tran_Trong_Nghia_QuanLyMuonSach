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
} = require("../controllers/authController");

router.use(authenticate);
router.use(authorizeAdminOrStaff);
router.get("/", getAllNhaXuatBan);
router.get("/:id", getNhaXuatBanById);
router.post("/", createNhaXuatBan);
router.put("/:id", updateNhaXuatBan);
router.delete("/:id", deleteNhaXuatBan);
router.delete("/", deleteAllNhaXuatBan);
module.exports = router;
