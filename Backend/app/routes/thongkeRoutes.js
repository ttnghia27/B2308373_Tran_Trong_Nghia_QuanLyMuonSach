const express = require("express");
const router = express.Router();
const { getThongKeTongQuan } = require("../controllers/thongkeController");
const {
  authenticate,
  authorizeAdminOrStaff,
} = require("../controllers/authController");

router.use(authenticate);
router.use(authorizeAdminOrStaff);

router.get("/tong-quan", getThongKeTongQuan);

module.exports = router;
