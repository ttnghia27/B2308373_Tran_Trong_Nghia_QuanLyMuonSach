const mongoose = require("mongoose");

const NhanVienSchema = new mongoose.Schema(
  {
    MSNV: { type: String, required: true, unique: true, trim: true },
    HOTENNV: { type: String, required: true, trim: true },
    PASSWORD: { type: String, required: true, minlength: 3, trim: true },
    CHUCVU: {
      type: String,
      required: true,
      enum: ["Admin", "Nhân Viên"],
      default: "Nhân Viên",
      trim: true,
    },
    DIACHI: { type: String, required: true, trim: true },
    SODIENTHOAI: { type: String, required: true, maxlength: 10, trim: true },
  },
  {
    collection: "NhanVien",
    timestamps: true,
  },
);

NhanVienSchema.methods.comparePassword = async function (candidatePassword) {
  return candidatePassword === this.PASSWORD;
};

module.exports = mongoose.model("NhanVien", NhanVienSchema);
