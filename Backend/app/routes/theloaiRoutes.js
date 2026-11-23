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
} = require("../controllers/authController");

router.use(authenticate);
router.use(authorizeAdminOrStaff);
router.get("/", getAllTheLoai);
router.get("/:id", getTheLoaiById);
router.post("/", createTheLoai);
router.put("/:id", updateTheLoai);
router.delete("/:id", deleteTheLoai);
router.delete("/", deleteAllTheLoai);
module.exports = router;
