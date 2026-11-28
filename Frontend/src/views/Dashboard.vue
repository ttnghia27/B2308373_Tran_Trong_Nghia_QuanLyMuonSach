<template>
  <div class="space-y-6 font-sans text-text-main">
    <!-- Header -->
    <h1 class="text-2xl font-extrabold tracking-tight pb-2">Dashboard</h1>

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
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 py-3"
    >
      <div
        v-for="card in metricCards"
        :key="card.title"
        class="rounded-card border border-border-base bg-bg-card p-5 shadow-card hover:shadow-md transition"
      >
        <p class="text-xs text-text-muted uppercase">{{ card.title }}</p>
        <h3 class="mt-3 text-2xl font-bold">{{ card.value }}</h3>
        <p class="mt-1 text-xs text-text-muted">{{ card.subtitle }}</p>
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
          <h3 class="font-bold text-base">Thống Kê Tiền Thu</h3>
          <p class="text-xs text-text-muted mt-1">
            Tiền cọc theo ngày cho mượn + tiền phạt theo ngày trả
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2 py-1.5">
          <div
            class="flex rounded-btn border border-border-base p-1 bg-bg-page"
          >
            <button
              v-for="option in periodOptions"
              :key="option.value"
              type="button"
              @click="period = option.value"
              class="w-24 shrink-0 px-3 py-1.5 rounded-btn text-center text-xs font-bold whitespace-nowrap transition"
              :class="
                period === option.value
                  ? 'bg-primary text-btn-text'
                  : 'text-text-muted hover:text-text-main'
              "
            >
              {{ option.label }}
            </button>
          </div>

          <div
            class="rounded-input border border-border-input bg-bg-input px-3 py-2 text-xs outline-none focus:border-primary w-40"
          >
            <input v-if="period === 'day'" v-model="selectedDay" type="date" />
            <input
              v-else-if="period === 'month'"
              v-model="selectedMonth"
              type="month"
            />
            <input
              v-else
              v-model.number="selectedYear"
              type="number"
              min="2000"
              max="2100"
            />
          </div>
        </div>
      </div>

      <!-- Tổng hợp tiền thu -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div
          v-for="item in revenueSummary"
          :key="item.label"
          class="rounded-xl bg-bg-page border border-border-subtle p-3"
        >
          <p class="text-[11px] text-text-muted">{{ item.label }}</p>
          <p class="text-lg font-bold mt-1" :class="item.colorClass">
            {{ formatCurrency(item.value) }}
          </p>
        </div>
      </div>

      <!-- Biểu đồ cột -->
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
            class="relative h-full flex-1 min-w-0 flex flex-col items-center justify-end"
            :title="`${bucket.label}: Cọc ${formatCurrency(bucket.deposit)}, Phạt ${formatCurrency(bucket.fine)}`"
          >
            <div
              v-if="bucket.total > 0"
              class="w-[72%] max-w-6 min-h-1 rounded-t-sm overflow-hidden flex flex-col-reverse"
              :style="{
                height: `${Math.max(3, (bucket.total / chartMax) * 88)}%`,
              }"
            >
              <div
                v-if="bucket.deposit > 0"
                class="w-full bg-primary"
                :style="{ height: `${(bucket.deposit / bucket.total) * 100}%` }"
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
              class="absolute bottom-0 translate-y-5 text-[9px] text-text-muted"
            >
              {{ bucket.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Chú thích -->
      <div class="mt-8 flex justify-center gap-5 text-xs text-text-muted py-5">
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm bg-primary"></span> Doanh thu
        </span>
        <span class="flex items-center gap-1.5">
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
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");

const selectedDay = ref(`${year}-${month}-${day}`);
const selectedMonth = ref(`${year}-${month}`);
const selectedYear = ref(year);

const revenue = ref({
  chart: [],
  depositTotal: 0,
  fineTotal: 0,
  grandTotal: 0,
});

const formatCurrency = (val) =>
  val ? `${Number(val).toLocaleString("vi-VN")} đ` : "0 đ";

const metricCards = computed(() => [
  {
    title: "Tổng đầu sách",
    value: stats.value.totalBooks || 0,
    subtitle: `Kho có ${stats.value.totalCopies || 0} quyển`,
  },
  {
    title: "Đang cho mượn",
    value: stats.value.borrowingCount || 0,
    subtitle: "Phiếu lưu thông hợp lệ",
  },
  {
    title: "Phiếu quá hạn",
    value: stats.value.overdueCount || 0,
    subtitle: "Cần nhắc nhở / xử lý phạt",
  },
  {
    title: "Tịch thu cọc (>30 ngày)",
    value: stats.value.confiscatedDepositCount || 0,
    subtitle: "Vượt quá 30 ngày",
  },
  {
    title: "Lượt trả thành công",
    value: stats.value.returnedCount || 0,
    subtitle: "Đã hoàn trả về kho",
  },
]);

const revenueSummary = computed(() => [
  {
    label: "Tiền cọc thu",
    value: revenue.value.depositTotal,
    colorClass: "text-primary",
  },
  {
    label: "Tiền phạt thu",
    value: revenue.value.fineTotal,
    colorClass: "text-danger",
  },
  {
    label: "Tổng tiền thu",
    value: revenue.value.grandTotal,
    colorClass: "text-text-main",
  },
]);

const chartMax = computed(() =>
  Math.max(1, ...revenue.value.chart.map((bucket) => bucket.total || 0)),
);

const loadStats = async () => {
  try {
    isLoading.value = true;
    stats.value = (await thongkeService.getTongQuan()) || {};
  } catch (err) {
    console.error("Lỗi khi tải thống kê:", err);
  } finally {
    isLoading.value = false;
  }
};

const loadRevenue = async () => {
  try {
    revenueLoading.value = true;
    const paramMap = {
      day: { date: selectedDay.value },
      month: { month: selectedMonth.value },
      year: { year: selectedYear.value },
    };

    const data = await thongkeService.getThuTheoThoiGian({
      period: period.value,
      ...paramMap[period.value],
    });
    if (data) revenue.value = data;
  } catch (err) {
    console.error("Lỗi khi tải biểu đồ tiền thu:", err);
  } finally {
    revenueLoading.value = false;
  }
};

watch([period, selectedDay, selectedMonth, selectedYear], loadRevenue);

onMounted(() => {
  loadStats();
  loadRevenue();
});
</script>
