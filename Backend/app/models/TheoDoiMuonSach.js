const mongoose = require("mongoose");

const TheoDoiMuonSachSchema = new mongoose.Schema(
  {
    MADOCGIA: { type: String, required: true, trim: true },
    MASACH: { type: String, required: true, trim: true },
    MSNV: { type: String, default: null, trim: true },
    NGAYMUON: { type: Date, required: true, default: Date.now },
    NGAYHENTRA: { type: Date, required: true },
    NGAYTRA: { type: Date, default: null },
    TRANGTHAI: {
      type: String,
      required: true,
      enum: ["Chờ Duyệt", "Đang Mượn", "Đã Trả", "Trễ Hạn", "Từ Chối"],
      default: "Đang Mượn",
      trim: true,
    },
    DATRUSOQUYEN: { type: Boolean, default: true },
    TIENCOC: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    TIENPHAT: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    collection: "THEODOIMUONSACH",
    timestamps: true,
  },
);

module.exports = mongoose.model("TheoDoiMuonSach", TheoDoiMuonSachSchema);
