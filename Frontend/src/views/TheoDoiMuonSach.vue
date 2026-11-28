<template>
  <div class="space-y-6 font-sans text-text-main">
    <!-- Header -->
    <div
      class="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <h1 class="text-2xl font-extrabold tracking-tight">Theo Dõi Mượn Sách</h1>

      <button
        type="button"
        @click="openBorrowModal"
        class="px-3 py-2 rounded-btn bg-primary hover:bg-primary-hover active:bg-primary-active text-btn-text text-xs font-bold shadow-sm inline-flex items-center gap-1.5 transition"
      >
        <i class="fa-solid fa-plus"></i>
        Lập phiếu mượn
      </button>
    </div>

    <p
      v-if="borrowMessage.type === 'success'"
      role="status"
      class="rounded-card border border-success-border bg-success-bg p-3 text-sm text-success"
    >
      {{ borrowMessage.text }}
    </p>

    <!-- Bộ lọc & Tìm kiếm -->
    <div class="space-y-4 pb-3">
      <div class="flex flex-wrap gap-2 border-b border-border-subtle py-3">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          type="button"
          @click="activeTab = tab.value"
          class="px-3.5 py-1.5 rounded-btn text-xs font-bold transition flex items-center gap-1.5"
          :class="
            activeTab === tab.value
              ? 'bg-primary text-btn-text shadow-sm'
              : 'bg-bg-input text-text-label hover:bg-border-base'
          "
        >
          {{ tab.label }}
          <span
            class="ml-1 px-1.5 py-0.2 rounded-full text-[10px]"
            :class="
              activeTab === tab.value
                ? 'bg-bg-card/30 text-btn-text'
                : 'bg-border-base text-text-label'
            "
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <form
        @submit.prevent
        class="flex flex-col sm:flex-row gap-2"
        role="search"
      >
        <div class="relative flex-1">
          <i
            class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs"
          ></i>
          <input
            v-model.trim="searchKeyword"
            type="search"
            placeholder="Tìm theo Mã độc giả, Họ tên, Mã sách, Tên sách..."
            class="w-full pl-9 pr-4 p-2 rounded-input border border-border-input bg-bg-input text-xs placeholder:text-text-muted focus:bg-bg-card focus:border-primary outline-none"
          />
        </div>
        <button
          type="submit"
          class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-btn bg-primary hover:bg-primary-hover active:bg-primary-active text-btn-text text-xs font-bold shadow-sm transition"
        >
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>Tìm kiếm</span>
        </button>
      </form>
    </div>

    <!-- Bảng dữ liệu -->
    <div
      class="bg-bg-card rounded-card border border-border-base shadow-sm overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="uppercase font-sans tracking-wider border-b">
              <th
                v-for="header in TABLE_HEADERS"
                :key="header"
                class="py-3 px-3.5"
              >
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-base">
            <tr v-if="isLoading">
              <td
                :colspan="TABLE_HEADERS.length"
                class="py-8 text-center text-text-muted"
              >
                Đang tải dữ liệu...
              </td>
            </tr>

            <tr v-else-if="!filteredList.length">
              <td
                :colspan="TABLE_HEADERS.length"
                class="py-8 text-center text-text-muted"
              >
                Không có phiếu mượn nào phù hợp.
              </td>
            </tr>

            <tr
              v-else
              v-for="item in filteredList"
              :key="item._id"
              class="hover:bg-bg-page transition"
            >
              <td class="py-3 px-3.5">{{ item.SACH_INFO?.TENSACH }}</td>
              <td class="py-3 px-3.5">
                <span class="block font-bold">{{
                  item.DOCGIA_INFO?.HOTEN
                }}</span>
                <span v-if="item.DOCGIA_INFO?.DIENTHOAI" class="block">
                  SĐT: {{ item.DOCGIA_INFO.DIENTHOAI }}
                </span>
              </td>
              <td class="py-3 px-3.5">{{ formatDate(item.NGAYMUON) }}</td>
              <td class="py-3 px-3.5">{{ formatDate(item.NGAYHENTRA) }}</td>
              <td class="py-3 px-3.5">
                {{ item.NGAYTRA ? formatDate(item.NGAYTRA) : "Chưa trả" }}
              </td>
              <td class="py-3 px-3.5">{{ formatCurrency(item.TIENCOC) }}</td>

              <td class="py-3 px-3.5">
                <template v-if="getLateDays(item) > MAX_LATE_DAYS">
                  <span class="block">Tịch thu cọc</span>
                  {{ formatCurrency(item.TIENPHAT) }}
                </template>
                <template v-else-if="item.TIENPHAT > 0">
                  <span class="block">Trễ {{ getLateDays(item) }} ngày</span>
                  {{ formatCurrency(item.TIENPHAT) }}
                </template>
                <span v-else>Không phạt</span>
              </td>

              <td class="py-3 px-3.5">{{ item.TRANGTHAI }}</td>

              <td class="py-3 px-3.5 text-right space-x-1.5 whitespace-nowrap">
                <button
                  v-if="item.TRANGTHAI !== 'Đã Trả'"
                  type="button"
                  @click="returningItem = item"
                  class="px-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover active:bg-primary-active text-btn-text font-bold text-xs shadow-sm transition inline-flex items-center gap-1"
                  title="Xác nhận trả sách"
                >
                  <i class="fa-solid fa-arrow-rotate-left"></i>
                  Trả sách
                </button>

                <button
                  v-if="auth.isAdmin"
                  type="button"
                  @click="handleDelete(item._id)"
                  class="px-2.5 py-1.5 rounded-lg bg-bg-input hover:bg-danger-bg text-text-label hover:text-danger text-xs transition inline-flex items-center"
                  title="Xóa phiếu mượn (Chỉ Admin)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal lập phiếu mượn -->
    <div
      v-if="isBorrowModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-text-main/50 p-4"
      @click.self="closeBorrowModal"
    >
      <section
        class="w-full max-w-2xl rounded-card bg-bg-card p-6 shadow-2xl"
        aria-labelledby="borrow-form-title"
      >
        <div
          class="mb-4 flex items-center justify-between border-b border-border-subtle pb-3"
        >
          <h2 id="borrow-form-title" class="font-bold text-base">
            Lập phiếu mượn sách
          </h2>
          <button
            type="button"
            @click="closeBorrowModal"
            :disabled="isSubmittingBorrow"
            class="text-text-muted hover:text-text-label disabled:opacity-50"
            aria-label="Đóng"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <p
          v-if="borrowMessage.type === 'error'"
          role="status"
          class="mb-4 rounded-card border border-danger-border bg-danger-bg p-3 text-sm text-danger"
        >
          {{ borrowMessage.text }}
        </p>

        <form
          @submit.prevent="handleBorrowBook"
          class="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <div>
            <label
              for="borrow-reader-id"
              class="mb-1 block text-xs font-bold text-text-label"
            >
              MÃ ĐỘC GIẢ
            </label>
            <input
              id="borrow-reader-id"
              v-model.trim="borrowForm.MADOCGIA"
              type="text"
              required
              class="w-full p-2 rounded-input border border-border-input bg-bg-input text-xs uppercase outline-none focus:bg-bg-card focus:border-primary"
            />
          </div>

          <div>
            <label
              for="borrow-book-id"
              class="mb-1 block text-xs font-bold text-text-label"
            >
              MÃ SÁCH
            </label>
            <input
              id="borrow-book-id"
              v-model.trim="borrowForm.MASACH"
              type="text"
              required
              class="w-full p-2 rounded-input border border-border-input bg-bg-input text-xs uppercase outline-none focus:bg-bg-card focus:border-primary"
            />
          </div>

          <div>
            <label
              for="borrow-duration"
              class="mb-1 block text-xs font-bold text-text-label"
            >
              THỜI HẠN MƯỢN
            </label>
            <select
              id="borrow-duration"
              v-model.number="borrowForm.SONGAYMUON"
              class="w-full p-2 rounded-input border border-border-input bg-bg-input text-xs outline-none focus:bg-bg-card focus:border-primary"
            >
              <option
                v-for="days in DURATION_OPTIONS"
                :key="days"
                :value="days"
              >
                {{ days }} ngày
              </option>
            </select>
          </div>

          <div>
            <label
              for="borrow-date"
              class="mb-1 block text-xs font-bold text-text-label"
            >
              NGÀY MƯỢN
            </label>
            <input
              id="borrow-date"
              :value="todayDate"
              type="date"
              readonly
              class="w-full p-2 rounded-input border border-border-input bg-bg-input text-xs"
            />
          </div>

          <div>
            <label
              for="borrow-due-date"
              class="mb-1 block text-xs font-bold text-text-label"
            >
              NGÀY HẸN TRẢ
            </label>
            <input
              id="borrow-due-date"
              :value="dueDate"
              type="date"
              readonly
              class="w-full p-2 rounded-input border border-border-input bg-bg-input text-xs"
            />
          </div>

          <div class="flex items-end justify-end gap-2 sm:col-span-2">
            <button
              type="button"
              @click="closeBorrowModal"
              :disabled="isSubmittingBorrow"
              class="rounded-btn border border-border-base px-4 py-2 text-xs font-semibold text-text-label hover:bg-bg-page disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              :disabled="isSubmittingBorrow"
              class="inline-flex items-center justify-center gap-1.5 rounded-btn bg-primary px-4 py-2 text-xs font-bold text-btn-text shadow-sm transition hover:bg-primary-hover active:bg-primary-active disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i
                v-if="isSubmittingBorrow"
                class="fa-solid fa-spinner fa-spin"
              ></i>
              <i v-else class="fa-solid fa-check"></i>
              Xác nhận cho mượn
            </button>
          </div>
        </form>
      </section>
    </div>

    <!-- Modal xác nhận trả sách -->
    <div
      v-if="returningItem"
      class="fixed inset-0 z-50 flex items-center justify-center bg-text-main/50 p-4"
      @click.self="returningItem = null"
    >
      <div
        class="w-full max-w-md rounded-card bg-bg-card p-6 shadow-2xl space-y-4"
      >
        <div
          class="flex items-center justify-between pb-3 border-b border-border-subtle"
        >
          <h3 class="font-bold text-base flex items-center gap-2">
            <i class="fa-solid fa-receipt text-success"></i> Xác Nhận Trả Sách
          </h3>
          <button
            type="button"
            @click="returningItem = null"
            class="text-text-muted hover:text-text-label text-sm"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div
            class="p-3 rounded-xl bg-bg-page border border-border-subtle space-y-1"
          >
            <p>
              Sách:
              <strong>{{
                returningItem.SACH_INFO?.TENSACH || returningItem.MASACH
              }}</strong>
            </p>
            <p>
              Mã sách:
              <span class="text-info">{{ returningItem.MASACH }}</span>
            </p>
            <p>
              Độc giả:
              <strong>{{
                returningItem.DOCGIA_INFO?.HOTEN || returningItem.MADOCGIA
              }}</strong>
            </p>
            <p>
              Hạn trả:
              <span class="font-semibold">{{
                formatDate(returningItem.NGAYHENTRA)
              }}</span>
            </p>
            <p>
              Tiền cọc lúc mượn:
              <strong class="text-info">{{
                formatCurrency(returningItem.TIENCOC)
              }}</strong>
            </p>
          </div>

          <!-- Quá hạn > 30 ngày -->
          <div
            v-if="returnSummary.isConfiscated"
            class="p-4 rounded-xl bg-danger-bg border border-danger-border text-danger space-y-1.5"
          >
            <div class="flex items-center gap-2 font-bold text-sm">
              <i class="fa-solid fa-skull-crossbones text-base"></i>
              ĐÃ QUÁ HẠN {{ MAX_LATE_DAYS }} NGÀY!
            </div>
            <p>
              Số ngày trễ hạn:
              <strong>{{ returnSummary.lateDays }} ngày</strong>.
            </p>
            <p class="font-bold">
              QUY ĐỊNH: Tịch thu toàn bộ tiền cọc mượn sách:
              <span class="text-sm font-extrabold text-danger-hover block mt-1">
                {{ formatCurrency(returnSummary.forfeitedDeposit) }}
              </span>
            </p>
            <p class="text-[11px] italic">
              Tiền cọc được sung quỹ thư viện. Không hoàn trả tiền cọc cho độc
              giả.
            </p>
          </div>

          <!-- Trễ hạn <= 30 ngày -->
          <div
            v-else-if="returnSummary.lateDays > 0"
            class="p-4 rounded-xl bg-warning-bg border border-warning-border text-warning space-y-1"
          >
            <p class="font-bold flex items-center gap-1.5">
              <i class="fa-solid fa-circle-exclamation"></i>
              Trễ hạn {{ returnSummary.lateDays }} ngày
            </p>
            <p>
              Tiền phạt ({{ FINE_PER_DAY.toLocaleString("vi-VN") }}đ/ngày):
              <strong class="text-danger">{{
                formatCurrency(returnSummary.fine)
              }}</strong>
            </p>
            <p>
              Tiền cọc hoàn trả lại cho bạn đọc:
              <strong class="text-success">{{
                formatCurrency(returnSummary.refund)
              }}</strong>
            </p>
          </div>

          <!-- Trả đúng hạn -->
          <div
            v-else
            class="p-4 rounded-xl bg-success-bg border border-success-border text-success"
          >
            <p class="font-bold flex items-center gap-1.5">
              <i class="fa-solid fa-circle-check"></i> Trả sách đúng hạn!
            </p>
            <p class="mt-1">
              Hoàn trả 100% tiền cọc cho độc giả:
              <strong class="font-bold text-sm ml-1">
                {{ formatCurrency(returningItem.TIENCOC) }}
              </strong>
            </p>
          </div>
        </div>

        <div
          class="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle"
        >
          <button
            type="button"
            @click="returningItem = null"
            class="px-4 py-2 rounded-btn border border-border-base text-xs font-semibold text-text-label hover:bg-bg-page"
          >
            Hủy
          </button>
          <button
            type="button"
            @click="confirmReturn"
            :disabled="isReturning"
            class="px-5 py-2 rounded-btn bg-primary hover:bg-primary-hover active:bg-primary-active text-btn-text text-xs font-bold shadow-sm transition flex items-center gap-2"
          >
            <i v-if="isReturning" class="fa-solid fa-spinner fa-spin"></i>
            Xác Nhận Trả Sách
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import theodoimuonsachService from "@/services/theodoimuonsachService";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const FINE_PER_DAY = 5000;
const MAX_LATE_DAYS = 30;
const DURATION_OPTIONS = [7, 14, 21, 30];
const TABLE_HEADERS = [
  "Tên Sách",
  "Độc Giả",
  "Ngày Mượn",
  "Hạn Trả",
  "Ngày Trả",
  "Tiền Cọc",
  "Phạt",
  "Trạng Thái",
  "Tùy Chỉnh",
];

const auth = useAuthStore();
const isLoading = ref(false);
const isSubmittingBorrow = ref(false);
const isReturning = ref(false);

const fullList = ref([]);
const searchKeyword = ref("");
const activeTab = ref("ALL");
const isBorrowModalOpen = ref(false);
const returningItem = ref(null);
const borrowMessage = ref({ type: "", text: "" });
const borrowForm = ref({ MADOCGIA: "", MASACH: "", SONGAYMUON: 14 });

// --- Helpers ---
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const toDateInput = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatCurrency = (val) =>
  val ? `${Number(val).toLocaleString("vi-VN")} đ` : "0 đ";

const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString("vi-VN") : "-";

const getErrorMessage = (err, fallback) =>
  err.response?.data?.message || err.message || fallback;

const isOverdue = (item) =>
  !item.NGAYTRA &&
  Boolean(item.NGAYHENTRA) &&
  startOfDay(item.NGAYHENTRA) < startOfDay(new Date());

const getLateDays = (item) => {
  if (!item?.NGAYHENTRA) return 0;
  const endDate = item.NGAYTRA ? new Date(item.NGAYTRA) : new Date();
  const diffMs = startOfDay(endDate) - startOfDay(item.NGAYHENTRA);
  return Math.max(0, Math.ceil(diffMs / MS_PER_DAY));
};

// --- Computed ---
const todayDate = toDateInput(new Date());

const dueDate = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() + Number(borrowForm.value.SONGAYMUON));
  return toDateInput(date);
});

const TAB_FILTERS = {
  ALL: () => true,
  DangMuon: (i) => i.TRANGTHAI === "Đang Mượn" && !isOverdue(i),
  TreHan: (i) => i.TRANGTHAI === "Trễ Hạn" || isOverdue(i),
  DaTra: (i) => i.TRANGTHAI === "Đã Trả",
};

const statusTabs = computed(() => [
  { label: "Tất cả phiếu", value: "ALL", count: fullList.value.length },
  {
    label: "Đang mượn",
    value: "DangMuon",
    count: fullList.value.filter(TAB_FILTERS.DangMuon).length,
  },
  {
    label: "Trễ hạn",
    value: "TreHan",
    count: fullList.value.filter(TAB_FILTERS.TreHan).length,
  },
  {
    label: "Đã trả",
    value: "DaTra",
    count: fullList.value.filter(TAB_FILTERS.DaTra).length,
  },
]);

const filteredList = computed(() => {
  const kw = searchKeyword.value.toLowerCase();
  const tabFilter = TAB_FILTERS[activeTab.value] || TAB_FILTERS.ALL;

  return fullList.value.filter((item) => {
    if (!tabFilter(item)) return false;
    if (!kw) return true;

    return [
      item.MASACH,
      item.MADOCGIA,
      item.SACH_INFO?.TENSACH,
      item.DOCGIA_INFO?.HOTEN,
    ].some((field) => field?.toLowerCase().includes(kw));
  });
});

const returnSummary = computed(() => {
  const item = returningItem.value;
  if (!item)
    return {
      lateDays: 0,
      isConfiscated: false,
      fine: 0,
      refund: 0,
      forfeitedDeposit: 0,
    };

  const lateDays = getLateDays({ ...item, NGAYTRA: null });
  const deposit = Number(item.TIENCOC) || 0;
  const fine = lateDays * FINE_PER_DAY;

  return {
    lateDays,
    isConfiscated: lateDays > MAX_LATE_DAYS,
    fine,
    refund: Math.max(0, deposit - fine),
    forfeitedDeposit: deposit || 50000,
  };
});

// --- Actions ---
const openBorrowModal = () => {
  borrowMessage.value = { type: "", text: "" };
  isBorrowModalOpen.value = true;
};

const closeBorrowModal = () => {
  if (!isSubmittingBorrow.value) isBorrowModalOpen.value = false;
};

const fetchData = async () => {
  try {
    isLoading.value = true;
    fullList.value =
      (await theodoimuonsachService.getAllTheoDoiMuonSach()) || [];
  } catch (err) {
    console.error("Lỗi khi tải sổ mượn sách:", err);
  } finally {
    isLoading.value = false;
  }
};

const handleBorrowBook = async () => {
  try {
    isSubmittingBorrow.value = true;
    borrowMessage.value = { type: "", text: "" };

    const result = await theodoimuonsachService.muonSach({
      MADOCGIA: borrowForm.value.MADOCGIA.toUpperCase(),
      MASACH: borrowForm.value.MASACH.toUpperCase(),
      SONGAYMUON: borrowForm.value.SONGAYMUON,
    });

    borrowMessage.value = {
      type: "success",
      text: result.message || "Lập phiếu mượn sách thành công!",
    };
    borrowForm.value.MADOCGIA = "";
    borrowForm.value.MASACH = "";
    isBorrowModalOpen.value = false;
    await fetchData();
  } catch (err) {
    borrowMessage.value = {
      type: "error",
      text: getErrorMessage(err, "Lỗi khi lập phiếu mượn"),
    };
  } finally {
    isSubmittingBorrow.value = false;
  }
};

const confirmReturn = async () => {
  if (!returningItem.value) return;
  try {
    isReturning.value = true;
    const res = await theodoimuonsachService.traSach(returningItem.value._id);
    alert(res.message || "Trả sách thành công!");
    returningItem.value = null;
    await fetchData();
  } catch (err) {
    alert(getErrorMessage(err, "Lỗi khi trả sách"));
  } finally {
    isReturning.value = false;
  }
};

const handleDelete = async (id) => {
  if (!confirm("Bạn có chắc chắn muốn xóa bản ghi phiếu mượn này?")) return;
  try {
    await theodoimuonsachService.deleteTheoDoiMuonSach(id);
    alert("Xóa thành công!");
    await fetchData();
  } catch (err) {
    alert(getErrorMessage(err, "Lỗi khi xóa"));
  }
};

onMounted(fetchData);
</script>
