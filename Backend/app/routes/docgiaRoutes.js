const express = require("express");
const router = express.Router();
const {
  getAllDocGia,
  getDocGiaById,
  createDocGia,
  updateDocGia,
  deleteDocGia,
  deleteAllDocGia,
} = require("../controllers/docgiaController");
const {
  authenticate,
  authorizeAdminOrStaff,
} = require("../controllers/authController");

router.use(authenticate);
router.use(authorizeAdminOrStaff);
router.get("/", getAllDocGia);
router.get("/:id", getDocGiaById);
router.post("/", createDocGia);
router.put("/:id", updateDocGia);
router.delete("/:id", deleteDocGia);
router.delete("/", deleteAllDocGia);
module.exports = router;
