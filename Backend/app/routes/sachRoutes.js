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
} = require("../controllers/authController");

router.use(authenticate);
router.use(authorizeAdminOrStaff);
router.get("/", getAllSach);
router.get("/:id", getSachById);
router.post("/", uploadCover, createSach);
router.put("/:id", uploadCover, updateSach);
router.delete("/:id", deleteSach);
router.delete("/", deleteAllSach);
module.exports = router;
