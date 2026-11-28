const Sach = require("../models/Sach");
const fs = require("fs").promises;
const multer = require("multer");
const path = require("path");
const { randomUUID } = require("crypto");

const imageExtensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "..", "uploads"),
    filename: (req, file, callback) => {
      callback(null, `${randomUUID()}${imageExtensions[file.mimetype]}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!imageExtensions[file.mimetype]) {
      return callback(new Error("Ảnh bìa chỉ hỗ trợ định dạng JPG, PNG hoặc WEBP."));
    }
    callback(null, true);
  },
});
const uploadCover = (req, res, next) => {
  upload.single("cover")(req, res, (error) => {
    if (error) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "Ảnh bìa không được vượt quá 5 MB."
          : error.message;
      return res.status(400).json({ message });
    }
    next();
  });
};

const removeUploadedFile = async (file) => {
  if (!file) return;
  try {
    await fs.unlink(file.path);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Không thể dọn ảnh bìa tải lên:", error);
    }
  }
};

const getAllSach = async (req, res) => {
  try {
    const Ss = await Sach.find().sort({ createdAt: -1 });
    res.status(200).json(Ss);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể lấy danh sách sách.",
      error: error.message,
    });
  }
};

const getSachById = async (req, res) => {
  try {
    const S = await Sach.findById(req.params.id);

    if (!S) {
      return res.status(404).json({
        message: "Lỗi không thể lấy thông tin sách.",
      });
    }

    res.status(200).json(S);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể lấy thông tin sách.",
      error: error.message,
    });
  }
};

const createSach = async (req, res) => {
  try {
    const { MASACH } = req.body;
    const existingSach = await Sach.findOne({ MASACH });

    if (existingSach) {
      await removeUploadedFile(req.file);
      return res.status(400).json({ message: "Mã sách đã tồn tại." });
    }

    const newSachData = { ...req.body };
    if (req.file) newSachData.HINHAH = `/uploads/${req.file.filename}`;

    const newS = new Sach(newSachData);
    await newS.save();
    res.status(201).json({
      message: "Tạo sách thành công.",
      newS,
    });
  } catch (error) {
    await removeUploadedFile(req.file);
    res.status(500).json({
      message: "Lỗi không thể tạo sách.",
      error: error.message,
    });
  }
};

const updateSach = async (req, res) => {
  try {
    const updatedSachData = { ...req.body };
    if (req.file) updatedSachData.HINHAH = `/uploads/${req.file.filename}`;

    const S = await Sach.findByIdAndUpdate(req.params.id, updatedSachData, {
      new: true,
      runValidators: true,
    });

    if (!S) {
      await removeUploadedFile(req.file);
      return res.status(404).json({ message: "Không tìm thấy sách." });
    }

    res.status(200).json({
      message: "Cập nhật sách thành công.",
      S,
    });
  } catch (error) {
    await removeUploadedFile(req.file);
    res.status(500).json({
      message: "Lỗi không thể cập nhật sách.",
      error: error.message,
    });
  }
};

const deleteSach = async (req, res) => {
  try {
    const S = await Sach.findByIdAndDelete(req.params.id);

    if (!S) {
      return res.status(404).json({ message: "Lỗi không tìm thấy sách." });
    }

    res.status(200).json({
      message: "Xóa thành công sách.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể xóa sách.",
      error: error.message,
    });
  }
};

const deleteAllSach = async (req, res) => {
  try {
    const result = await Sach.deleteMany({});
    res.status(200).json({
      message: `Đã xóa ${result.deletedCount} sách.`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể xóa tất cả sách.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllSach,
  getSachById,
  createSach,
  updateSach,
  deleteSach,
  deleteAllSach,
  uploadCover,
};
