const mongoose = require("mongoose");

const NhaXuatBanSchema = new mongoose.Schema(
  {
    MANXB: { type: String, required: true, unique: true, trim: true },
    TENNXB: { type: String, required: true, trim: true },
    DIACHI: { type: String, required: true, trim: true },
  },
  {
    collection: "NHAXUATBAN",
    timestamps: true,
  },
);
module.exports = mongoose.model("NhaXuatBan", NhaXuatBanSchema);
