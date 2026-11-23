const express = require("express");
const router = express.Router();
const {
  getAllNhanVien,
  getNhanVienById,
  createNhanVien,
  updateNhanVien,
  deleteNhanVien,
  deleteAllNhanVien,
} = require("../controllers/nhanvienController");
const {
  authenticate,
  authorizeAdmin,
} = require("../controllers/authController");

router.use(authenticate);
router.use(authorizeAdmin);
router.get("/", getAllNhanVien);
router.get("/:id", getNhanVienById);
router.post("/", createNhanVien);
router.put("/:id", updateNhanVien);
router.delete("/:id", deleteNhanVien);
router.delete("/", deleteAllNhanVien);
module.exports = router;
