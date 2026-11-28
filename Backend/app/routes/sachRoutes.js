const express = require("express");
const router = express.Router();
const {
  getAllSach,
  getSachById,
  createSach,
  updateSach,
  deleteSach,
  deleteAllSach,
  uploadCover,
} = require("../controllers/sachController");
const {
  authenticate,
  authorizeAdminOrStaff,
  authorizeAdmin,
} = require("../controllers/authController");

router.use(authenticate);

// Cả Độc giả và Nhân viên/Admin đều xem được danh sách và chi tiết sách
router.get("/", getAllSach);
router.get("/:id", getSachById);

// Các thao tác thêm, sửa, xóa yêu cầu quyền Nhân viên/Admin
router.post("/", authorizeAdminOrStaff, uploadCover, createSach);
router.put("/:id", authorizeAdminOrStaff, uploadCover, updateSach);
router.delete("/:id", authorizeAdmin, deleteSach);
router.delete("/", authorizeAdmin, deleteAllSach);

module.exports = router;
