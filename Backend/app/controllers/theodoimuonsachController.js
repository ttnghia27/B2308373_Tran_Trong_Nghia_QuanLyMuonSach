const TheoDoiMuonSach = require("../models/TheoDoiMuonSach");
const Sach = require("../models/Sach");
const DocGia = require("../models/DocGia");

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TIEN_PHAT_MOI_NGAY = 5000; // 5.000 VNĐ / ngày trễ hạn
const ACTIVE_STATUSES = ["Chờ Duyệt", "Đang Mượn", "Trễ Hạn"];
const TRANG_THAI_MAP = {
  ChoDuyet: "Chờ Duyệt",
  DangMuon: "Đang Mượn",
  DaTra: "Đã Trả",
  TreHan: "Trễ Hạn",
  TuChoi: "Từ Chối",
};

// ==================== HELPERS ====================

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const formatVND = (amount) => `${amount.toLocaleString("vi-VN")} đ`;
const sendServerError = (res, error, message) =>
  res.status(500).json({ message, error: error.message });

const exactCodeFilter = (value) => ({
  $regex: `^${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
  $options: "i",
});

const calcDueDate = (startDate, days) => {
  const due = new Date(startDate);
  due.setDate(due.getDate() + Math.max(1, days));
  due.setHours(23, 59, 59, 999);
  return due;
};

const calcOverdueFine = (ngayHenTra, tienCoc = 0, now = new Date()) => {
  const diffMs = startOfDay(now) - startOfDay(new Date(ngayHenTra));
  const ngayTre = Math.max(0, Math.ceil(diffMs / MS_PER_DAY));
  const tichThuCoc = ngayTre > 30;

  let tienPhatTre = 0;
  if (tichThuCoc) {
    tienPhatTre = tienCoc > 0 ? tienCoc : 100000;
  } else if (ngayTre > 0) {
    tienPhatTre = ngayTre * TIEN_PHAT_MOI_NGAY;
  }

  return { ngayTre, tienPhatTre, tichThuCoc };
};

const restoreStock = (masach) =>
  Sach.updateOne({ MASACH: masach }, { $inc: { SOQUYEN: 1 } });

const deductStock = (masach) =>
  Sach.findOneAndUpdate(
    { MASACH: masach, SOQUYEN: { $gt: 0 } },
    { $inc: { SOQUYEN: -1 } },
    { new: true },
  );

const attachRelatedInfo = async (
  records,
  bookFields,
  includeMissingInfo = true,
) => {
  if (!records.length) return [];

  const docGiaIds = [...new Set(records.map((r) => r.MADOCGIA))];
  const sachIds = [...new Set(records.map((r) => r.MASACH))];

  const [docGiaList, sachList] = await Promise.all([
    DocGia.find({ MADOCGIA: { $in: docGiaIds } }),
    Sach.find({ MASACH: { $in: sachIds } }),
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
  const sachMap = new Map(sachList.map((s) => [s.MASACH, s]));

  return records.map((item) => {
    const obj = item.toObject();
    const docGiaInfo = docGiaMap.get(obj.MADOCGIA) || null;
    const sach = sachMap.get(obj.MASACH);

    if (docGiaInfo || includeMissingInfo) {
      obj.DOCGIA_INFO = docGiaInfo;
    }
    if (sach || includeMissingInfo) {
      obj.SACH_INFO = sach
        ? Object.fromEntries(
            bookFields.map((f) => [
              f,
              f === "HINHANH" ? sach.HINHAH || sach.HINHANH : sach[f],
            ]),
          )
        : null;
    }
    return obj;
  });
};

// Dùng chung kiểm tra đầu vào cho cả yêu cầu mượn và mượn trực tiếp tại quầy
const validateBorrowRequest = async (rawDocGiaId, rawSachId, rawSoNgayMuon) => {
  const MADOCGIA = (rawDocGiaId || "").trim().toUpperCase();
  const MASACH = (rawSachId || "").trim().toUpperCase();
  const soNgayMuon = rawSoNgayMuon === undefined ? 14 : Number(rawSoNgayMuon);

  if (!MADOCGIA || !MASACH) {
    return {
      error: {
        status: 400,
        message: "Vui lòng cung cấp Mã độc giả và Mã sách.",
      },
    };
  }
  if (!Number.isInteger(soNgayMuon) || soNgayMuon <= 0) {
    return { error: { status: 400, message: "Thời hạn mượn không hợp lệ." } };
  }

  const docGia = await DocGia.findOne({ MADOCGIA });
  if (!docGia) {
    return {
      error: { status: 404, message: "Không tìm thấy thông tin độc giả." },
    };
  }
  if (docGia.TRANGTHAI === false || docGia.TRANGTHAI === "KhoaThe") {
    return {
      error: { status: 400, message: "Thẻ độc giả hiện đang bị khóa." },
    };
  }

  const existing = await TheoDoiMuonSach.findOne({
    MADOCGIA,
    MASACH: exactCodeFilter(MASACH),
    TRANGTHAI: { $in: ACTIVE_STATUSES },
  });
  if (existing) {
    const message =
      existing.TRANGTHAI === "Chờ Duyệt"
        ? "Độc giả đã gửi yêu cầu mượn cuốn sách này và đang chờ duyệt."
        : "Độc giả đang mượn cuốn sách này và chưa hoàn trả.";
    return { error: { status: 400, message } };
  }

  const sach = await Sach.findOne({ MASACH: exactCodeFilter(MASACH) });
  if (!sach) {
    return {
      error: { status: 404, message: "Không tìm thấy sách trong kho." },
    };
  }
  if (sach.SOQUYEN <= 0) {
    return {
      error: {
        status: 400,
        message: `Sách '${sach.TENSACH}' hiện đã hết trong kho.`,
      },
    };
  }

  const tienCoc = Number(sach.TIENCOC) || Number(sach.DONGIA) || 50000;
  return { MADOCGIA, sach, soNgayMuon, tienCoc };
};

// ==================== CONTROLLERS ====================

const getAllTheoDoiMuonSach = async (req, res) => {
  try {
    const { trangthai, madocgia, masach, search } = req.query;
    const filter = {};

    if (trangthai) filter.TRANGTHAI = TRANG_THAI_MAP[trangthai] || trangthai;
    if (madocgia) filter.MADOCGIA = { $regex: madocgia, $options: "i" };
    if (masach) filter.MASACH = { $regex: masach, $options: "i" };
    if (search) {
      filter.$or = [
        { MADOCGIA: { $regex: search, $options: "i" } },
        { MASACH: { $regex: search, $options: "i" } },
      ];
    }

    const records = await TheoDoiMuonSach.find(filter).sort({ createdAt: -1 });
    const result = await attachRelatedInfo(records, [
      "TENSACH",
      "DONGIA",
      "TIENCOC",
      "HINHANH",
      "MATL",
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

const getMyLoans = async (req, res) => {
  try {
    const madocgia = req.DocGia?.MADOCGIA || req.query.madocgia;
    if (!madocgia) {
      return res
        .status(400)
        .json({ message: "Không xác định được mã độc giả." });
    }

    const loans = await TheoDoiMuonSach.find({ MADOCGIA: madocgia }).sort({
      createdAt: -1,
    });
    const result = await attachRelatedInfo(loans, [
      "TENSACH",
      "DONGIA",
      "TIENCOC",
      "HINHANH",
      "NGUONGOC/TACGIA",
      "MATL",
    ]);
    res.status(200).json(result);
  } catch (error) {
    return sendServerError(res, error, "Lỗi không thể lấy lịch sử mượn sách.");
  }
};

const getTheoDoiMuonSachById = async (req, res) => {
  try {
    const phieu = await TheoDoiMuonSach.findById(req.params.id);
    if (!phieu) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn." });
    }

    const [result] = await attachRelatedInfo(
      [phieu],
      ["TENSACH", "DONGIA", "TIENCOC", "MATL"],
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

// 1. Độc giả gửi yêu cầu mượn (chờ duyệt, chưa trừ kho)
const yeuCauMuonSach = async (req, res) => {
  try {
    const check = await validateBorrowRequest(
      req.DocGia?.MADOCGIA || req.body.MADOCGIA,
      req.body.MASACH,
      req.body.SONGAYMUON,
    );
    if (check.error) {
      return res
        .status(check.error.status)
        .json({ message: check.error.message });
    }

    const { MADOCGIA, sach, soNgayMuon, tienCoc } = check;
    const ngayMuon = new Date();

    const phieu = await TheoDoiMuonSach.create({
      MADOCGIA,
      MASACH: sach.MASACH,
      MSNV: null,
      NGAYMUON: ngayMuon,
      NGAYHENTRA: calcDueDate(ngayMuon, soNgayMuon),
      TRANGTHAI: "Chờ Duyệt",
      DATRUSOQUYEN: false,
      TIENCOC: tienCoc,
      TIENPHAT: 0,
    });

    return res.status(201).json({
      message:
        "Gửi yêu cầu mượn sách thành công. Số lượng sách sẽ được trừ khi nhân viên phê duyệt.",
      phieu,
    });
  } catch (error) {
    return sendServerError(res, error, "Không thể gửi yêu cầu mượn sách.");
  }
};

// 2. Thủ thư / Admin duyệt yêu cầu mượn
const duyetMuonSach = async (req, res) => {
  try {
    const phieu = await TheoDoiMuonSach.findOne({
      _id: req.params.id,
      TRANGTHAI: "Chờ Duyệt",
    });
    if (!phieu) {
      return res.status(404).json({
        message:
          "Không tìm thấy yêu cầu mượn hoặc yêu cầu đã được xử lý trước đó.",
      });
    }

    const ngayMuon = new Date();
    const diffDays =
      Math.round(
        (new Date(phieu.NGAYHENTRA) - new Date(phieu.NGAYMUON)) / MS_PER_DAY,
      ) || 14;

    const canTruKho = phieu.DATRUSOQUYEN === false;
    if (canTruKho && !(await deductStock(phieu.MASACH))) {
      return res.status(400).json({
        message: "Sách đã hết số lượng khả dụng, không thể duyệt yêu cầu.",
      });
    }

    let phieuDaDuyet;
    try {
      phieuDaDuyet = await TheoDoiMuonSach.findOneAndUpdate(
        { _id: phieu._id, TRANGTHAI: "Chờ Duyệt" },
        {
          $set: {
            TRANGTHAI: "Đang Mượn",
            DATRUSOQUYEN: true,
            MSNV: req.NhanVien?.MSNV || null,
            NGAYMUON: ngayMuon,
            NGAYHENTRA: calcDueDate(ngayMuon, diffDays),
          },
        },
        { new: true, runValidators: true },
      );
    } catch (error) {
      if (canTruKho) await restoreStock(phieu.MASACH);
      throw error;
    }

    if (!phieuDaDuyet) {
      if (canTruKho) await restoreStock(phieu.MASACH);
      return res.status(404).json({
        message:
          "Không tìm thấy yêu cầu mượn hoặc yêu cầu đã được xử lý trước đó.",
      });
    }

    return res.status(200).json({
      message: canTruKho
        ? "Duyệt yêu cầu mượn sách thành công. Đã trừ 1 quyển tồn kho."
        : "Duyệt yêu cầu mượn sách thành công.",
      phieu: phieuDaDuyet,
    });
  } catch (error) {
    return sendServerError(res, error, "Không thể duyệt yêu cầu mượn sách.");
  }
};

// 3. Thủ thư / Admin từ chối yêu cầu mượn
const tuChoiMuonSach = async (req, res) => {
  try {
    const phieu = await TheoDoiMuonSach.findOne({
      _id: req.params.id,
      TRANGTHAI: "Chờ Duyệt",
    });
    if (!phieu) {
      return res.status(404).json({
        message: "Không tìm thấy yêu cầu mượn hoặc yêu cầu đã được xử lý.",
      });
    }

    const canHoanKho = phieu.DATRUSOQUYEN !== false;
    if (canHoanKho) await restoreStock(phieu.MASACH);

    phieu.TRANGTHAI = "Từ Chối";
    phieu.DATRUSOQUYEN = false;
    phieu.MSNV = req.NhanVien?.MSNV || null;
    await phieu.save();

    return res.status(200).json({
      message: canHoanKho
        ? "Đã từ chối yêu cầu mượn sách và hoàn lại số lượng tồn kho."
        : "Đã từ chối yêu cầu mượn sách.",
      phieu,
    });
  } catch (error) {
    return sendServerError(res, error, "Không thể từ chối yêu cầu mượn.");
  }
};

// 4. Lập phiếu mượn trực tiếp tại quầy (trừ kho ngay)
const muonSach = async (req, res) => {
  try {
    const check = await validateBorrowRequest(
      req.body.MADOCGIA,
      req.body.MASACH,
      req.body.SONGAYMUON,
    );
    if (check.error) {
      return res
        .status(check.error.status)
        .json({ message: check.error.message });
    }

    const { MADOCGIA, sach, soNgayMuon, tienCoc } = check;
    const sachSauKhiTru = await deductStock(sach.MASACH);
    if (!sachSauKhiTru) {
      return res
        .status(400)
        .json({ message: "Sách không tồn tại hoặc vừa hết." });
    }

    const ngayMuon = new Date();
    let phieu;
    try {
      phieu = await TheoDoiMuonSach.create({
        MADOCGIA,
        MASACH: sach.MASACH,
        MSNV: req.NhanVien?.MSNV || null,
        NGAYMUON: ngayMuon,
        NGAYHENTRA: calcDueDate(ngayMuon, soNgayMuon),
        TRANGTHAI: "Đang Mượn",
        DATRUSOQUYEN: true,
        TIENCOC: tienCoc,
        TIENPHAT: 0,
      });
    } catch (error) {
      await restoreStock(sach.MASACH);
      throw error;
    }

    return res.status(201).json({
      message: "Lập phiếu mượn sách thành công (Đã trừ 1 quyển tồn kho).",
      phieu,
      soQuyenConLai: sachSauKhiTru.SOQUYEN,
    });
  } catch (error) {
    return sendServerError(res, error, "Không thể tạo phiếu mượn.");
  }
};

// 5. Trả sách & tính tiền phạt (trễ hạn + hư hại)
const traSach = async (req, res) => {
  try {
    const phieu = await TheoDoiMuonSach.findOne({
      _id: req.params.id,
      TRANGTHAI: { $in: ["Đang Mượn", "Trễ Hạn"] },
      NGAYTRA: null,
    });

    if (!phieu) {
      const exists = await TheoDoiMuonSach.exists({ _id: req.params.id });
      return res.status(exists ? 409 : 404).json({
        message: exists
          ? "Phiếu này đã được trả trước đó."
          : "Không tìm thấy phiếu mượn.",
      });
    }

    // Độc giả chỉ được trả phiếu của chính mình
    if (
      (req.userRole === "DocGia" || req.DocGia) &&
      req.DocGia?.MADOCGIA !== phieu.MADOCGIA
    ) {
      return res.status(403).json({
        message: "Bạn không có quyền trả phiếu mượn của độc giả khác.",
      });
    }

    const ngayTra = new Date();
    const tienCoc = Number(phieu.TIENCOC) || 0;
    const { tienPhatTre, tichThuCoc } = calcOverdueFine(
      phieu.NGAYHENTRA,
      tienCoc,
      ngayTra,
    );
    const tienPhatHuHai = Math.max(0, Number(req.body.TIENPHATHUHAI) || 0);
    const tongTienPhat = tienPhatTre + tienPhatHuHai;

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
          DATRUSOQUYEN: false,
          TIENPHAT: tongTienPhat,
        },
      },
      { new: true, runValidators: true },
    );

    if (!phieuDaTra) {
      return res.status(409).json({ message: "Phiếu đang được xử lý trả." });
    }

    await restoreStock(phieu.MASACH);

    let msg =
      "Trả sách nguyên vẹn đúng hạn thành công. Hoàn trả toàn bộ tiền cọc cho độc giả.";
    if (tichThuCoc) {
      msg = `Trả sách thành công (Quá 30 ngày trễ - Đã tịch thu toàn bộ tiền cọc: ${formatVND(tienCoc)}).`;
      if (tienPhatHuHai > 0) {
        msg += ` Đã cộng thêm phạt hư hại sách: ${formatVND(tienPhatHuHai)}.`;
      }
    } else if (tongTienPhat > 0) {
      const chiTiet = [];
      if (tienPhatTre > 0) chiTiet.push(`Trễ hạn: ${formatVND(tienPhatTre)}`);
      if (tienPhatHuHai > 0)
        chiTiet.push(`Hư hại sách: ${formatVND(tienPhatHuHai)}`);
      msg = `Trả sách thành công. Tổng tiền phạt: ${formatVND(tongTienPhat)} (${chiTiet.join(", ")}).`;
    }

    return res.json({
      message: msg,
      TIENPHAT: tongTienPhat,
      TIENCOC: tienCoc,
      phieu: phieuDaTra,
    });
  } catch (error) {
    return sendServerError(res, error, "Không thể trả sách.");
  }
};

// 6. Lấy danh sách phiếu trễ hạn & cập nhật tiền phạt mới nhất
const getSachTreHan = async (req, res) => {
  try {
    const homNay = startOfDay(new Date());

    await TheoDoiMuonSach.updateMany(
      { TRANGTHAI: "Đang Mượn", NGAYHENTRA: { $lt: homNay }, NGAYTRA: null },
      { $set: { TRANGTHAI: "Trễ Hạn" } },
    );

    const danhSach = await TheoDoiMuonSach.find({
      TRANGTHAI: "Trễ Hạn",
      NGAYTRA: null,
    }).sort({ NGAYHENTRA: 1 });

    await Promise.all(
      danhSach.map((phieu) => {
        const { tienPhatTre } = calcOverdueFine(
          phieu.NGAYHENTRA,
          Number(phieu.TIENCOC) || 0,
        );
        phieu.TIENPHAT = tienPhatTre;
        return TheoDoiMuonSach.updateOne(
          { _id: phieu._id },
          { $set: { TIENPHAT: tienPhatTre } },
        );
      }),
    );

    const result = await attachRelatedInfo(danhSach, ["TENSACH", "TIENCOC"]);
    return res.json(result);
  } catch (error) {
    return sendServerError(res, error, "Không thể lấy danh sách sách trễ hạn.");
  }
};

// ==================== CRUD CƠ BẢN ====================

const createTheoDoiMuonSach = async (req, res) => {
  try {
    const { MADOCGIA, MASACH } = req.body;
    const existing = await TheoDoiMuonSach.findOne({
      MADOCGIA,
      MASACH,
      TRANGTHAI: { $in: ACTIVE_STATUSES },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Độc giả đang mượn hoặc chờ duyệt cuốn sách này." });
    }

    const newTDMS = new TheoDoiMuonSach(req.body);
    const canTruKho = ["Đang Mượn", "Trễ Hạn"].includes(newTDMS.TRANGTHAI);
    newTDMS.DATRUSOQUYEN = canTruKho;

    if (canTruKho && !(await deductStock(MASACH))) {
      return res
        .status(400)
        .json({ message: "Sách đã hết số lượng khả dụng." });
    }

    try {
      await newTDMS.save();
    } catch (error) {
      if (canTruKho) await restoreStock(MASACH);
      throw error;
    }

    res.status(201).json({ message: "Tạo phiếu mượn thành công.", newTDMS });
  } catch (error) {
    return sendServerError(res, error, "Lỗi không thể tạo phiếu mượn.");
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
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn." });
    }
    res.status(200).json({ message: "Cập nhật phiếu mượn thành công.", TDMS });
  } catch (error) {
    return sendServerError(res, error, "Lỗi không thể cập nhật phiếu mượn.");
  }
};

const deleteTheoDoiMuonSach = async (req, res) => {
  try {
    const phieu = await TheoDoiMuonSach.findById(req.params.id);
    if (!phieu) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn." });
    }

    const canHoanKho =
      ACTIVE_STATUSES.includes(phieu.TRANGTHAI) && phieu.DATRUSOQUYEN !== false;
    if (canHoanKho) await restoreStock(phieu.MASACH);

    await TheoDoiMuonSach.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: canHoanKho
        ? "Xóa thành công phiếu mượn và hoàn trả tồn kho."
        : "Xóa thành công phiếu mượn.",
    });
  } catch (error) {
    return sendServerError(res, error, "Lỗi không thể xóa phiếu mượn.");
  }
};

const deleteAllTheoDoiMuonSach = async (req, res) => {
  try {
    const result = await TheoDoiMuonSach.deleteMany({});
    res
      .status(200)
      .json({ message: `Đã xóa ${result.deletedCount} phiếu mượn.` });
  } catch (error) {
    return sendServerError(res, error, "Lỗi không thể xóa tất cả phiếu mượn.");
  }
};

module.exports = {
  getAllTheoDoiMuonSach,
  getMyLoans,
  getTheoDoiMuonSachById,
  yeuCauMuonSach,
  duyetMuonSach,
  tuChoiMuonSach,
  createTheoDoiMuonSach,
  updateTheoDoiMuonSach,
  deleteTheoDoiMuonSach,
  deleteAllTheoDoiMuonSach,
  muonSach,
  traSach,
  getSachTreHan,
};
