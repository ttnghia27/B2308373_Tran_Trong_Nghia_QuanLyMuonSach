const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const DocGiaSchema = new mongoose.Schema(
  {
    MADOCGIA: { type: String, required: true, unique: true, trim: true },
    HOLOT: { type: String, required: true, trim: true },
    TEN: { type: String, required: true, trim: true },
    NGAYSINH: { type: Date, required: true },
    PHAI: { type: String, required: true, enum: ["Nam", "Nữ", "Khác"], trim: true },
    DIACHI: { type: String, required: true, trim: true },
    DIENTHOAI: { type: String, required: true, maxlength: 10, trim: true },
    PASSWORD: { type: String, default: "123", trim: true },
    TRANGTHAI: {
      type: String,
      enum: ["HoatDong", "KhoaThe"],
      default: "HoatDong",
      trim: true,
    },
  },
  {
    collection: "DOCGIA",
    timestamps: true,
  },
);

DocGiaSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.PASSWORD) return false;
  if (this.PASSWORD.startsWith("$2a$") || this.PASSWORD.startsWith("$2b$")) {
    return bcrypt.compare(candidatePassword, this.PASSWORD);
  }
  return candidatePassword === this.PASSWORD;
};

module.exports = mongoose.model("DocGia", DocGiaSchema);
