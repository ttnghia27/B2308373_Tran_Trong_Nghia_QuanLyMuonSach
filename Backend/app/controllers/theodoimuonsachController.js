const TheoDoiMuonSach = require("../models/TheoDoiMuonSach");
const Sach = require("../models/Sach");
const DocGia = require("../models/DocGia");

const getAllTheoDoiMuonSach = async (req, res) => {
  try {
    const TDMSs = await TheoDoiMuonSach.find().sort({
      createdAt: -1,
    });
    res.status(200).json(TDMSs);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể lấy danh sách sách.",
      error: error.message,
    });
  }
};

const getTheoDoiMuonSachById = async (req, res) => {
  try {
    const TDMS = await TheoDoiMuonSach.findById(req.params.id);

    if (!TDMS) {
      return res.status(404).json({
        message: "Lỗi không thể lấy thông tin sách.",
      });
    }

    res.status(200).json(TDMS);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể lấy thông tin sách.",
      error: error.message,
    });
  }
};

const createTheoDoiMuonSach = async (req, res) => {
  try {
    const { MADOCGIA, MASACH, NGAYMUON } = req.body;
    const existingTDMS = await TheoDoiMuonSach.findOne({
      MADOCGIA,
      MASACH,
      ...(NGAYMUON && { NGAYMUON: new Date(NGAYMUON) }),
    });

    if (existingTDMS) {
      return res.status(400).json({ message: "Mã sách đã tồn tại." });
    }

    const newTDMS = new TheoDoiMuonSach(req.body);
    await newTDMS.save();
    res.status(201).json({
      message: "Tạo sách thành công.",
      newTDMS,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể tạo sách.",
      error: error.message,
    });
  }
};

const updateTheoDoiMuonSach = async (req, res) => {
  try {
    const TDMS = await TheoDoiMuonSach.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!TDMS) {
      return res.status(404).json({ message: "Không tìm thấy sách." });
    }

    res.status(200).json({
      message: "Cập nhật sách thành công.",
      TDMS,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi không thể cập nhật sách.",
      error: error.message,
    });
  }
};

const deleteTheoDoiMuonSach = async (req, res) => {
  try {
    const TDMS = await TheoDoiMuonSach.findByIdAndDelete(req.params.id);

    if (!TDMS) {
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

const deleteAllTheoDoiMuonSach = async (req, res) => {
  try {
    const result = await TheoDoiMuonSach.deleteMany({});
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

const muonSach = async (req, res) => {
  try {
    const MADOCGIA = req.body.MADOCGIA?.trim();
    const MASACH = req.body.MASACH?.trim();
    if (!MADOCGIA || !MASACH) {
      return res.status(400).json({
        message: "Vui lòng cung cấp MADOCGIA và MASACH.",
      });
    }

    const docGia = await DocGia.findOne({ MADOCGIA });
    if (!docGia) {
      return res.status(404).json({ message: "Không tìm thấy độc giả." });
    }
    if (!docGia.TRANGTHAI) {
      return res.status(400).json({ message: "Độc giả không hoạt động." });
    }

    const phieuDangMuon = await TheoDoiMuonSach.findOne({
      MADOCGIA,
      MASACH,
      TRANGTHAI: { $in: ["Đang Mượn", "Trễ Hạn"] },
    });
    if (phieuDangMuon) {
      return res.status(400).json({ message: "Độc giả đang mượn sách này." });
    }

    const tonKho = await Sach.updateOne(
      { MASACH, SOQUYEN: { $gt: 0 } },
      { $inc: { SOQUYEN: -1 } },
    );
    if (tonKho.modifiedCount !== 1) {
      return res
        .status(400)
        .json({ message: "Sách không tồn tại hoặc đã hết." });
    }

    let phieu;
    try {
      const NGAYMUON = new Date();
      const NGAYHENTRA = new Date(NGAYMUON);
      NGAYHENTRA.setDate(NGAYHENTRA.getDate() + 14);
      NGAYHENTRA.setHours(0, 0, 0, 0);

      phieu = await TheoDoiMuonSach.create({
        MADOCGIA,
        MASACH,
        NGAYMUON,
        NGAYHENTRA,
        TRANGTHAI: "Đang Mượn",
        TIENPHAT: 0,
      });
    } catch (error) {
      await Sach.updateOne({ MASACH }, { $inc: { SOQUYEN: 1 } });
      throw error;
    }

    return res.status(201).json({ message: "Mượn sách thành công.", phieu });
  } catch (error) {
    return res.status(500).json({
      message: "Không thể tạo phiếu mượn.",
      error: error.message,
    });
  }
};

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const TIEN_PHAT_MOI_NGAY = 5000;

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const traSach = async (req, res) => {
  try {
    const phieu = await TheoDoiMuonSach.findOne({
      _id: req.params.id,
      TRANGTHAI: { $in: ["Đang Mượn", "Trễ Hạn"] },
      NGAYTRA: null,
    });
    if (!phieu) {
      const exists = await TheoDoiMuonSach.exists({ _id: req.params.id });
      if (exists) {
        return res.status(409).json({ message: "Phiếu này đã được trả." });
      }
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn." });
    }

    const ngayTra = new Date();
    const ngayTre = Math.max(
      0,
      Math.ceil(
        (startOfDay(ngayTra) - startOfDay(new Date(phieu.NGAYHENTRA))) /
          MILLISECONDS_PER_DAY,
      ),
    );

    const tienPhat = ngayTre * TIEN_PHAT_MOI_NGAY;
    const phieuDaTra = await TheoDoiMuonSach.findOneAndUpdate(
      {
        _id: phieu._id,
        TRANGTHAI: { $in: ["Đang Mượn", "Trễ Hạn"] },
        NGAYTRA: null,
      },
      {
        $set: {
          NGAYTRA: ngayTra,
          TRANGTHAI: "Đã Trả",
          TIENPHAT: tienPhat,
        },
      },
      { new: true, runValidators: true },
    );
    if (!phieuDaTra) {
      return res.status(409).json({ message: "Phiếu đang được xử lý trả." });
    }

    const tonKho = await Sach.updateOne(
      { MASACH: phieu.MASACH },
      { $inc: { SOQUYEN: 1 } },
    );
    if (tonKho.modifiedCount !== 1) {
      await TheoDoiMuonSach.updateOne(
        { _id: phieu._id, TRANGTHAI: "Đã Trả", NGAYTRA: ngayTra },
        {
          $set: {
            NGAYTRA: null,
            TRANGTHAI: phieu.TRANGTHAI,
            TIENPHAT: phieu.TIENPHAT,
          },
        },
      );
      return res.status(404).json({
        message: "Không tìm thấy sách để cập nhật tồn kho.",
      });
    }

    return res.json({
      message: "Trả sách thành công.",
      SONGAYTRE: ngayTre,
      TIENPHAT: tienPhat,
      phieu: phieuDaTra,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Không thể trả sách.",
      error: error.message,
    });
  }
};

const getSachTreHan = async (req, res) => {
  try {
    const homNay = new Date();
    homNay.setHours(0, 0, 0, 0);

    await TheoDoiMuonSach.updateMany(
      {
        TRANGTHAI: "Đang Mượn",
        NGAYHENTRA: { $lt: homNay },
        NGAYTRA: null,
      },
      { $set: { TRANGTHAI: "Trễ Hạn" } },
    );

    const phieuTreHan = await TheoDoiMuonSach.find({
      TRANGTHAI: "Trễ Hạn",
      NGAYTRA: null,
    });
    for (const phieu of phieuTreHan) {
      const ngayTre = Math.max(
        0,
        Math.ceil(
          (startOfDay(new Date()) - startOfDay(new Date(phieu.NGAYHENTRA))) /
            MILLISECONDS_PER_DAY,
        ),
      );
      const tienPhat = ngayTre * TIEN_PHAT_MOI_NGAY;
      if (phieu.TIENPHAT !== tienPhat) {
        await TheoDoiMuonSach.updateOne(
          { _id: phieu._id, TRANGTHAI: "Trễ Hạn", NGAYTRA: null },
          { $set: { TIENPHAT: tienPhat } },
        );
      }
    }

    const danhSach = await TheoDoiMuonSach.find({
      TRANGTHAI: "Trễ Hạn",
      NGAYTRA: null,
    }).sort({ NGAYHENTRA: 1 });

    return res.json(danhSach);
  } catch (error) {
    return res.status(500).json({
      message: "Không thể lấy danh sách sách trễ hạn.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllTheoDoiMuonSach,
  getTheoDoiMuonSachById,
  createTheoDoiMuonSach,
  updateTheoDoiMuonSach,
  deleteTheoDoiMuonSach,
  deleteAllTheoDoiMuonSach,
  muonSach,
  traSach,
  getSachTreHan,
};
