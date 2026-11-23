const Sach = require("../models/Sach");

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
      return res.status(400).json({ message: "Mã sách đã tồn tại." });
    }

    const newS = new Sach(req.body);
    await newS.save();
    res.status(201).json({
      message: "Tạo sách thành công.",
      newS,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể tạo sách.",
      error: error.message,
    });
  }
};

const updateSach = async (req, res) => {
  try {
    const S = await Sach.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!S) {
      return res.status(404).json({ message: "Không tìm thấy sách." });
    }

    res.status(200).json({
      message: "Cập nhật sách thành công.",
      S,
    });
  } catch (error) {
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
};
