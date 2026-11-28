const express = require("express");
const router = express.Router();
const { loginNhanVien } = require("../controllers/nhanvienController");
const {
  authenticate,
  getUser,
  registerDocGia,
  loginDocGia,
} = require("../controllers/authController");

// Authentication cho Nhân Viên / Admin
router.post("/login", loginNhanVien);

// Authentication cho Độc Giả
router.post("/docgia/register", registerDocGia);
router.post("/docgia/login", loginDocGia);

// Thông tin tài khoản hiện tại (hỗ trợ cả Nhân viên và Độc giả)
router.get("/me", authenticate, getUser);

module.exports = router;
