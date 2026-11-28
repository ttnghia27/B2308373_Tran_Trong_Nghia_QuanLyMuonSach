const mongoose = require("mongoose");

const TheLoaiSchema = new mongoose.Schema(
  {
    MATL: { type: String, required: true, unique: true, trim: true },
    TENTL: { type: String, required: true, trim: true },
  },
  {
    collection: "THELOAI",
    timestamps: true,
  },
);

module.exports = mongoose.model("TheLoai", TheLoaiSchema);
