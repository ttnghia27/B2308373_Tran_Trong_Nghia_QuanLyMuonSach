const express = require("express");
const router = express.Router();
const {
  getAllSach,
  getSachById,
  createSach,
  updateSach,
  deleteSach,
  deleteAllSach,
} = require("../controllers/sachController");
const {
  authenticate,
  authorizeAdminOrStaff,
} = require("../controllers/authController");

router.use(authenticate);
router.use(authorizeAdminOrStaff);
router.get("/", getAllSach);
router.get("/:id", getSachById);
router.post("/", createSach);
router.put("/:id", updateSach);
router.delete("/:id", deleteSach);
router.delete("/", deleteAllSach);
module.exports = router;
