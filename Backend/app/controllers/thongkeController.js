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

module.exports = {
  getThongKeTongQuan,
};
