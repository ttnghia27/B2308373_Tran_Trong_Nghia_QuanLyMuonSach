const DocGia = require("../models/DocGia");
const TheoDoiMuonSach = require("../models/TheoDoiMuonSach");
const Sach = require("../models/Sach");

const getAllDocGia = async (req, res) => {
  try {
    const DGs = await DocGia.find().sort({ createdAt: -1 });
    res.status(200).json(DGs);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể lấy danh sách độc giả",
      erro: error.message,
    });
  }
};

const getDocGiaById = async (req, res) => {
  try {
    const DG = await DocGia.findById(req.params.id);

    if (!DG) {
      return res.status(404).json({
        message: "Lỗi không thể lấy thông tin độc giả.",
      });
    }

    res.status(200).json(DG);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể lấy thông tin độc giả.",
      error: error.message,
    });
  }
};

const createDocGia = async (req, res) => {
  try {
    const { MADOCGIA } = req.body;
    const existingDG = await DocGia.findOne({ MADOCGIA });

    if (existingDG) {
      return res.status(400).json({ message: "Mã độc giả đã tồn tại." });
    }
    const newDG = new DocGia(req.body);
    await newDG.save();
    res.status(201).json({
      message: "Tạo độc giả thành công.",
      newDG,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể tạo độc giả.",
      error: error.message,
    });
  }
};

const updateDocGia = async (req, res) => {
  try {
    const DG = await DocGia.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!DG) {
      return res.status(404).json({ message: "Không tìm thấy độc giả." });
    }
    res.status(200).json({
      message: "Cập nhật độc giả thành công.",
      DG,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể cập nhật thông tin độc giả.",
      error: error.message,
    });
  }
};

const deleteDocGia = async (req, res) => {
  try {
    const DG = await DocGia.findByIdAndDelete(req.params.id);

    if (!DG) {
      return res.status(404).json({ message: "Không tìm thấy độc giả." });
    }

    res.status(200).json({
      message: "Xóa thành công độc giả.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể xóa độc giả.",
      error: error.message,
    });
  }
};

const deleteAllDocGia = async (req, res) => {
  try {
    const result = await DocGia.deleteMany({});
    res.status(200).json({
      message: `Đã xóa ${result.deletedCount} độc giả.`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể xóa tất cả độc giả.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllDocGia,
  getDocGiaById,
  createDocGia,
  updateDocGia,
  deleteDocGia,
  deleteAllDocGia,
};
