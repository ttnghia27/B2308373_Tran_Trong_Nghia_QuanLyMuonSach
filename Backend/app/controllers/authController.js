const jwt = require("jsonwebtoken");
const NhanVien = require("../models/NhanVien");

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        message: "Không tìm thấy token xác thực",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const nhanVien = await NhanVien.findById(decoded.id).select("-PASSWORD");

    if (!nhanVien) {
      return res.status(401).json({
        message: "Token không hợp lệ",
      });
    }

    req.NhanVien = nhanVien;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

const getUser = async (req, res) => {
  try {
    const nhanVien = req.NhanVien;

    if (!nhanVien) {
      return res.status(404).json({
        message: "Không tìm thấy thông tin nhân viên",
      });
    }

    return res.status(200).json({
      message: "Lấy thông tin thành công",
      data: nhanVien,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (!req.NhanVien || req.NhanVien.CHUCVU !== "Admin") {
    return res.status(403).json({
      message: "Không có quyền Admin",
    });
  }
  next();
};

const authorizeAdminOrStaff = (req, res, next) => {
  if (
    !req.NhanVien ||
    (req.NhanVien.CHUCVU !== "Admin" && req.NhanVien.CHUCVU !== "Nhân Viên")
  ) {
    return res.status(403).json({
      message: "Không có quyền nhân viên",
    });
  }
  next();
};

module.exports = {
  authenticate,
  authorizeAdmin,
  authorizeAdminOrStaff,
  getUser,
};
