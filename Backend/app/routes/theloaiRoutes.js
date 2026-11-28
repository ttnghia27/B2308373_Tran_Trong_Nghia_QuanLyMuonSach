const express = require("express");
const router = express.Router();
const {
  getAllTheLoai,
  getTheLoaiById,
  createTheLoai,
  updateTheLoai,
  deleteTheLoai,
  deleteAllTheLoai,
} = require("../controllers/theloaiController");
const {
  authenticate,
  authorizeAdminOrStaff,
  authorizeAdmin,
} = require("../controllers/authController");

router.use(authenticate);

// Độc giả và Nhân viên đều xem được thể loại
router.get("/", getAllTheLoai);
router.get("/:id", getTheLoaiById);

router.post("/", authorizeAdminOrStaff, createTheLoai);
router.put("/:id", authorizeAdminOrStaff, updateTheLoai);
router.delete("/:id", authorizeAdmin, deleteTheLoai);
router.delete("/", authorizeAdmin, deleteAllTheLoai);

module.exports = router;
