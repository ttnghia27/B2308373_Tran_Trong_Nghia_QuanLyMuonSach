<template>
  <div class="space-y-6 font-sans text-text-main">
    <!-- Header banner -->
    <div class="pb-2">
      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 class="text-2xl font-extrabold text-text-main tracking-tight">
            Dashboard
          </h1>
        </div>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div
      v-if="isLoading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse"
    >
      <div
        v-for="n in 8"
        :key="n"
        class="h-28 rounded-card bg-border-base"
      ></div>
    </div>

    <!-- Metric Cards Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Card 1: Tổng đầu sách -->
      <div
        class="rounded-card border border-border-base bg-bg-card p-5 shadow-card hover:shadow-md transition"
      >
        <div class="flex items-center justify-between">
          <p class="text-xs text-text-muted uppercase">Tổng đầu sách</p>
        </div>
        <div class="mt-3">
          <h3 class="text-2xl font-bold text-text-main">
            {{ stats.totalBooks || 0 }}
          </h3>
          <p class="text-xs text-text-muted mt-1">
            Kho có {{ stats.totalCopies || 0 }} quyển
          </p>
        </div>
      </div>

      <!-- Card 2: Đang mượn -->
      <div
        class="rounded-card border border-border-base bg-bg-card p-5 shadow-card hover:shadow-md transition"
      >
        <div class="flex items-center justify-between">
          <p class="text-xs text-text-muted uppercase">Đang cho mượn</p>
        </div>
        <div class="mt-3">
          <h3 class="text-2xl font-bold text-text-main">
            {{ stats.borrowingCount || 0 }}
          </h3>
          <p class="text-xs text-text-muted mt-1">Phiếu lưu thông hợp lệ</p>
        </div>
      </div>

      <!-- Card 3: Trễ hạn -->
      <div
        class="rounded-card border border-border-base bg-bg-card p-5 shadow-card hover:shadow-md transition"
      >
        <div class="flex items-center justify-between">
          <p class="text-xs text-text-muted uppercase">Phiếu quá hạn</p>
        </div>
        <div class="mt-3">
          <h3 class="text-2xl font-bold text-text-main">
            {{ stats.overdueCount || 0 }}
          </h3>
          <p class="text-xs text-text-muted mt-1">Cần nhắc nhở / xử lý phạt</p>
        </div>
      </div>

      <!-- Card 4: Tịch thu cọc (> 30 ngày) -->
      <div
        class="rounded-card border border-border-base bg-bg-card p-5 shadow-card hover:shadow-md transition"
      >
        <div class="flex items-center justify-between">
          <p class="text-xs text-text-muted uppercase">
            Tịch thu cọc (>30 ngày)
          </p>
        </div>
        <div class="mt-3">
          <h3 class="text-2xl font-bold text-text-main">
            {{ stats.confiscatedDepositCount || 0 }}
          </h3>
          <p class="text-xs text-text-muted mt-1">Vượt 30 ngày trễ hạn</p>
        </div>
      </div>

      <!-- Card 5: Tổng độc giả -->
      <div
        class="rounded-card border border-border-base bg-bg-card p-5 shadow-card hover:shadow-md transition"
      >
        <div class="flex items-center justify-between">
          <p class="text-xs text-text-muted uppercase">Hồ sơ độc giả</p>
        </div>
        <div class="mt-3">
          <h3 class="text-2xl font-bold text-text-main">
            {{ stats.totalReaders || 0 }}
          </h3>
          <p class="text-xs text-text-muted mt-1">Đã đăng ký làm thẻ</p>
        </div>
      </div>

      <!-- Card 6: Đã trả thành công -->
      <div
        class="rounded-card border border-border-base bg-bg-card p-5 shadow-card hover:shadow-md transition"
      >
        <div class="flex items-center justify-between">
          <p class="text-xs text-text-muted uppercase">Lượt trả thành công</p>
        </div>
        <div class="mt-3">
          <h3 class="text-2xl font-bold text-text-main">
            {{ stats.returnedCount || 0 }}
          </h3>
          <p class="text-xs text-text-muted mt-1">Đã hoàn trả về kho</p>
        </div>
      </div>

      <!-- Card 7: Nhân sự thư viện -->
      <div
        class="rounded-card border border-border-base bg-bg-card p-5 shadow-card hover:shadow-md transition"
      >
        <div class="flex items-center justify-between">
          <p class="text-xs text-text-muted uppercase">Nhân viên thư viện</p>
        </div>
        <div class="mt-3">
          <h3 class="text-2xl font-bold text-text-main">
            {{ stats.totalStaff || 0 }}
          </h3>
          <p class="text-xs text-text-muted mt-1">Quản lý nhân viên</p>
        </div>
      </div>

      <!-- Card 8: Tổng tiền phạt / cọc đã thu -->
      <div
        class="rounded-card border border-border-base bg-bg-card p-5 shadow-card hover:shadow-md transition"
      >
        <div class="flex items-center justify-between">
          <p class="text-xs text-text-muted uppercase">Tiền phạt & cọc thu</p>
        </div>
        <div class="mt-3">
          <h3 class="text-2xl font-bold text-text-main">
            {{ formatCurrency(stats.totalFineCollected) }}
          </h3>
          <p class="text-xs text-text-muted mt-1">
            Bao gồm phạt trễ + cọc quá 30d
          </p>
        </div>
      </div>
    </div>

    <!-- Secondary section: Top Books & Recent Activities -->
    <div class="grid py-3 grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Top 5 sách mượn nhiều nhất -->
      <div
        class="rounded-card border border-border-base bg-bg-card p-6 shadow-sm"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-base text-text-main">
            Top Sách Mượn Nhiều Nhất
          </h3>
          <RouterLink to="/sach" class="text-xs text-primary hover:underline">
            Xem kho sách
          </RouterLink>
        </div>

        <div v-if="stats.topBooks?.length" class="space-y-3">
          <div
            v-for="(book, index) in stats.topBooks"
            :key="book.MASACH"
            class="flex items-center justify-between p-3 rounded-xl bg-bg-page border border-border-subtle"
          >
            <div class="flex items-center gap-3">
              <span class="text-xs text-text-muted">#{{ index + 1 }}</span>
              <div>
                <p class="text-sm text-text-main">{{ book.TENSACH }}</p>
                <p class="text-xs text-text-muted">Mã: {{ book.MASACH }}</p>
              </div>
            </div>
            <span class="text-xs text-text-muted">
              {{ book.count }} lượt mượn
            </span>
          </div>
        </div>
        <div v-else class="text-center py-8 text-xs text-text-muted">
          Chưa có dữ liệu mượn sách.
        </div>
      </div>

      <!-- Hoạt động mượn trả gần nhất -->
      <div
        class="rounded-card border border-border-base bg-bg-card p-6 shadow-sm"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-base text-text-main">
            Hoạt Động Mượn Trả Gần Nhất
          </h3>
          <RouterLink
            to="/theodoimuonsach"
            class="text-xs text-primary hover:underline"
          >
            Xem tất cả
          </RouterLink>
        </div>

        <div v-if="stats.recentActivities?.length" class="space-y-2.5">
          <div
            v-for="act in stats.recentActivities"
            :key="act._id"
            class="flex items-center justify-between p-3 rounded-xl bg-bg-page border border-border-subtle text-xs"
          >
            <div class="space-y-0.5">
              <p class="text-text-main">
                Độc giả: {{ act.MADOCGIA }} - Sách: {{ act.MASACH }}
              </p>
              <p class="text-text-muted">
                Ngày mượn: {{ formatDate(act.NGAYMUON) }} | Hạn trả:
                {{ formatDate(act.NGAYHENTRA) }}
              </p>
            </div>
            <div class="text-right">
              <span class="text-text-main">{{ act.TRANGTHAI }}</span>
              <p v-if="act.TIENPHAT > 0" class="text-text-muted mt-1">
                Phạt: {{ formatCurrency(act.TIENPHAT) }}
              </p>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-xs text-text-muted">
          Chưa có hoạt động mượn trả nào.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import thongkeService from "@/services/thongkeService";

const isLoading = ref(false);
const stats = ref({});

const formatCurrency = (val) => {
  if (!val) return "0 đ";
  return Number(val).toLocaleString("vi-VN") + " đ";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

const loadStats = async () => {
  try {
    isLoading.value = true;
    const res = await thongkeService.getTongQuan();
    stats.value = res || {};
  } catch (err) {
    console.error("Lỗi khi tải thống kê:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadStats();
});
</script>
