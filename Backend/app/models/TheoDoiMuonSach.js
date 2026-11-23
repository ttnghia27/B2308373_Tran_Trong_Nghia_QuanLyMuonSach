const mongoose = require("mongoose");

const TheoDoiMuonSachSchema = new mongoose.Schema(
  {
    MADOCGIA: { type: String, required: true, trim: true },
    MASACH: { type: String, required: true, trim: true },
    NGAYMUON: { type: Date, required: true, default: Date.now },
    NGAYHENTRA: { type: Date, required: true, trim: true },
    NGAYTRA: { type: Date, default: null },
    TRANGTHAI: {
      type: String,
      required: true,
      enum: ["Đang Mượn", "Đã Trả", "Trễ Hạn"],
      default: "Đang Mượn",
      trim: true,
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
