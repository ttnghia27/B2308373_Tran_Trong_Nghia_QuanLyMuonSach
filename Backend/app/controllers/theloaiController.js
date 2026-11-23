const TheLoai = require("../models/TheLoai");
//done
const getAllTheLoai = async (req, res) => {
  try {
    const TLs = await TheLoai.find().sort({ createdAt: -1 });
    res.status(200).json(TLs);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể lấy danh sách thể loại.",
      error: error.message,
    });
  }
};

const getTheLoaiById = async (req, res) => {
  try {
    const TL = await TheLoai.findById(req.params.id);

    if (!TL) {
      return res.status(404).json({
        message: "Lỗi không thể lấy thông tin thể loại.",
      });
    }

    res.status(200).json(TL);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể lấy thông tin thể loại.",
      error: error.message,
    });
  }
};

const createTheLoai = async (req, res) => {
  try {
    const { MATL } = req.body;
    const existingTL = await TheLoai.findOne({ MATL });

    if (existingTL) {
      return res.status(400).json({ message: "Mã thể loại đã tồn tại." });
    }

    const newTL = new TheLoai(req.body);
    await newTL.save();
    res.status(201).json({
      message: "Tạo thể loại thành công.",
      newTL,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể tạo thể loại.",
      error: error.message,
    });
  }
};

const updateTheLoai = async (req, res) => {
  try {
    const TL = await TheLoai.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!TL) {
      return res.status(404).json({ message: "Không tìm thấy thể loại." });
    }

    res.status(200).json({
      message: "Cập nhật thể loại thành công.",
      TL,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể cập nhật thể loại.",
      error: error.message,
    });
  }
};

const deleteTheLoai = async (req, res) => {
  try {
    const TL = await TheLoai.findByIdAndDelete(req.params.id);

    if (!TL) {
      return res.status(404).json({
        message: "Lỗi không tìm thấy thể loại.",
      });
    }

    res.status(200).json({
      message: "Xóa thành công thể loại.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể xóa thể loại.",
      error: error.message,
    });
  }
};

const deleteAllTheLoai = async (req, res) => {
  try {
    const result = await TheLoai.deleteMany({});
    res.status(200).json({
      message: `Đã xóa ${result.deletedCount} thể loại.`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể xóa tất cả thể loại.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllTheLoai,
  getTheLoaiById,
  createTheLoai,
  updateTheLoai,
  deleteTheLoai,
  deleteAllTheLoai,
};
