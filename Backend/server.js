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
const ThongKeRoutes = require("./app/routes/thongkeRoutes");

const app = express();

dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());

// Phục vụ ảnh bìa sách
app.use("/uploads", express.static(path.join(__dirname, "app/uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/nhaxuatban", NhaXuatBanRoutes);
app.use("/api/nhanvien", NhanVienRoutes);
app.use("/api/docgia", DocGiaRoutes);
app.use("/api/sach", SachRoutes);
app.use("/api/theodoimuonsach", TheoDoiMuonSachRoutes);
app.use("/api/theloai", TheLoaiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/thongke", ThongKeRoutes);

app.get("/", (req, res) => {
  res.send("API Quản lý Mượn Sách đang hoạt động");
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
