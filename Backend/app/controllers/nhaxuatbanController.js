const NhaXuatBan = require("../models/NhaXuatBan");
//done
const getAllNhaXuatBan = async (req, res) => {
  try {
    const NXBs = await NhaXuatBan.find().sort({ createdAt: -1 });
    res.status(200).json(NXBs);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể lấy danh sách nhà xuất bản.",
      error: error.message,
    });
  }
};

const getNhaXuatBanById = async (req, res) => {
  try {
    const NXB = await NhaXuatBan.findById(req.params.id);

    if (!NXB) {
      return res.status(404).json({
        message: "Lỗi không thể lấy thông tin nhà xuất bản.",
      });
    }

    res.status(200).json(NXB);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể lấy thông tin nhà xuất bản.",
      error: error.message,
    });
  }
};

const createNhaXuatBan = async (req, res) => {
  try {
    const { MANXB } = req.body;
    const existingNXB = await NhaXuatBan.findOne({ MANXB });

    if (existingNXB) {
      return res.status(400).json({ message: "Mã nhà xuất bản đã tồn tại." });
    }

    const newNXB = new NhaXuatBan(req.body);
    await newNXB.save();
    res.status(201).json({
      message: "Tạo nhà xuất bản thành công.",
      newNXB,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể tạo nhà xuất bản.",
      error: error.message,
    });
  }
};

const updateNhaXuatBan = async (req, res) => {
  try {
    const NXB = await NhaXuatBan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!NXB) {
      return res.status(404).json({ message: "Không tìm thấy nhà xuất bản." });
    }

    res.status(200).json({
      message: "Cập nhật nhà xuất bản thành công.",
      NXB,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể cập nhật nhà xuất bản.",
      error: error.message,
    });
  }
};

const deleteNhaXuatBan = async (req, res) => {
  try {
    const NXB = await NhaXuatBan.findByIdAndDelete(req.params.id);

    if (!NXB) {
      return res.status(404).json({
        message: "Lỗi không tìm thấy nhà xuất bản.",
      });
    }

    res.status(200).json({
      message: "Xóa thành công nhà xuất bản.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể xóa nhà xuất bản.",
      error: error.message,
    });
  }
};

const deleteAllNhaXuatBan = async (req, res) => {
  try {
    const result = await NhaXuatBan.deleteMany({});
    res.status(200).json({
      message: `Đã xóa ${result.deletedCount} nhà xuất bản.`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể xóa tất cả nhà xuất bản.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllNhaXuatBan,
  getNhaXuatBanById,
  createNhaXuatBan,
  updateNhaXuatBan,
  deleteNhaXuatBan,
  deleteAllNhaXuatBan,
};
