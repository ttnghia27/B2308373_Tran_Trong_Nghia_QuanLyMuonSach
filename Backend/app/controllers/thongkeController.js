const Sach = require("../models/Sach");
const TheoDoiMuonSach = require("../models/TheoDoiMuonSach");

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getLateDays = (phieu) => {
  if (!phieu.NGAYHENTRA) return 0;
  const endDate = phieu.NGAYTRA ? new Date(phieu.NGAYTRA) : new Date();
  const diffMs = startOfDay(endDate) - startOfDay(new Date(phieu.NGAYHENTRA));
  return Math.max(0, Math.ceil(diffMs / MILLISECONDS_PER_DAY));
};

const getThongKeTongQuan = async (req, res) => {
  try {
    const [
      totalBooks,
      borrowingCount,
      returnedCount,
      overdueCount,
      loanDates,
      books,
    ] = await Promise.all([
      Sach.countDocuments({}),
      TheoDoiMuonSach.countDocuments({ TRANGTHAI: "Đang Mượn" }),
      TheoDoiMuonSach.countDocuments({ TRANGTHAI: "Đã Trả" }),
      TheoDoiMuonSach.countDocuments({ TRANGTHAI: "Trễ Hạn" }),
      TheoDoiMuonSach.find({}, "NGAYHENTRA NGAYTRA"),
      Sach.find({}, "SOQUYEN"),
    ]);

    const totalCopies = books.reduce((acc, b) => acc + (b.SOQUYEN || 0), 0);
    const confiscatedDepositCount = loanDates.filter(
      (phieu) => getLateDays(phieu) > 30,
    ).length;

    res.status(200).json({
      totalBooks,
      totalCopies,
      borrowingCount,
      returnedCount,
      overdueCount,
      confiscatedDepositCount,
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
      start = new Date(
        dateValue.getFullYear(),
        dateValue.getMonth(),
        dateValue.getDate(),
      );
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
