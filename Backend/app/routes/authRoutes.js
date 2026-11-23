const express = require("express");
const router = express.Router();
const { loginNhanVien } = require("../controllers/nhanvienController");
const { authenticate, getUser } = require("../controllers/authController");

router.post("/login", loginNhanVien);
router.get("/me", authenticate, getUser);

module.exports = router;
