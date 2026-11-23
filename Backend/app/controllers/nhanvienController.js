const NhanVien = require("../models/NhanVien");
const jwt = require("jsonwebtoken");
//done
const getAllNhanVien = async (req, res) => {
  try {
    const NVs = await NhanVien.find()
      .sort({ createdAt: -1 })
      .select("-PASSWORD");
    res.status(200).json(NVs);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể lấy danh sách nhân viên.",
      error: error.message,
    });
  }
};

const getNhanVienById = async (req, res) => {
  try {
    const NV = await NhanVien.findById(req.params.id).select("-PASSWORD");

    if (!NV) {
      return res.status(404).json({
        message: "Lỗi không thể lấy thông tin nhân viên.",
      });
    }
    res.status(200).json(NV);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể lấy thông tin nhân viên.",
      error: error.message,
    });
  }
};

const createNhanVien = async (req, res) => {
  try {
    const { MSNV } = req.body;
    const existingNV = await NhanVien.findOne({ MSNV });

    if (existingNV) {
      return res.status(400).json({ message: "Mã nhân viên đã tồn tại." });
    }
    const newNV = new NhanVien(req.body);
    await newNV.save();

    const NVResponse = newNV.toObject();
    delete NVResponse.PASSWORD;

    res.status(201).json({
      message: "Tạo nhân viên thành công.",
      NVResponse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể tạo nhân viên.",
      error: error.message,
    });
  }
};

const updateNhanVien = async (req, res) => {
  try {
    const NV = await NhanVien.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-PASSWORD");

    if (!NV) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên." });
    }
    res.status(200).json({
      message: "Cập nhật nhân viên thành công.",
      NV,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể cập nhật nhân viên.",
      error: error.message,
    });
  }
};

const deleteNhanVien = async (req, res) => {
  try {
    const NV = await NhanVien.findByIdAndDelete(req.params.id);

    if (!NV) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên." });
    }

    res.status(200).json({
      message: "Xóa thành công nhân viên.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể xóa nhân viên.",
      error: error.message,
    });
  }
};

const deleteAllNhanVien = async (req, res) => {
  try {
    const result = await NhanVien.deleteMany({});
    res.status(200).json({
      message: `Đã xóa ${result.deletedCount} nhân viên.`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể xóa tất cả nhân viên.",
      error: error.message,
    });
  }
};

const loginNhanVien = async (req, res) => {
  try {
    const { MSNV, PASSWORD } = req.body;
    const nhanVien = await NhanVien.findOne({ MSNV });

    if (!nhanVien) {
      return res.status(401).json({
        message: "Mã số nhân viên không tồn tại.",
      });
    }

    const isMatch = await nhanVien.comparePassword(PASSWORD);

    if (!isMatch) {
      return res.status(401).json({
        message: "Mật khẩu không chính xác.",
      });
    }

    const token = jwt.sign(
      { id: nhanVien._id, MSNV: nhanVien.MSNV, CHUCVU: nhanVien.CHUCVU },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    const nhanVienResponse = nhanVien.toObject();
    delete nhanVienResponse.PASSWORD;

    res.status(200).json({
      message: "Đăng nhập thành công.",
      token,
      data: nhanVienResponse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể đăng nhập.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllNhanVien,
  getNhanVienById,
  createNhanVien,
  updateNhanVien,
  deleteNhanVien,
  deleteAllNhanVien,
  loginNhanVien,
};
