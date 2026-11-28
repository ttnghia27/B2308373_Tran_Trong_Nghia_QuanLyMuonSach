const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const NhanVien = require("../models/NhanVien");
const DocGia = require("../models/DocGia");

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        message: "Không tìm thấy token xác thực",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kiểm tra nếu là token của Độc Giả
    if (decoded.role === "DocGia") {
      const docGia = await DocGia.findById(decoded.id).select("-PASSWORD");
      if (!docGia) {
        return res.status(401).json({
          message: "Tài khoản độc giả không tồn tại hoặc token không hợp lệ",
        });
      }
      req.DocGia = docGia;
      req.userRole = "DocGia";
      return next();
    }

    // Mặc định là Nhân Viên
    const nhanVien = await NhanVien.findById(decoded.id).select("-PASSWORD");

    if (!nhanVien) {
      return res.status(401).json({
        message: "Token không hợp lệ",
      });
    }

    req.NhanVien = nhanVien;
    req.userRole = nhanVien.CHUCVU;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

const getUser = async (req, res) => {
  try {
    if (req.DocGia) {
      return res.status(200).json({
        message: "Lấy thông tin thành công",
        data: req.DocGia,
        role: "DocGia",
      });
    }

    const nhanVien = req.NhanVien;

    if (!nhanVien) {
      return res.status(404).json({
        message: "Không tìm thấy thông tin tài khoản",
      });
    }

    return res.status(200).json({
      message: "Lấy thông tin thành công",
      data: nhanVien,
      role: nhanVien.CHUCVU,
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

const authorizeDocGia = (req, res, next) => {
  if (!req.DocGia) {
    return res.status(403).json({
      message: "Yêu cầu quyền Độc giả",
    });
  }
  next();
};

// Đăng ký tài khoản cho Độc Giả
const registerDocGia = async (req, res) => {
  try {
    const { HOLOT, TEN, NGAYSINH, PHAI, DIACHI, DIENTHOAI, PASSWORD } = req.body;
    let { MADOCGIA } = req.body;

    if (!HOLOT || !TEN || !NGAYSINH || !DIACHI || !DIENTHOAI || !PASSWORD) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ các trường thông tin bắt buộc.",
      });
    }

    // Kiểm tra số điện thoại
    const existingPhone = await DocGia.findOne({ DIENTHOAI: DIENTHOAI.trim() });
    if (existingPhone) {
      return res.status(400).json({
        message: "Số điện thoại này đã được đăng ký cho độc giả khác.",
      });
    }

    // Tự sinh MADOCGIA nếu chưa có
    if (!MADOCGIA || !MADOCGIA.trim()) {
      let isUnique = false;
      while (!isUnique) {
        const rand = Math.floor(100000 + Math.random() * 900000);
        MADOCGIA = `DG${rand}`;
        const found = await DocGia.findOne({ MADOCGIA });
        if (!found) isUnique = true;
      }
    } else {
      MADOCGIA = MADOCGIA.trim().toUpperCase();
      const existingDG = await DocGia.findOne({ MADOCGIA });
      if (existingDG) {
        return res.status(400).json({ message: "Mã độc giả đã tồn tại." });
      }
    }

    // Mật khẩu lưu trực tiếp không cần hash
    const plainPassword = PASSWORD.trim();

    const newDocGia = new DocGia({
      MADOCGIA,
      HOLOT: HOLOT.trim(),
      TEN: TEN.trim(),
      NGAYSINH,
      PHAI: PHAI || "Nam",
      DIACHI: DIACHI.trim(),
      DIENTHOAI: DIENTHOAI.trim(),
      PASSWORD: plainPassword,
      TRANGTHAI: "HoatDong",
    });

    await newDocGia.save();

    const data = newDocGia.toObject();
    delete data.PASSWORD;

    return res.status(201).json({
      message: "Đăng ký tài khoản độc giả thành công.",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi đăng ký độc giả.",
      error: error.message,
    });
  }
};

// Đăng nhập cho Độc Giả
const loginDocGia = async (req, res) => {
  try {
    const username = (req.body.MADOCGIA || req.body.DIENTHOAI || "").trim();
    const password = req.body.PASSWORD;

    if (!username || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập Mã độc giả (hoặc Số điện thoại) và Mật khẩu.",
      });
    }

    const docGia = await DocGia.findOne({
      $or: [
        { MADOCGIA: username.toUpperCase() },
        { DIENTHOAI: username },
      ],
    });

    if (!docGia) {
      return res.status(401).json({
        message: "Tài khoản độc giả không tồn tại.",
      });
    }

    if (docGia.TRANGTHAI === "KhoaThe") {
      return res.status(403).json({
        message: "Thẻ độc giả của bạn hiện đang bị khóa. Vui lòng liên hệ thủ thư.",
      });
    }

    // So sánh mật khẩu trực tiếp (hỗ trợ cả hash cũ nếu có)
    const isMatch =
      docGia.PASSWORD === password ||
      (docGia.PASSWORD && docGia.PASSWORD.startsWith("$2") && bcrypt.compareSync(password, docGia.PASSWORD));

    if (!isMatch) {
      return res.status(401).json({
        message: "Mật khẩu không chính xác.",
      });
    }

    const token = jwt.sign(
      { id: docGia._id, MADOCGIA: docGia.MADOCGIA, role: "DocGia" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const data = docGia.toObject();
    delete data.PASSWORD;

    return res.status(200).json({
      message: "Đăng nhập độc giả thành công.",
      token,
      data,
      role: "DocGia",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi không thể đăng nhập độc giả.",
      error: error.message,
    });
  }
};

module.exports = {
  authenticate,
  authorizeAdmin,
  authorizeAdminOrStaff,
  authorizeDocGia,
  getUser,
  registerDocGia,
  loginDocGia,
};
