const TheoDoiMuonSach = require("../models/TheoDoiMuonSach");
const Sach = require("../models/Sach");
const DocGia = require("../models/DocGia");

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const TIEN_PHAT_MOI_NGAY = 5000; // 5.000 VNĐ / ngày trễ hạn

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const sendServerError = (res, error, message) =>
  res.status(500).json({ message, error: error.message });

const exactCodeFilter = (value) => ({
  $regex: `^${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
  $options: "i",
});

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
      const mapTrangThai = {
        ChoDuyet: "Chờ Duyệt",
        DangMuon: "Đang Mượn",
        DaTra: "Đã Trả",
        TreHan: "Trễ Hạn",
        TuChoi: "Từ Chối",
      };
      filter.TRANGTHAI = mapTrangThai[trangthai] || trangthai;
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

// Độc giả lấy danh sách phiếu mượn của chính mình
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
    const TDMS = await TheoDoiMuonSach.findById(req.params.id);
    if (!TDMS) {
      return res.status(404).json({ message: "Không tìm thấy phiếu mượn." });
    }

    const [result] = await attachRelatedInfo(
      [TDMS],
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

// 1. Độc giả gửi yêu cầu mượn, chờ nhân viên duyệt
const yeuCauMuonSach = async (req, res) => {
  try {
    const MADOCGIA = (req.DocGia?.MADOCGIA || req.body.MADOCGIA || "")
      .trim()
      .toUpperCase();
    const MASACH = (req.body.MASACH || "").trim().toUpperCase();
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

    // Ràng buộc 1: Độc giả phải tồn tại và không bị khóa thẻ
    const docGia = await DocGia.findOne({ MADOCGIA });
    if (!docGia) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin độc giả." });
    }
    if (docGia.TRANGTHAI === "KhoaThe") {
      return res.status(400).json({
        message: "Thẻ độc giả hiện đang bị khóa. Không thể yêu cầu mượn sách.",
      });
    }

    // Ràng buộc 2: Không được mượn trùng cuốn sách đang chờ duyệt hoặc chưa trả
    const existingTDMS = await TheoDoiMuonSach.findOne({
      MADOCGIA,
      MASACH: exactCodeFilter(MASACH),
      TRANGTHAI: { $in: ["Chờ Duyệt", "Đang Mượn", "Trễ Hạn"] },
    });

    if (existingTDMS) {
      const msg =
        existingTDMS.TRANGTHAI === "Chờ Duyệt"
          ? "Bạn đã gửi yêu cầu mượn cuốn sách này và đang chờ thủ thư duyệt."
          : "Bạn đang mượn cuốn sách này và chưa hoàn trả.";
      return res.status(400).json({ message: msg });
    }

    // Ràng buộc 3: Sách phải tồn tại và còn số lượng (SOQUYEN > 0)
    const sach = await Sach.findOne({ MASACH: exactCodeFilter(MASACH) });
    if (!sach) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sách trong kho." });
    }
    if (sach.SOQUYEN <= 0) {
      return res.status(400).json({
        message: `Sách '${sach.TENSACH}' hiện đã hết số lượng khả dụng trong kho.`,
      });
    }

    const tienCoc = Number(sach.TIENCOC) || Number(sach.DONGIA) || 50000;
    const ngayMuon = new Date();
    const ngayHenTra = new Date(ngayMuon);
    ngayHenTra.setDate(ngayHenTra.getDate() + soNgayMuon);
    ngayHenTra.setHours(23, 59, 59, 999);

    const phieu = await TheoDoiMuonSach.create({
      MADOCGIA,
      MASACH: sach.MASACH,
      MSNV: null,
      NGAYMUON: ngayMuon,
      NGAYHENTRA: ngayHenTra,
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

// 2. Thủ thư / Admin DUYỆT YÊU CẦU MƯỢN SÁCH
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
        (new Date(phieu.NGAYHENTRA) - new Date(phieu.NGAYMUON)) /
          MILLISECONDS_PER_DAY,
      ) || 14;
    const ngayHenTra = new Date(ngayMuon);
    ngayHenTra.setDate(ngayHenTra.getDate() + Math.max(1, diffDays));
    ngayHenTra.setHours(23, 59, 59, 999);

    const daTruSoQuyen = phieu.DATRUSOQUYEN !== false;
    if (!daTruSoQuyen) {
      const sachSauKhiTruKho = await Sach.findOneAndUpdate(
        { MASACH: phieu.MASACH, SOQUYEN: { $gt: 0 } },
        { $inc: { SOQUYEN: -1 } },
        { new: true },
      );
      if (!sachSauKhiTruKho) {
        return res.status(400).json({
          message: "Sách đã hết số lượng khả dụng, không thể duyệt yêu cầu.",
        });
      }
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
            NGAYHENTRA: ngayHenTra,
          },
        },
        { new: true, runValidators: true },
      );
    } catch (error) {
      if (!daTruSoQuyen) {
        await Sach.updateOne(
          { MASACH: phieu.MASACH },
          { $inc: { SOQUYEN: 1 } },
        );
      }
      throw error;
    }

    if (!phieuDaDuyet) {
      if (!daTruSoQuyen) {
        await Sach.updateOne(
          { MASACH: phieu.MASACH },
          { $inc: { SOQUYEN: 1 } },
        );
      }
      return res.status(404).json({
        message:
          "Không tìm thấy yêu cầu mượn hoặc yêu cầu đã được xử lý trước đó.",
      });
    }

    return res.status(200).json({
      message: daTruSoQuyen
        ? "Duyệt yêu cầu mượn sách thành công."
        : "Duyệt yêu cầu mượn sách thành công. Đã trừ 1 quyển tồn kho.",
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

    const daTruSoQuyen = phieu.DATRUSOQUYEN !== false;
    if (daTruSoQuyen) {
      await Sach.updateOne({ MASACH: phieu.MASACH }, { $inc: { SOQUYEN: 1 } });
    }

    phieu.TRANGTHAI = "Từ Chối";
    phieu.DATRUSOQUYEN = false;
    phieu.MSNV = req.NhanVien?.MSNV || null;
    await phieu.save();

    return res.status(200).json({
      message: daTruSoQuyen
        ? "Đã từ chối yêu cầu mượn sách và hoàn lại số lượng tồn kho."
        : "Đã từ chối yêu cầu mượn sách.",
      phieu,
    });
  } catch (error) {
    return sendServerError(res, error, "Không thể từ chối yêu cầu mượn.");
  }
};

// 4. Lập phiếu mượn trực tiếp tại quầy bởi Thủ thư/Admin: Trừ số lượng sách (SOQUYEN -= 1)
const muonSach = async (req, res) => {
  try {
    const MADOCGIA = req.body.MADOCGIA?.trim().toUpperCase();
    const MASACH = req.body.MASACH?.trim().toUpperCase();
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
      MASACH: exactCodeFilter(MASACH),
      TRANGTHAI: { $in: ["Đang Mượn", "Trễ Hạn", "Chờ Duyệt"] },
    });
    if (phieuDangMuon) {
      return res
        .status(400)
        .json({
          message: "Độc giả đang mượn hoặc đang chờ duyệt cuốn sách này.",
        });
    }

    const sach = await Sach.findOne({ MASACH: exactCodeFilter(MASACH) });
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

    const tienCoc = Number(sach.TIENCOC) || Number(sach.DONGIA) || 50000;
    const ngayMuon = new Date();
    const ngayHenTra = new Date(ngayMuon);
    ngayHenTra.setDate(ngayHenTra.getDate() + soNgayMuon);
    ngayHenTra.setHours(23, 59, 59, 999);

    // Trừ 1 quyển trong kho sách
    const sachSauKhiTruKho = await Sach.findOneAndUpdate(
      { MASACH: sach.MASACH, SOQUYEN: { $gt: 0 } },
      { $inc: { SOQUYEN: -1 } },
      { new: true },
    );
    if (!sachSauKhiTruKho) {
      return res
        .status(400)
        .json({ message: "Sách không tồn tại hoặc vừa hết." });
    }

    let phieu;
    try {
      phieu = await TheoDoiMuonSach.create({
        MADOCGIA,
        MASACH: sach.MASACH,
        MSNV: req.NhanVien?.MSNV || null,
        NGAYMUON: ngayMuon,
        NGAYHENTRA: ngayHenTra,
        TRANGTHAI: "Đang Mượn",
        DATRUSOQUYEN: true,
        TIENCOC: tienCoc,
        TIENPHAT: 0,
      });
    } catch (error) {
      await Sach.updateOne({ MASACH: sach.MASACH }, { $inc: { SOQUYEN: 1 } });
      throw error;
    }

    return res.status(201).json({
      message: "Lập phiếu mượn sách thành công (Đã trừ 1 quyển tồn kho).",
      phieu,
      soQuyenConLai: sachSauKhiTruKho.SOQUYEN,
    });
  } catch (error) {
    return sendServerError(res, error, "Không thể tạo phiếu mượn.");
  }
};

// 5. Trả sách & CỘNG THÊM TIỀN PHẠT HƯ SÁCH VÀO TIENPHAT
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

    // Nếu người thực hiện là Độc Giả: chỉ được phép trả sách của chính mình
    if (req.userRole === "DocGia" || req.DocGia) {
      const readerId = req.DocGia?.MADOCGIA;
      if (readerId && phieu.MADOCGIA !== readerId) {
        return res.status(403).json({
          message: "Bạn không có quyền trả phiếu mượn của độc giả khác.",
        });
      }
    }

    const ngayTra = new Date();
    const diffMs = startOfDay(ngayTra) - startOfDay(new Date(phieu.NGAYHENTRA));
    const ngayTre = Math.max(0, Math.ceil(diffMs / MILLISECONDS_PER_DAY));

    const tienCoc = Number(phieu.TIENCOC) || 0;
    let tienPhatTre = 0;
    let tichThuCoc = false;

    // Quy tắc: Nếu trễ quá 30 ngày -> Tịch thu cọc
    if (ngayTre > 30) {
      tichThuCoc = true;
      tienPhatTre = tienCoc > 0 ? tienCoc : 100000;
    } else if (ngayTre > 0) {
      tienPhatTre = ngayTre * TIEN_PHAT_MOI_NGAY;
    }

    // Tiền phạt do làm hư hại sách (nếu có truyền từ body)
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
          TIENPHAT: tongTienPhat, // Cộng dồn tiền phạt hư sách vào TIENPHAT
        },
      },
      { new: true, runValidators: true },
    );

    if (!phieuDaTra) {
      return res.status(409).json({ message: "Phiếu đang được xử lý trả." });
    }

    // Hoàn trả 1 quyển sách vào kho
    await Sach.updateOne({ MASACH: phieu.MASACH }, { $inc: { SOQUYEN: 1 } });

    let msg;
    if (tichThuCoc) {
      msg = `Trả sách thành công (Lưu ý: Quá 30 ngày trễ - Đã tịch thu toàn bộ tiền cọc: ${tienCoc.toLocaleString("vi-VN")} đ).`;
      if (tienPhatHuHai > 0) {
        msg += ` Đã cộng thêm tiền phạt hư hại sách: ${tienPhatHuHai.toLocaleString("vi-VN")} đ vào tổng tiền phạt.`;
      }
    } else if (tongTienPhat > 0) {
      msg = `Trả sách thành công. Tổng tiền phạt: ${tongTienPhat.toLocaleString("vi-VN")} đ`;
      if (tienPhatHuHai > 0 && tienPhatTre > 0) {
        msg += ` (Trễ hạn: ${tienPhatTre.toLocaleString("vi-VN")} đ, Hư hại sách: ${tienPhatHuHai.toLocaleString("vi-VN")} đ).`;
      } else if (tienPhatHuHai > 0) {
        msg += ` (Đã cộng tiền phạt hư hại sách: ${tienPhatHuHai.toLocaleString("vi-VN")} đ).`;
      }
    } else {
      msg =
        "Trả sách nguyên vẹn đúng hạn thành công. Hoàn trả toàn bộ tiền cọc cho độc giả.";
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

const createTheoDoiMuonSach = async (req, res) => {
  try {
    const { MADOCGIA, MASACH } = req.body;
    const existingTDMS = await TheoDoiMuonSach.findOne({
      MADOCGIA,
      MASACH,
      TRANGTHAI: { $in: ["Đang Mượn", "Trễ Hạn", "Chờ Duyệt"] },
    });

    if (existingTDMS) {
      return res
        .status(400)
        .json({ message: "Độc giả đang mượn hoặc chờ duyệt cuốn sách này." });
    }

    const newTDMS = new TheoDoiMuonSach(req.body);
    const canBorrow = ["Đang Mượn", "Trễ Hạn"].includes(newTDMS.TRANGTHAI);
    newTDMS.DATRUSOQUYEN = canBorrow;

    if (canBorrow) {
      const sachSauKhiTruKho = await Sach.findOneAndUpdate(
        { MASACH, SOQUYEN: { $gt: 0 } },
        { $inc: { SOQUYEN: -1 } },
        { new: true },
      );
      if (!sachSauKhiTruKho) {
        return res.status(400).json({
          message: "Sách đã hết số lượng khả dụng.",
        });
      }
    }

    try {
      await newTDMS.save();
    } catch (error) {
      if (canBorrow) {
        await Sach.updateOne({ MASACH }, { $inc: { SOQUYEN: 1 } });
      }
      throw error;
    }

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

    // Chỉ hoàn kho nếu phiếu này đã trừ số lượng sách.
    const daHoanKho =
      ["Đang Mượn", "Trễ Hạn", "Chờ Duyệt"].includes(TDMS.TRANGTHAI) &&
      TDMS.DATRUSOQUYEN !== false;
    if (daHoanKho) {
      await Sach.updateOne({ MASACH: TDMS.MASACH }, { $inc: { SOQUYEN: 1 } });
    }

    await TheoDoiMuonSach.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: daHoanKho
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
    res.status(200).json({
      message: `Đã xóa ${result.deletedCount} phiếu mượn.`,
    });
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
