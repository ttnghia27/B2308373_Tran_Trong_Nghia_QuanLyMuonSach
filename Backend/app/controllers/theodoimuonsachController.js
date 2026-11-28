const TheoDoiMuonSach = require("../models/TheoDoiMuonSach");
const Sach = require("../models/Sach");
const DocGia = require("../models/DocGia");

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const TIEN_PHAT_MOI_NGAY = 5000; // 5.000 VNĐ / ngày trễ hạn

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const sendServerError = (res, error, message) =>
  res.status(500).json({ message, error: error.message });

const attachRelatedInfo = async (
  records,
  bookFields,
  includeMissingInfo = true,
) => {
  const [docGiaList, sachList] = await Promise.all([
    DocGia.find({}),
    Sach.find({}),
  ]);
  const docGiaMap = new Map(
    docGiaList.map((dg) => [
      dg.MADOCGIA,
      {
        HOTEN: `${dg.HOLOT || ""} ${dg.TEN || ""}`.trim(),
        DIENTHOAI: dg.DIENTHOAI,
      },
    ]),
  );
  const sachMap = new Map(sachList.map((sach) => [sach.MASACH, sach]));

  return records.map((item) => {
    const obj = item.toObject();
    const docGiaInfo = docGiaMap.get(obj.MADOCGIA);
    const sach = sachMap.get(obj.MASACH);

    if (docGiaInfo || includeMissingInfo) {
      obj.DOCGIA_INFO = docGiaInfo || null;
    }
    if (sach || includeMissingInfo) {
      obj.SACH_INFO = sach
        ? Object.fromEntries(
            bookFields.map((field) => [
              field,
              field === "HINHANH" ? sach.HINHAH || sach.HINHANH : sach[field],
            ]),
          )
        : null;
    }
    return obj;
  });
};

const getAllTheoDoiMuonSach = async (req, res) => {
  try {
    const { trangthai, madocgia, masach, search } = req.query;
    const filter = {};

    if (trangthai) {
      filter.TRANGTHAI = trangthai;
    }
    if (madocgia) {
      filter.MADOCGIA = { $regex: madocgia, $options: "i" };
    }
    if (masach) {
      filter.MASACH = { $regex: masach, $options: "i" };
    }
    if (search) {
      filter.$or = [
        { MADOCGIA: { $regex: search, $options: "i" } },
        { MASACH: { $regex: search, $options: "i" } },
      ];
    }

    const TDMSs = await TheoDoiMuonSach.find(filter).sort({ createdAt: -1 });
    const result = await attachRelatedInfo(TDMSs, [
      "TENSACH",
      "DONGIA",
      "TIENCOC",
      "HINHANH",
    ]);
    res.status(200).json(result);
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Lỗi không thể lấy danh sách mượn sách.",
    );
  }
};

const getTheoDoiMuonSachById = async (req, res) => {
  try {
    const TDMS = await TheoDoiMuonSach.findById(req.params.id);
    if (!TDMS) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn." });
    }

    const [result] = await attachRelatedInfo(
      [TDMS],
      ["TENSACH", "DONGIA", "TIENCOC"],
      false,
    );
    res.status(200).json(result);
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Lỗi không thể lấy thông tin phiếu mượn.",
    );
  }
};

const createTheoDoiMuonSach = async (req, res) => {
  try {
    const { MADOCGIA, MASACH, NGAYMUON } = req.body;
    const existingTDMS = await TheoDoiMuonSach.findOne({
      MADOCGIA,
      MASACH,
      TRANGTHAI: { $in: ["Đang Mượn", "Trễ Hạn"] },
    });

    if (existingTDMS) {
      return res
        .status(400)
        .json({ message: "Độc giả đang mượn sách này chưa trả." });
    }

    const newTDMS = new TheoDoiMuonSach(req.body);
    await newTDMS.save();
    res.status(201).json({
      message: "Tạo phiếu mượn thành công.",
      newTDMS,
    });
  } catch (error) {
    return sendServerError(res, error, "Lỗi không thể tạo phiếu mượn.");
  }
};

const updateTheoDoiMuonSach = async (req, res) => {
  try {
    const TDMS = await TheoDoiMuonSach.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!TDMS) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn." });
    }

    res.status(200).json({
      message: "Cập nhật phiếu mượn thành công.",
      TDMS,
    });
  } catch (error) {
    return sendServerError(res, error, "Lỗi không thể cập nhật phiếu mượn.");
  }
};

const deleteTheoDoiMuonSach = async (req, res) => {
  try {
    const TDMS = await TheoDoiMuonSach.findById(req.params.id);
    if (!TDMS) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn." });
    }

    // Nếu phiếu đang mượn mà bị xóa -> hoàn trả lại tồn kho sách
    if (TDMS.TRANGTHAI === "Đang Mượn" || TDMS.TRANGTHAI === "Trễ Hạn") {
      await Sach.updateOne({ MASACH: TDMS.MASACH }, { $inc: { SOQUYEN: 1 } });
    }

    await TheoDoiMuonSach.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Xóa thành công phiếu mượn." });
  } catch (error) {
    return sendServerError(res, error, "Lỗi không thể xóa phiếu mượn.");
  }
};

const deleteAllTheoDoiMuonSach = async (req, res) => {
  try {
    const result = await TheoDoiMuonSach.deleteMany({});
    res.status(200).json({
      message: `Đã xóa ${result.deletedCount} phiếu mượn.`,
    });
  } catch (error) {
    return sendServerError(res, error, "Lỗi không thể xóa tất cả phiếu mượn.");
  }
};

const muonSach = async (req, res) => {
  try {
    const MADOCGIA = req.body.MADOCGIA?.trim();
    const MASACH = req.body.MASACH?.trim();
    const soNgayMuon =
      req.body.SONGAYMUON === undefined ? 14 : Number(req.body.SONGAYMUON);

    if (!MADOCGIA || !MASACH) {
      return res.status(400).json({
        message: "Vui lòng cung cấp Mã độc giả và Mã sách.",
      });
    }
    if (!Number.isInteger(soNgayMuon) || soNgayMuon <= 0) {
      return res.status(400).json({ message: "Thời hạn mượn không hợp lệ." });
    }

    const docGia = await DocGia.findOne({ MADOCGIA });
    if (!docGia) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy độc giả trong hệ thống." });
    }
    if (docGia.TRANGTHAI === false || docGia.TRANGTHAI === "KhoaThe") {
      return res.status(400).json({
        message: "Thẻ độc giả hiện đang bị khóa hoặc không hoạt động.",
      });
    }

    const phieuDangMuon = await TheoDoiMuonSach.findOne({
      MADOCGIA,
      MASACH,
      TRANGTHAI: { $in: ["Đang Mượn", "Trễ Hạn"] },
    });
    if (phieuDangMuon) {
      return res
        .status(400)
        .json({ message: "Độc giả đang mượn cuốn sách này chưa trả." });
    }

    const sach = await Sach.findOne({ MASACH });
    if (!sach) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sách trong kho." });
    }
    if (sach.SOQUYEN <= 0) {
      return res
        .status(400)
        .json({ message: `Sách '${sach.TENSACH}' đã hết quyển trong kho.` });
    }

    // Tiền cọc sách: ưu tiên TIENCOC của sách, nếu không thì lấy DONGIA hoặc mặc định 50.000đ
    const tienCoc = Number(sach.TIENCOC) || Number(sach.DONGIA) || 50000;

    const ngayMuon = new Date();
    const ngayHenTra = new Date(ngayMuon);
    ngayHenTra.setDate(ngayHenTra.getDate() + soNgayMuon);
    ngayHenTra.setHours(23, 59, 59, 999);

    const tonKho = await Sach.updateOne(
      { MASACH, SOQUYEN: { $gt: 0 } },
      { $inc: { SOQUYEN: -1 } },
    );
    if (tonKho.modifiedCount !== 1) {
      return res
        .status(400)
        .json({ message: "Sách không tồn tại hoặc vừa hết." });
    }

    let phieu;
    try {
      phieu = await TheoDoiMuonSach.create({
        MADOCGIA,
        MASACH,
        NGAYMUON: ngayMuon,
        NGAYHENTRA: ngayHenTra,
        TRANGTHAI: "Đang Mượn",
        TIENCOC: tienCoc,
        TIENPHAT: 0,
      });
    } catch (error) {
      await Sach.updateOne({ MASACH }, { $inc: { SOQUYEN: 1 } });
      throw error;
    }

    return res.status(201).json({
      message: "Lập phiếu mượn sách thành công.",
      phieu,
    });
  } catch (error) {
    return sendServerError(res, error, "Không thể tạo phiếu mượn.");
  }
};

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
        return res
          .status(409)
          .json({ message: "Phiếu này đã được trả trước đó." });
      }
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn." });
    }

    const ngayTra = new Date();
    const diffMs = startOfDay(ngayTra) - startOfDay(new Date(phieu.NGAYHENTRA));
    const ngayTre = Math.max(0, Math.ceil(diffMs / MILLISECONDS_PER_DAY));

    const tienCoc = Number(phieu.TIENCOC) || 0;
    let tienPhat = 0;
    let tichThuCoc = false;

    // QUY TẮC MỚI: Nếu vượt quá 30 ngày trễ hạn -> Tịch thu tiền cọc mượn sách!
    if (ngayTre > 30) {
      tichThuCoc = true;
      tienPhat = tienCoc > 0 ? tienCoc : 100000;
    } else if (ngayTre > 0) {
      tienPhat = ngayTre * TIEN_PHAT_MOI_NGAY;
    }

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

    // Hoàn trả 1 quyển sách vào kho
    await Sach.updateOne({ MASACH: phieu.MASACH }, { $inc: { SOQUYEN: 1 } });

    return res.json({
      message: tichThuCoc
        ? "Trả sách thành công (Lưu ý: Quá 30 ngày trễ - Đã tịch thu tiền cọc mượn sách)."
        : ngayTre > 0
          ? `Trả sách thành công. Trễ ${ngayTre} ngày, số tiền phạt: ${tienPhat.toLocaleString("vi-VN")} đ.`
          : "Trả sách đúng hạn thành công. Hoàn trả cọc cho độc giả.",
      TIENPHAT: tienPhat,
      TIENCOC: tienCoc,
      phieu: phieuDaTra,
    });
  } catch (error) {
    return sendServerError(res, error, "Không thể trả sách.");
  }
};

const getSachTreHan = async (req, res) => {
  try {
    const homNay = new Date();
    homNay.setHours(0, 0, 0, 0);

    // Tự động chuyển các phiếu quá hạn sang trạng thái "Trễ Hạn"
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
      const diffMs =
        startOfDay(new Date()) - startOfDay(new Date(phieu.NGAYHENTRA));
      const ngayTre = Math.max(0, Math.ceil(diffMs / MILLISECONDS_PER_DAY));
      const tienCoc = Number(phieu.TIENCOC) || 0;

      let tienPhat = 0;

      if (ngayTre > 30) {
        tienPhat = tienCoc > 0 ? tienCoc : 100000;
      } else {
        tienPhat = ngayTre * TIEN_PHAT_MOI_NGAY;
      }

      await TheoDoiMuonSach.updateOne(
        { _id: phieu._id },
        {
          $set: {
            TIENPHAT: tienPhat,
          },
        },
      );
    }

    const danhSach = await TheoDoiMuonSach.find({
      TRANGTHAI: "Trễ Hạn",
      NGAYTRA: null,
    }).sort({ NGAYHENTRA: 1 });

    const result = await attachRelatedInfo(danhSach, ["TENSACH", "TIENCOC"]);
    return res.json(result);
  } catch (error) {
    return sendServerError(res, error, "Không thể lấy danh sách sách trễ hạn.");
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
