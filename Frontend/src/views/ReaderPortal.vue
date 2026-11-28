<template>
  <div class="space-y-6 font-sans text-text-main">
    <!-- Header Banner -->
    <div
      class="rounded-card bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border-base p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl font-black tracking-tight mt-1">
          Xin chào, {{ auth.displayName || "Bạn đọc" }}!
        </h1>
        <p class="text-xs text-text-muted mt-0.5">
          Mã thẻ độc giả:
          <strong class="text-primary">{{
            auth.user?.MADOCGIA || "DG..."
          }}</strong>
          | Tra cứu kho sách và theo dõi lịch sử mượn trả
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="activeMainTab = 'books'"
          class="px-4 py-2 rounded-btn text-xs font-bold transition flex items-center gap-2"
          :class="
            activeMainTab === 'books'
              ? 'bg-primary text-btn-text shadow-sm'
              : 'bg-bg-card hover:bg-bg-input text-text-label border border-border-base'
          "
        >
          <i class="fa-solid fa-book-open"></i>
          <span>Kho Sách Thư Viện</span>
        </button>

        <button
          type="button"
          @click="activeMainTab = 'loans'"
          class="px-4 py-2 rounded-btn text-xs font-bold transition flex items-center gap-2 relative"
          :class="
            activeMainTab === 'loans'
              ? 'bg-primary text-btn-text shadow-sm'
              : 'bg-bg-card hover:bg-bg-input text-text-label border border-border-base'
          "
        >
          <i class="fa-solid fa-clock-rotate-left"></i>
          <span>Phiếu Mượn Của Tôi</span>
          <span
            v-if="pendingCount > 0"
            class="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]"
            title="Số yêu cầu đang chờ duyệt"
          >
            {{ pendingCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- Alert Message -->
    <p
      v-if="alertMessage.text"
      role="status"
      class="rounded-card p-3 text-xs flex items-center justify-between"
      :class="
        alertMessage.type === 'success'
          ? 'bg-success-bg border border-success-border text-success'
          : 'bg-danger-bg border border-danger-border text-danger'
      "
    >
      <span class="flex items-center gap-2">
        <i
          :class="
            alertMessage.type === 'success'
              ? 'fa-solid fa-circle-check'
              : 'fa-solid fa-circle-exclamation'
          "
        ></i>
        {{ alertMessage.text }}
      </span>
      <button @click="alertMessage.text = ''" class="hover:opacity-75">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </p>

    <!-- TAB 1: KHO SÁCH & GỬI YÊU CẦU MƯỢN -->
    <section v-if="activeMainTab === 'books'" class="space-y-4">
      <!-- Thanh tìm kiếm & lọc thể loại -->
      <div class="flex flex-col sm:flex-row gap-2.5">
        <div class="relative flex-1">
          <i
            class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs"
          ></i>
          <input
            v-model.trim="bookSearch"
            type="search"
            placeholder="Tìm theo tên sách, tác giả, mã sách..."
            class="w-full pl-9 pr-4 p-2.5 rounded-input border border-border-input bg-bg-card text-xs placeholder:text-text-muted focus:border-primary outline-none"
          />
        </div>

        <!-- Dropdown lọc thể loại sách (Chuẩn hóa MATL / TENTL) -->
        <select
          v-model="selectedCategory"
          class="p-2.5 rounded-input border border-border-input bg-bg-card text-xs outline-none focus:border-primary min-w-[180px]"
        >
          <option value="">Tất cả thể loại ({{ categories.length }})</option>
          <option
            v-for="tl in categories"
            :key="tl.MATL || tl.MATHELOAI"
            :value="tl.MATL || tl.MATHELOAI"
          >
            {{ tl.TENTL || tl.TENTHELOAI }}
          </option>
        </select>
      </div>

      <!-- Danh sách sách (Grid Card) -->
      <div
        v-if="isBooksLoading"
        class="py-12 text-center text-text-muted text-xs"
      >
        <i class="fa-solid fa-spinner fa-spin text-lg mb-2 block"></i>
        Đang tải danh mục sách...
      </div>

      <div
        v-else-if="!filteredBooks.length"
        class="py-12 text-center text-text-muted bg-bg-card rounded-card border border-border-base text-xs"
      >
        Không tìm thấy cuốn sách nào phù hợp với bộ lọc thể loại hoặc từ khóa
        tìm kiếm.
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <div
          v-for="book in filteredBooks"
          :key="book._id"
          class="bg-bg-card rounded-card border border-border-base p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <!-- Book Cover & Status -->
            <div
              class="h-44 w-full bg-bg-input rounded-lg overflow-hidden flex items-center justify-center relative mb-3 border border-border-subtle"
            >
              <img
                v-if="book.HINHAH || book.HINHANH"
                :src="book.HINHAH || book.HINHANH"
                class="h-full w-full object-cover"
                alt="cover"
              />
              <i v-else class="fa-solid fa-book text-4xl text-text-muted"></i>

              <span
                class="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm"
                :class="
                  book.SOQUYEN > 0
                    ? 'bg-emerald-600 text-white'
                    : 'bg-danger text-white'
                "
              >
                {{ book.SOQUYEN > 0 ? `Còn ${book.SOQUYEN} quyển` : "Tạm hết" }}
              </span>
            </div>

            <!-- Category Badge -->
            <span
              v-if="categoryMap.get(book.MATL || book.MATHELOAI)"
              class="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary mb-1"
            >
              {{ categoryMap.get(book.MATL || book.MATHELOAI) }}
            </span>

            <!-- Book Info -->
            <h3
              class="font-bold text-sm text-text-main line-clamp-2 leading-snug"
            >
              {{ book.TENSACH }}
            </h3>
            <p class="text-xs text-text-muted mt-1 flex items-center gap-1.5">
              <i class="fa-solid fa-user-pen text-[10px]"></i>
              <span>{{
                book["NGUONGOC/TACGIA"] || book.TACGIA || "Đang cập nhật"
              }}</span>
            </p>
            <p class="text-[11px] text-text-muted mt-0.5">
              Năm XB: {{ book.NAMXUATBAN || "-" }} | Mã: {{ book.MASACH }}
            </p>
          </div>

          <!-- Bottom Price & Borrow Button -->
          <div
            class="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between"
          >
            <div>
              <span
                class="block text-[10px] uppercase tracking-wider text-text-muted"
                >Tiền cọc</span
              >
              <span class="text-xs font-bold text-primary">
                {{ formatCurrency(book.TIENCOC || book.DONGIA || 50000) }}
              </span>
            </div>

            <button
              type="button"
              @click="openRequestModal(book)"
              :disabled="book.SOQUYEN <= 0"
              class="px-3.5 py-1.5 rounded-btn text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              :class="
                book.SOQUYEN > 0
                  ? 'bg-primary hover:bg-primary-hover active:bg-primary-active text-btn-text'
                  : 'bg-bg-input text-text-muted cursor-not-allowed'
              "
            >
              <i class="fa-solid fa-hand-holding-hand"></i>
              <span>{{ book.SOQUYEN > 0 ? "Mượn sách" : "Hết sách" }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 2: PHIẾU MƯỢN CỦA TÔI -->
    <section v-else class="space-y-4">
      <!-- Bộ lọc trạng thái phiếu mượn của độc giả -->
      <div class="flex flex-wrap gap-2 border-b border-border-subtle pb-3">
        <button
          v-for="subTab in myLoanTabs"
          :key="subTab.value"
          type="button"
          @click="activeLoanSubTab = subTab.value"
          class="px-3 py-1.5 rounded-btn text-xs font-bold transition flex items-center gap-1.5"
          :class="
            activeLoanSubTab === subTab.value
              ? 'bg-primary text-btn-text shadow-sm'
              : 'bg-bg-input text-text-label hover:bg-border-base'
          "
        >
          <span>{{ subTab.label }}</span>
          <span
            class="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px]"
            :class="
              activeLoanSubTab === subTab.value
                ? 'bg-bg-card/30 text-btn-text'
                : 'bg-border-base text-text-label'
            "
          >
            {{ subTab.count }}
          </span>
        </button>
      </div>

      <div
        v-if="isLoansLoading"
        class="py-12 text-center text-text-muted text-xs"
      >
        <i class="fa-solid fa-spinner fa-spin text-lg mb-2 block"></i>
        Đang tải lịch sử mượn sách...
      </div>

      <div
        v-else-if="!filteredMyLoans.length"
        class="py-12 text-center text-text-muted bg-bg-card rounded-card border border-border-base text-xs"
      >
        Không có phiếu mượn nào trong mục này.
      </div>

      <!-- Bảng danh sách phiếu mượn -->
      <div
        v-else
        class="bg-bg-card rounded-card border border-border-base shadow-sm overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr
                class="uppercase font-sans tracking-wider border-b bg-bg-input/50 text-text-label"
              >
                <th class="py-3 px-3.5">Tên Sách</th>
                <th class="py-3 px-3.5">Ngày Mượn</th>
                <th class="py-3 px-3.5">Hạn Trả</th>
                <th class="py-3 px-3.5">Ngày Trả</th>
                <th class="py-3 px-3.5">Tiền Cọc</th>
                <th class="py-3 px-3.5">Tiền Phạt</th>
                <th class="py-3 px-3.5">Trạng Thái</th>
                <th class="py-3 px-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-base">
              <tr
                v-for="item in filteredMyLoans"
                :key="item._id"
                class="hover:bg-bg-page transition"
              >
                <!-- Sách -->
                <td class="py-3 px-3.5">
                  <span class="font-bold block text-text-main">{{
                    item.SACH_INFO?.TENSACH || item.MASACH
                  }}</span>
                  <span class="text-[11px] text-text-muted"
                    >Mã: {{ item.MASACH }}</span
                  >
                </td>

                <td class="py-3 px-3.5">{{ formatDate(item.NGAYMUON) }}</td>
                <td class="py-3 px-3.5">
                  <span :class="{ 'text-danger font-bold': isOverdue(item) }">
                    {{ formatDate(item.NGAYHENTRA) }}
                  </span>
                </td>
                <td class="py-3 px-3.5">
                  {{ item.NGAYTRA ? formatDate(item.NGAYTRA) : "Chưa trả" }}
                </td>
                <td class="py-3 px-3.5">{{ formatCurrency(item.TIENCOC) }}</td>

                <!-- Tiền phạt tổng cộng -->
                <td class="py-3 px-3.5">
                  <span v-if="item.TIENPHAT > 0" class="text-danger font-bold">
                    {{ formatCurrency(item.TIENPHAT) }}
                  </span>
                  <span v-else class="text-text-muted"> 0 đ </span>
                </td>

                <!-- Trạng thái -->
                <td class="py-3 px-3.5">
                  <span
                    class="px-2 py-0.5 rounded text-[11px] font-bold inline-block"
                    :class="getStatusClass(item)"
                  >
                    {{ item.TRANGTHAI }}
                  </span>
                </td>

                <!-- Độc giả có thể trả sách trực tiếp -->
                <td class="py-3 px-3.5 text-right whitespace-nowrap">
                  <button
                    v-if="
                      item.TRANGTHAI === 'Đang Mượn' ||
                      item.TRANGTHAI === 'Trễ Hạn'
                    "
                    type="button"
                    @click="openReturnModal(item)"
                    class="px-3 py-1.5 rounded-btn bg-primary hover:bg-primary-hover active:bg-primary-active text-btn-text text-xs font-bold shadow-sm transition inline-flex items-center gap-1.5"
                    title="Trả sách này"
                  >
                    <i class="fa-solid fa-arrow-rotate-left"></i>
                    <span>Trả sách</span>
                  </button>
                  <span v-else class="text-text-muted text-[11px]">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Modal Độc Giả Trả Sách -->
    <div
      v-if="returningItem"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      @click.self="returningItem = null"
    >
      <div
        class="w-full max-w-md rounded-card bg-bg-card p-6 shadow-2xl space-y-4"
      >
        <div
          class="flex items-center justify-between pb-3 border-b border-border-subtle"
        >
          <h3 class="font-bold text-base flex items-center gap-2">
            <i class="fa-solid fa-arrow-rotate-left text-primary"></i> Trả Sách
            Thư Viện
          </h3>
          <button
            @click="returningItem = null"
            class="text-text-muted hover:text-text-label"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div
          class="space-y-2 text-xs bg-bg-page p-3 rounded-xl border border-border-subtle"
        >
          <p>
            Tên sách:
            <strong>{{
              returningItem.SACH_INFO?.TENSACH || returningItem.MASACH
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
            <strong class="text-primary">{{
              formatCurrency(returningItem.TIENCOC)
            }}</strong>
          </p>
        </div>

        <!-- Cảnh báo nếu trễ hạn -->
        <div
          v-if="readerReturnLateDays > 30"
          class="p-3 rounded-xl bg-danger-bg border border-danger-border text-danger text-xs space-y-1"
        >
          <p class="font-bold flex items-center gap-1.5">
            <i class="fa-solid fa-triangle-exclamation"></i>
            Quá hạn {{ readerReturnLateDays }} ngày (> 30 ngày)
          </p>
          <p>
            Quy định: Tịch thu toàn bộ tiền cọc:
            <strong>{{ formatCurrency(returningItem.TIENCOC) }}</strong>
          </p>
        </div>

        <div
          v-else-if="readerReturnLateDays > 0"
          class="p-3 rounded-xl bg-warning-bg border border-warning-border text-warning text-xs space-y-1"
        >
          <p class="font-bold flex items-center gap-1.5">
            <i class="fa-solid fa-circle-exclamation"></i>
            Trễ hạn {{ readerReturnLateDays }} ngày
          </p>
          <p>
            Tiền phạt (5.000đ/ngày):
            <strong class="text-danger">{{
              formatCurrency(readerReturnLateFine)
            }}</strong>
          </p>
          <p>
            Tiền cọc hoàn trả dự kiến:
            <strong class="text-success">{{
              formatCurrency(
                Math.max(
                  0,
                  Number(returningItem.TIENCOC) - readerReturnLateFine,
                ),
              )
            }}</strong>
          </p>
        </div>

        <div
          v-else
          class="p-3 rounded-xl bg-success-bg border border-success-border text-success text-xs flex items-center gap-2"
        >
          <i class="fa-solid fa-circle-check"></i>
          <span
            >Bạn đang trả sách đúng hạn! Tiền cọc sẽ được hoàn trả đầy đủ.</span
          >
        </div>

        <div
          class="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle"
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
            @click="confirmReaderReturn"
            :disabled="isReturning"
            class="px-4 py-2 rounded-btn bg-primary hover:bg-primary-hover text-btn-text text-xs font-bold shadow transition flex items-center gap-1.5"
          >
            <i v-if="isReturning" class="fa-solid fa-spinner fa-spin"></i>
            <i v-else class="fa-solid fa-check"></i>
            Xác nhận trả sách
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Xác Nhận Gửi Yêu Cầu Mượn Sách -->
    <div
      v-if="requestingBook"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      @click.self="requestingBook = null"
    >
      <div
        class="w-full max-w-md rounded-card bg-bg-card p-6 shadow-2xl space-y-4"
      >
        <div
          class="flex items-center justify-between pb-3 border-b border-border-subtle"
        >
          <h3 class="font-bold text-base flex items-center gap-2">
            <i class="fa-solid fa-hand-holding-hand text-primary"></i> Đăng Ký
            Mượn Sách
          </h3>
          <button
            @click="requestingBook = null"
            class="text-text-muted hover:text-text-label"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div
          class="space-y-2 text-xs bg-bg-page p-3 rounded-xl border border-border-subtle"
        >
          <p>
            Tên sách: <strong>{{ requestingBook.TENSACH }}</strong>
          </p>
          <p>
            Mã sách:
            <span class="text-primary font-bold">{{
              requestingBook.MASACH
            }}</span>
          </p>
          <p>
            Tác giả:
            <strong>{{
              requestingBook["NGUONGOC/TACGIA"] || requestingBook.TACGIA || "-"
            }}</strong>
          </p>
          <p>
            Tiền cọc quy định:
            <strong class="text-primary">{{
              formatCurrency(
                requestingBook.TIENCOC || requestingBook.DONGIA || 50000,
              )
            }}</strong>
          </p>
          <p>
            Số quyển khả dụng:
            <span class="text-emerald-600 font-bold"
              >{{ requestingBook.SOQUYEN }} quyển</span
            >
          </p>
        </div>

        <div>
          <label class="block text-xs font-bold text-text-label mb-1.5">
            Thời hạn mượn:
          </label>
          <select
            v-model.number="borrowDuration"
            class="w-full p-2.5 rounded-input border border-border-input bg-bg-input text-xs outline-none focus:border-primary"
          >
            <option :value="7">7 ngày</option>
            <option :value="14">14 ngày (Mặc định)</option>
            <option :value="21">21 ngày</option>
            <option :value="30">30 ngày</option>
          </select>
          <p class="text-[11px] text-text-muted mt-1.5 italic">
            * Lưu ý: Khi gửi yêu cầu, số lượng sách sẽ được trừ trực tiếp và
            phiếu mượn ở trạng thái <strong>"Chờ duyệt"</strong>. Vui lòng đợi
            thủ thư phê duyệt để nhận sách.
          </p>
        </div>

        <div
          class="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle"
        >
          <button
            type="button"
            @click="requestingBook = null"
            class="px-4 py-2 rounded-btn border border-border-base text-xs font-semibold text-text-label hover:bg-bg-page"
          >
            Hủy
          </button>
          <button
            type="button"
            @click="confirmBorrowRequest"
            :disabled="isSubmittingRequest"
            class="px-4 py-2 rounded-btn bg-primary hover:bg-primary-hover text-btn-text text-xs font-bold shadow transition flex items-center gap-1.5"
          >
            <i
              v-if="isSubmittingRequest"
              class="fa-solid fa-spinner fa-spin"
            ></i>
            <i v-else class="fa-solid fa-paper-plane"></i>
            Xác nhận gửi yêu cầu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import sachService from "@/services/sachService";
import theloaiService from "@/services/theloaiService";
import theodoimuonsachService from "@/services/theodoimuonsachService";

const auth = useAuthStore();
const activeMainTab = ref("books"); // 'books' | 'loans'
const activeLoanSubTab = ref("ALL");

const books = ref([]);
const categories = ref([]);
const myLoans = ref([]);

const isBooksLoading = ref(false);
const isLoansLoading = ref(false);
const isSubmittingRequest = ref(false);
const isReturning = ref(false);

const bookSearch = ref("");
const selectedCategory = ref("");
const requestingBook = ref(null);
const returningItem = ref(null);
const borrowDuration = ref(14);
const alertMessage = ref({ type: "", text: "" });

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// --- Helpers ---
const formatCurrency = (val) =>
  val ? `${Number(val).toLocaleString("vi-VN")} đ` : "0 đ";

const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString("vi-VN") : "-";

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isOverdue = (item) =>
  !item.NGAYTRA &&
  item.TRANGTHAI !== "Chờ Duyệt" &&
  item.TRANGTHAI !== "Từ Chối" &&
  Boolean(item.NGAYHENTRA) &&
  startOfDay(item.NGAYHENTRA) < startOfDay(new Date());

const getStatusClass = (item) => {
  switch (item.TRANGTHAI) {
    case "Chờ Duyệt":
      return "bg-amber-500/15 text-amber-600 border border-amber-500/30";
    case "Đang Mượn":
      return isOverdue(item)
        ? "bg-red-500/15 text-red-600 border border-red-500/30"
        : "bg-blue-500/15 text-blue-600 border border-blue-500/30";
    case "Trễ Hạn":
      return "bg-red-500/15 text-red-600 border border-red-500/30";
    case "Đã Trả":
      return "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30";
    case "Từ Chối":
      return "bg-gray-500/15 text-gray-500 border border-gray-500/30";
    default:
      return "bg-bg-input text-text-label";
  }
};

// --- Computed: Map Thể loại ---
const categoryMap = computed(() => {
  const map = new Map();
  categories.value.forEach((c) => {
    const code = c.MATL || c.MATHELOAI;
    const name = c.TENTL || c.TENTHELOAI;
    if (code) map.set(code, name);
  });
  return map;
});

// --- Computed: Lọc sách kết hợp Thể loại (MATL) & Tìm kiếm từ khóa ---
const filteredBooks = computed(() => {
  const keyword = bookSearch.value.toLowerCase();
  const category = selectedCategory.value;

  return books.value.filter((b) => {
    const matchesCategory = !category || (b.MATL || b.MATHELOAI) === category;

    return (
      matchesCategory &&
      (!keyword ||
        [b.TENSACH, b.MASACH, b["NGUONGOC/TACGIA"], b.TACGIA].some((value) =>
          value?.toLowerCase().includes(keyword),
        ))
    );
  });
});

const pendingCount = computed(() => {
  return myLoans.value.filter((i) => i.TRANGTHAI === "Chờ Duyệt").length;
});

const LOAN_FILTERS = {
  ALL: () => true,
  ChoDuyet: (i) => i.TRANGTHAI === "Chờ Duyệt",
  DangMuon: (i) => i.TRANGTHAI === "Đang Mượn" && !isOverdue(i),
  TreHan: (i) =>
    (i.TRANGTHAI === "Trễ Hạn" || isOverdue(i)) && i.TRANGTHAI !== "Đã Trả",
  DaTra: (i) => i.TRANGTHAI === "Đã Trả",
  TuChoi: (i) => i.TRANGTHAI === "Từ Chối",
};

const myLoanTabs = computed(() => [
  { label: "Tất cả phiếu", value: "ALL", count: myLoans.value.length },
  {
    label: "Chờ duyệt",
    value: "ChoDuyet",
    count: myLoans.value.filter(LOAN_FILTERS.ChoDuyet).length,
  },
  {
    label: "Đang mượn",
    value: "DangMuon",
    count: myLoans.value.filter(LOAN_FILTERS.DangMuon).length,
  },
  {
    label: "Trễ hạn",
    value: "TreHan",
    count: myLoans.value.filter(LOAN_FILTERS.TreHan).length,
  },
  {
    label: "Đã trả",
    value: "DaTra",
    count: myLoans.value.filter(LOAN_FILTERS.DaTra).length,
  },
]);

const filteredMyLoans = computed(() => {
  const filterFn = LOAN_FILTERS[activeLoanSubTab.value] || LOAN_FILTERS.ALL;
  return myLoans.value.filter(filterFn);
});

// Tính số ngày trễ hạn và phạt trễ của độc giả khi trả sách
const readerReturnLateDays = computed(() => {
  if (!returningItem.value?.NGAYHENTRA) return 0;
  const diffMs =
    startOfDay(new Date()) -
    startOfDay(new Date(returningItem.value.NGAYHENTRA));
  return Math.max(0, Math.ceil(diffMs / MS_PER_DAY));
});

const readerReturnLateFine = computed(() => {
  if (readerReturnLateDays.value > 30) {
    return Number(returningItem.value?.TIENCOC) || 100000;
  }
  return readerReturnLateDays.value * 5000;
});

// --- Actions ---
const fetchBooks = async () => {
  try {
    isBooksLoading.value = true;
    books.value = (await sachService.getAllSach()) || [];
  } catch (err) {
    console.error("Lỗi tải sách:", err);
  } finally {
    isBooksLoading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    categories.value = (await theloaiService.getAllTheLoai()) || [];
  } catch (err) {
    console.error("Lỗi tải thể loại:", err);
  }
};

const fetchMyLoans = async () => {
  try {
    isLoansLoading.value = true;
    myLoans.value = (await theodoimuonsachService.getMyLoans()) || [];
  } catch (err) {
    console.error("Lỗi tải phiếu mượn cá nhân:", err);
  } finally {
    isLoansLoading.value = false;
  }
};

const openRequestModal = (book) => {
  requestingBook.value = book;
  borrowDuration.value = 14;
};

const openReturnModal = (item) => {
  returningItem.value = item;
};

// Độc giả gửi yêu cầu mượn
const confirmBorrowRequest = async () => {
  if (!requestingBook.value) return;
  try {
    isSubmittingRequest.value = true;
    alertMessage.value = { type: "", text: "" };

    const res = await theodoimuonsachService.yeuCauMuon({
      MASACH: requestingBook.value.MASACH,
      SONGAYMUON: borrowDuration.value,
    });

    alertMessage.value = {
      type: "success",
      text:
        res.message ||
        "Đã gửi yêu cầu mượn sách thành công! Đã trừ 1 quyển tồn kho.",
    };
    requestingBook.value = null;

    // Cập nhật lại số lượng sách và danh sách phiếu mượn
    await Promise.all([fetchBooks(), fetchMyLoans()]);
    // Chuyển sang tab phiếu mượn để bạn đọc theo dõi
    activeMainTab.value = "loans";
    activeLoanSubTab.value = "ChoDuyet";
  } catch (err) {
    alert(
      err.response?.data?.message ||
        err.message ||
        "Lỗi khi gửi yêu cầu mượn sách",
    );
  } finally {
    isSubmittingRequest.value = false;
  }
};

// Độc giả tự xác nhận trả sách
const confirmReaderReturn = async () => {
  if (!returningItem.value) return;
  try {
    isReturning.value = true;
    const res = await theodoimuonsachService.traSach(returningItem.value._id);
    alertMessage.value = {
      type: "success",
      text: res.message || "Trả sách thành công!",
    };
    returningItem.value = null;
    await Promise.all([fetchBooks(), fetchMyLoans()]);
  } catch (err) {
    alert(err.response?.data?.message || err.message || "Lỗi khi trả sách");
  } finally {
    isReturning.value = false;
  }
};

onMounted(async () => {
  await Promise.all([fetchBooks(), fetchCategories(), fetchMyLoans()]);
});
</script>
