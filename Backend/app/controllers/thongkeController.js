const Sach = require("../models/Sach");
const DocGia = require("../models/DocGia");
const NhanVien = require("../models/NhanVien");
const NhaXuatBan = require("../models/NhaXuatBan");
const TheLoai = require("../models/TheLoai");
const TheoDoiMuonSach = require("../models/TheoDoiMuonSach");

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getLateDays = (phieu) => {
  if (!phieu.NGAYHENTRA) return 0;
  const endDate = phieu.NGAYTRA ? new Date(phieu.NGAYTRA) : new Date();
  const diffMs =
    startOfDay(endDate) - startOfDay(new Date(phieu.NGAYHENTRA));
  return Math.max(0, Math.ceil(diffMs / MILLISECONDS_PER_DAY));
};

const getThongKeTongQuan = async (req, res) => {
  try {
    const [
      totalBooks,
      totalReaders,
      totalStaff,
      totalPublishers,
      totalCategories,
      borrowingCount,
      returnedCount,
      overdueCount,
      allMuonSach,
      books,
    ] = await Promise.all([
      Sach.countDocuments({}),
      DocGia.countDocuments({}),
      NhanVien.countDocuments({}),
      NhaXuatBan.countDocuments({}),
      TheLoai.countDocuments({}),
      TheoDoiMuonSach.countDocuments({ TRANGTHAI: "Đang Mượn" }),
      TheoDoiMuonSach.countDocuments({ TRANGTHAI: "Đã Trả" }),
      TheoDoiMuonSach.countDocuments({ TRANGTHAI: "Trễ Hạn" }),
      TheoDoiMuonSach.find({}).sort({ createdAt: -1 }),
      Sach.find({}, "MASACH TENSACH SOQUYEN DONGIA TIENCOC HINHAH HINHANH"),
    ]);

    // Tính tổng số lượng quyển sách trong kho
    const totalCopies = books.reduce((acc, b) => acc + (b.SOQUYEN || 0), 0);

    const confiscatedDepositCount = allMuonSach.filter(
      (phieu) => getLateDays(phieu) > 30,
    ).length;

    // Tính tổng số tiền phạt và tiền cọc tịch thu
    const totalFineCollected = allMuonSach.reduce(
      (acc, p) => acc + (p.TIENPHAT || 0),
      0
    );

    // Tiền cọc thu thực tế khi phiếu đã được duyệt/cho mượn.
    // Không tính yêu cầu chờ duyệt hoặc phiếu bị từ chối.
    const totalDepositCollected = allMuonSach.reduce(
      (acc, p) =>
        acc +
        (["Đang Mượn", "Trễ Hạn", "Đã Trả"].includes(p.TRANGTHAI)
          ? p.TIENCOC || 0
          : 0),
      0
    );

    // Lấy 6 hoạt động gần nhất
    const recentActivities = allMuonSach.slice(0, 6);

    // Thống kê sách được mượn nhiều nhất
    const bookBorrowCount = {};
    allMuonSach.forEach((p) => {
      bookBorrowCount[p.MASACH] = (bookBorrowCount[p.MASACH] || 0) + 1;
    });

    const topBooks = Object.keys(bookBorrowCount)
      .map((masach) => {
        const book = books.find((b) => b.MASACH === masach);
        return {
          MASACH: masach,
          TENSACH: book ? book.TENSACH : masach,
          count: bookBorrowCount[masach],
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.status(200).json({
      totalBooks,
      totalCopies,
      totalReaders,
      totalStaff,
      totalPublishers,
      totalCategories,
      borrowingCount,
      returnedCount,
      overdueCount,
      confiscatedDepositCount,
      totalFineCollected,
      totalDepositCollected,
      recentActivities,
      topBooks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể lấy dữ liệu thống kê tổng quan.",
      error: error.message,
    });
  }
};

const getThuTheoThoiGian = async (req, res) => {
  try {
    const period = ["day", "month", "year"].includes(req.query.period)
      ? req.query.period
      : "month";
    let start;
    let end;
    let bucketCount;
    let getBucketIndex;
    let getLabel;

    if (period === "day") {
      const dateValue = req.query.date
        ? new Date(`${req.query.date}T00:00:00`)
        : new Date();
      start = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
      end = new Date(start);
      end.setDate(end.getDate() + 1);
      bucketCount = 24;
      getBucketIndex = (date) => new Date(date).getHours();
      getLabel = (index) => `${index}h`;
    } else if (period === "month") {
      const match = /^(\d{4})-(\d{2})$/.exec(req.query.month || "");
      const year = match ? Number(match[1]) : new Date().getFullYear();
      const month = match ? Number(match[2]) - 1 : new Date().getMonth();
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 1);
      bucketCount = new Date(year, month + 1, 0).getDate();
      getBucketIndex = (date) => new Date(date).getDate() - 1;
      getLabel = (index) => `${index + 1}`;
    } else {
      const year = Number(req.query.year) || new Date().getFullYear();
      start = new Date(year, 0, 1);
      end = new Date(year + 1, 0, 1);
      bucketCount = 12;
      getBucketIndex = (date) => new Date(date).getMonth();
      getLabel = (index) => `T${index + 1}`;
    }

    const records = await TheoDoiMuonSach.find({
      $or: [
        { NGAYMUON: { $gte: start, $lt: end } },
        { NGAYTRA: { $gte: start, $lt: end } },
      ],
    });

    const chart = Array.from({ length: bucketCount }, (_, index) => ({
      label: getLabel(index),
      deposit: 0,
      fine: 0,
      total: 0,
    }));

    records.forEach((record) => {
      if (
        ["Đang Mượn", "Trễ Hạn", "Đã Trả"].includes(record.TRANGTHAI) &&
        record.NGAYMUON &&
        new Date(record.NGAYMUON) >= start &&
        new Date(record.NGAYMUON) < end
      ) {
        const index = getBucketIndex(record.NGAYMUON);
        chart[index].deposit += Number(record.TIENCOC) || 0;
      }

      if (
        record.TRANGTHAI === "Đã Trả" &&
        record.NGAYTRA &&
        new Date(record.NGAYTRA) >= start &&
        new Date(record.NGAYTRA) < end
      ) {
        const index = getBucketIndex(record.NGAYTRA);
        chart[index].fine += Number(record.TIENPHAT) || 0;
      }
    });

    chart.forEach((bucket) => {
      bucket.total = bucket.deposit + bucket.fine;
    });

    res.status(200).json({
      period,
      start,
      end,
      chart,
      depositTotal: chart.reduce((sum, bucket) => sum + bucket.deposit, 0),
      fineTotal: chart.reduce((sum, bucket) => sum + bucket.fine, 0),
      grandTotal: chart.reduce((sum, bucket) => sum + bucket.total, 0),
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể thống kê tiền thu theo thời gian.",
      error: error.message,
    });
  }
};

module.exports = {
  getThongKeTongQuan,
  getThuTheoThoiGian,
};
