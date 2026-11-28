const express = require("express");
const router = express.Router();
const {
  getThongKeTongQuan,
  getThuTheoThoiGian,
} = require("../controllers/thongkeController");
const {
  authenticate,
  authorizeAdminOrStaff,
} = require("../controllers/authController");

router.use(authenticate);
router.use(authorizeAdminOrStaff);

router.get("/tong-quan", getThongKeTongQuan);
router.get("/thu-theo-thoi-gian", getThuTheoThoiGian);

module.exports = router;
