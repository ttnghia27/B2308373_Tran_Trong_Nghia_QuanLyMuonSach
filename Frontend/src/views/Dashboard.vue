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
        v-for="n in 9"
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

      <!-- Card 8: Tiền thu khi cho mượn -->
      <div
        class="rounded-card border border-border-base bg-bg-card p-5 shadow-card hover:shadow-md transition"
      >
        <div class="flex items-center justify-between">
          <p class="text-xs text-text-muted uppercase">Tiền thu khi cho mượn</p>
        </div>
        <div class="mt-3">
          <h3 class="text-2xl font-bold text-text-main">
            {{ formatCurrency(stats.totalDepositCollected) }}
          </h3>
          <p class="text-xs text-text-muted mt-1">
            Tổng tiền cọc đã thu từ phiếu hợp lệ
          </p>
        </div>
      </div>
    </div>

    <!-- Biểu đồ thống kê tiền thu -->
    <div
      class="rounded-card border border-border-base bg-bg-card p-5 shadow-card"
    >
      <div
        class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5"
      >
        <div>
          <h3 class="font-bold text-base text-text-main">Thống Kê Tiền Thu</h3>
          <p class="text-xs text-text-muted mt-1">
            Tiền cọc theo ngày cho mượn + tiền phạt theo ngày trả
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div
            class="flex rounded-btn border border-border-base p-1 bg-bg-page"
          >
            <button
              v-for="option in periodOptions"
              :key="option.value"
              type="button"
              @click="period = option.value"
              class="px-3 py-1.5 rounded text-xs font-bold transition"
              :class="
                period === option.value
                  ? 'bg-primary text-btn-text'
                  : 'text-text-muted hover:text-text-main'
              "
            >
              {{ option.label }}
            </button>
          </div>

          <input
            v-if="period === 'day'"
            v-model="selectedDay"
            type="date"
            class="rounded-input border border-border-input bg-bg-input px-3 py-2 text-xs outline-none focus:border-primary"
          />
          <input
            v-else-if="period === 'month'"
            v-model="selectedMonth"
            type="month"
            class="rounded-input border border-border-input bg-bg-input px-3 py-2 text-xs outline-none focus:border-primary"
          />
          <input
            v-else
            v-model="selectedYear"
            type="number"
            min="2000"
            max="2100"
            class="w-24 rounded-input border border-border-input bg-bg-input px-3 py-2 text-xs outline-none focus:border-primary"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div class="rounded-xl bg-bg-page border border-border-subtle p-3">
          <p class="text-[11px] text-text-muted">Tiền cọc thu</p>
          <p class="text-lg font-bold text-primary mt-1">
            {{ formatCurrency(revenue.depositTotal) }}
          </p>
        </div>
        <div class="rounded-xl bg-bg-page border border-border-subtle p-3">
          <p class="text-[11px] text-text-muted">Tiền phạt thu</p>
          <p class="text-lg font-bold text-danger mt-1">
            {{ formatCurrency(revenue.fineTotal) }}
          </p>
        </div>
        <div class="rounded-xl bg-bg-page border border-border-subtle p-3">
          <p class="text-[11px] text-text-muted">Tổng tiền thu</p>
          <p class="text-lg font-bold text-text-main mt-1">
            {{ formatCurrency(revenue.grandTotal) }}
          </p>
        </div>
      </div>

      <div
        v-if="revenueLoading"
        class="h-64 flex items-center justify-center text-xs text-text-muted"
      >
        <i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải biểu đồ...
      </div>
      <div
        v-else
        class="relative h-64 border-b border-l border-border-base pl-2"
      >
        <div
          class="absolute inset-0 flex flex-col justify-between pointer-events-none"
        >
          <div
            v-for="line in 5"
            :key="line"
            class="border-t border-border-subtle/70"
          ></div>
        </div>
        <div class="absolute inset-0 flex items-end gap-[2px] px-1">
          <div
            v-for="(bucket, index) in revenue.chart"
            :key="bucket.label"
            class="h-full flex-1 min-w-0 flex items-end justify-center"
            :title="`${bucket.label}: Cọc ${formatCurrency(bucket.deposit)}, Phạt ${formatCurrency(bucket.fine)}`"
          >
            <div
              class="w-full max-w-8 flex flex-col items-center justify-end h-full"
            >
              <div
                v-if="bucket.total > 0"
                class="w-[72%] min-h-1 rounded-t-sm overflow-hidden flex flex-col-reverse"
                :style="{
                  height: `${Math.max(3, (bucket.total / chartMax) * 88)}%`,
                }"
              >
                <div
                  v-if="bucket.deposit > 0"
                  class="w-full bg-primary"
                  :style="{
                    height: `${(bucket.deposit / bucket.total) * 100}%`,
                  }"
                ></div>
                <div
                  v-if="bucket.fine > 0"
                  class="w-full bg-danger"
                  :style="{ height: `${(bucket.fine / bucket.total) * 100}%` }"
                ></div>
              </div>
              <span
                v-if="
                  period !== 'month' ||
                  index % 2 === 0 ||
                  index === revenue.chart.length - 1
                "
                class="absolute mt-[14px] translate-y-4 text-[9px] text-text-muted"
                :style="{ alignSelf: 'center' }"
              >
                {{ bucket.label }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-5 flex justify-center gap-5 mt-7 text-xs">
        <span class="flex items-center gap-1.5 text-text-muted">
          <span class="w-3 h-3 rounded-sm bg-primary"></span> Tiền cọc
        </span>
        <span class="flex items-center gap-1.5 text-text-muted">
          <span class="w-3 h-3 rounded-sm bg-danger"></span> Tiền phạt
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import thongkeService from "@/services/thongkeService";

const isLoading = ref(false);
const stats = ref({});
const revenueLoading = ref(false);
const period = ref("month");
const periodOptions = [
  { label: "Theo ngày", value: "day" },
  { label: "Theo tháng", value: "month" },
  { label: "Theo năm", value: "year" },
];

const now = new Date();
const formatInputDay = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const selectedDay = ref(formatInputDay(now));
const selectedMonth = ref(
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
);
const selectedYear = ref(now.getFullYear());
const revenue = ref({
  chart: [],
  depositTotal: 0,
  fineTotal: 0,
  grandTotal: 0,
});

const chartMax = computed(() =>
  Math.max(1, ...revenue.value.chart.map((bucket) => bucket.total || 0)),
);

const formatCurrency = (val) => {
  if (!val) return "0 đ";
  return Number(val).toLocaleString("vi-VN") + " đ";
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

const loadRevenue = async () => {
  try {
    revenueLoading.value = true;
    const params =
      period.value === "day"
        ? { period: period.value, date: selectedDay.value }
        : period.value === "month"
          ? { period: period.value, month: selectedMonth.value }
          : { period: period.value, year: selectedYear.value };
    revenue.value =
      (await thongkeService.getThuTheoThoiGian(params)) || revenue.value;
  } catch (err) {
    console.error("Lỗi khi tải biểu đồ tiền thu:", err);
  } finally {
    revenueLoading.value = false;
  }
};

watch([period, selectedDay, selectedMonth, selectedYear], () => loadRevenue());

onMounted(() => {
  loadStats();
  loadRevenue();
});
</script>
