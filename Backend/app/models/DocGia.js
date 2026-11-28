const mongoose = require("mongoose");

const DocGiaSchema = new mongoose.Schema(
  {
    MADOCGIA: { type: String, required: true, unique: true, trim: true },
    HOLOT: { type: String, required: true, trim: true },
    TEN: { type: String, required: true, trim: true },
    NGAYSINH: { type: Date, required: true },
    PHAI: { type: String, required: true, enum: ["Nam", "Nữ"], trim: true },
    DIACHI: { type: String, required: true, trim: true },
    DIENTHOAI: { type: String, required: true, maxlength: 10, trim: true },
  },
  {
    collection: "DOCGIA",
    timestamps: true,
  },
);

module.exports = mongoose.model("DocGia", DocGiaSchema);
