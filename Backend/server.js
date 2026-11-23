const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./app/config/db");
const NhaXuatBanRoutes = require("./app/routes/nhaxuatbanRoutes");
const NhanVienRoutes = require("./app/routes/nhanvienRoutes");
const DocGiaRoutes = require("./app/routes/docgiaRoutes");
const SachRoutes = require("./app/routes/sachRoutes");
const TheoDoiMuonSachRoutes = require("./app/routes/theodoimuongsachRoutes");
const TheLoaiRoutes = require("./app/routes/theloaiRoutes");
const authRoutes = require("./app/routes/authRoutes");
const app = express();

dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/nhaxuatban", NhaXuatBanRoutes);
app.use("/api/nhanvien", NhanVienRoutes);
app.use("/api/docgia", DocGiaRoutes);
app.use("/api/sach", SachRoutes);
app.use("/api/theodoimuonsach", TheoDoiMuonSachRoutes);
app.use("/api/theloai", TheLoaiRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Cộng đồng LGBT Khoa học máy tính");
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

startServer();

//chung: xuất file excel, pdf,
//admin: thống kê doang thu
//nhanvien: lọc, tìm
//docgia: lọc, tìm
//nhanvien: lọc, tìm
//nhaxuatban: lọc, tìm
//sach: lọc, tìm,
//theodoimuonsach: lọc, tìm, tình trạng sách, mượn sách, trả sách, trễ hạn trả sách
