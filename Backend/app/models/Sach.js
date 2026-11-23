const mongoose = require("mongoose");

const SachSchema = new mongoose.Schema(
  {
    MASACH: { type: String, required: true, unique: true, trim: true },
    TENSACH: { type: String, required: true, trim: true },
    MATL: { type: String, required: true, trim: true },
    DONGIA: { type: Number, required: true, min: 0, trim: true },
    TIENCOC: { type: Number, required: true, min: 0, trim: true },
    SOQUYEN: { type: Number, required: true, min: 0, trim: true },
    NAMXUATBAN: { type: Number, required: true, min: 0, trim: true },
    MANXB: { type: String, required: true, trim: true },
    "NGUONGOC/TACGIA": { type: String, required: true, trim: true },
    MOTA: { type: String, required: false, trim: true },
    HINHAH: { type: String, required: false, trim: true },
  },
  {
    collection: "SACH",
    timestamps: true,
  },
);

module.exports = mongoose.model("Sach", SachSchema);
