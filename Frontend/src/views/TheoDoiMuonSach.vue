<template>
  <div class="space-y-6 font-sans text-text-main">
    <!-- Header -->
    <div
      class="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight">Theo Dõi Mượn Sách</h1>
        <p class="text-xs text-text-muted mt-0.5">
          Quản lý duyệt mượn trực tuyến, mượn tại quầy, trả sách và thu tiền phạt
        </p>
      </div>

      <button
        type="button"
        @click="openBorrowModal"
        class="px-3.5 py-2 rounded-btn bg-primary hover:bg-primary-hover active:bg-primary-active text-btn-text text-xs font-bold shadow-sm inline-flex items-center gap-1.5 transition"
      >
        <i class="fa-solid fa-plus"></i>
        <span>Lập phiếu mượn tại quầy</span>
      </button>
    </div>

    <!-- Alert Message -->
    <p
      v-if="borrowMessage.text && borrowMessage.type === 'success'"
      role="status"
      class="rounded-card border border-success-border bg-success-bg p-3 text-xs text-success flex items-center justify-between"
    >
      <span class="flex items-center gap-2">
        <i class="fa-solid fa-circle-check"></i>
        {{ borrowMessage.text }}
      </span>
      <button @click="borrowMessage.text = ''" class="text-success hover:opacity-75">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </p>

    <!-- Bộ lọc Tabs & Tìm kiếm -->
    <div class="space-y-3 pb-2">
      <div class="flex flex-wrap gap-2 border-b border-border-subtle pb-3">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          type="button"
          @click="activeTab = tab.value"
          class="px-3 py-1.5 rounded-btn text-xs font-bold transition flex items-center gap-1.5"
          :class="
            activeTab === tab.value
              ? 'bg-primary text-btn-text shadow-sm'
              : 'bg-bg-input text-text-label hover:bg-border-base'
          "
        >
          <span>{{ tab.label }}</span>
          <span
            class="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px]"
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
          type="button"
          @click="fetchData"
          class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-btn bg-bg-input hover:bg-border-base text-text-label text-xs font-bold transition"
        >
          <i class="fa-solid fa-rotate-right" :class="{ 'fa-spin': isLoading }"></i>
          <span>Làm mới</span>
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
            <tr class="uppercase font-sans tracking-wider border-b bg-bg-input/50 text-text-label">
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
                <i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải dữ liệu...
              </td>
            </tr>

            <tr v-else-if="!filteredList.length">
              <td
                :colspan="TABLE_HEADERS.length"
                class="py-8 text-center text-text-muted"
              >
                Không có phiếu mượn nào phù hợp với bộ lọc.
              </td>
            </tr>

            <tr
              v-else
              v-for="item in filteredList"
              :key="item._id"
              class="hover:bg-bg-page transition"
            >
              <!-- Sách -->
              <td class="py-3 px-3.5">
                <span class="font-bold block text-text-main">{{ item.SACH_INFO?.TENSACH || item.MASACH }}</span>
                <span class="text-[11px] text-text-muted">Mã: {{ item.MASACH }}</span>
              </td>

              <!-- Độc giả -->
              <td class="py-3 px-3.5">
                <span class="block font-bold text-text-main">{{
                  item.DOCGIA_INFO?.HOTEN || item.MADOCGIA
                }}</span>
                <span class="text-[11px] text-text-muted block">
                  Mã: {{ item.MADOCGIA }}
                  <template v-if="item.DOCGIA_INFO?.DIENTHOAI"> - {{ item.DOCGIA_INFO.DIENTHOAI }}</template>
                </span>
              </td>

              <!-- Ngày mượn & Hạn trả -->
              <td class="py-3 px-3.5">{{ formatDate(item.NGAYMUON) }}</td>
              <td class="py-3 px-3.5">
                <span :class="{ 'text-danger font-bold': isOverdue(item) }">
                  {{ formatDate(item.NGAYHENTRA) }}
                </span>
              </td>

              <!-- Ngày trả -->
              <td class="py-3 px-3.5">
                {{ item.NGAYTRA ? formatDate(item.NGAYTRA) : "Chưa trả" }}
              </td>

              <!-- Tiền cọc -->
              <td class="py-3 px-3.5">{{ formatCurrency(item.TIENCOC) }}</td>

              <!-- Tiền phạt -->
              <td class="py-3 px-3.5">
                <div v-if="item.TIENPHAT > 0" class="font-bold text-danger">
                  {{ formatCurrency(item.TIENPHAT) }}
                  <span v-if="getLateDays(item) > MAX_LATE_DAYS" class="block text-[10px] text-danger font-normal">
                    (Tịch thu cọc > 30 ngày)
                  </span>
                  <span v-else-if="getLateDays(item) > 0" class="block text-[10px] text-text-muted font-normal">
                    (Trễ {{ getLateDays(item) }} ngày + hư sách nếu có)
                  </span>
                  <span v-else class="block text-[10px] text-warning font-normal">
                    (Phạt hư sách)
                  </span>
                </div>
                <span v-else class="text-text-muted">-</span>
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

              <!-- Thao tác -->
              <td class="py-3 px-3.5 text-right space-x-1.5 whitespace-nowrap">
                <!-- Nút DUYỆT & TỪ CHỐI khi yêu cầu ở trạng thái Chờ Duyệt -->
                <template v-if="item.TRANGTHAI === 'Chờ Duyệt'">
                  <button
                    type="button"
                    @click="handleApprove(item)"
                    :disabled="isProcessingId === item._id"
                    class="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition inline-flex items-center gap-1 disabled:opacity-50"
                    title="Duyệt yêu cầu mượn sách này"
                  >
                    <i v-if="isProcessingId === item._id" class="fa-solid fa-spinner fa-spin"></i>
                    <i v-else class="fa-solid fa-check"></i>
                    Duyệt
                  </button>

                  <button
                    type="button"
                    @click="openRejectModal(item)"
                    :disabled="isProcessingId === item._id"
                    class="px-2.5 py-1.5 rounded-lg bg-danger-bg hover:bg-danger text-danger hover:text-white font-bold text-xs transition inline-flex items-center gap-1 disabled:opacity-50"
                    title="Từ chối yêu cầu"
                  >
                    <i class="fa-solid fa-ban"></i>
                    Từ chối
                  </button>
                </template>

                <!-- Nút TRẢ SÁCH cho phiếu Đang Mượn hoặc Trễ Hạn -->
                <button
                  v-else-if="item.TRANGTHAI === 'Đang Mượn' || item.TRANGTHAI === 'Trễ Hạn'"
                  type="button"
                  @click="openReturnModal(item)"
                  class="px-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover active:bg-primary-active text-btn-text font-bold text-xs shadow-sm transition inline-flex items-center gap-1"
                  title="Xác nhận trả sách & tính phạt"
                >
                  <i class="fa-solid fa-arrow-rotate-left"></i>
                  Trả sách
                </button>

                <!-- Nút Xóa (Chỉ Admin) -->
                <button
                  v-if="auth.isAdmin"
                  type="button"
                  @click="handleDelete(item._id)"
                  class="px-2 py-1.5 rounded-lg bg-bg-input hover:bg-danger-bg text-text-label hover:text-danger text-xs transition inline-flex items-center"
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

    <!-- Modal lập phiếu mượn tại quầy -->
    <div
      v-if="isBorrowModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      @click.self="closeBorrowModal"
    >
      <section
        class="w-full max-w-lg rounded-card bg-bg-card p-6 shadow-2xl"
        aria-labelledby="borrow-form-title"
      >
        <div
          class="mb-4 flex items-center justify-between border-b border-border-subtle pb-3"
        >
          <h2 id="borrow-form-title" class="font-bold text-base flex items-center gap-2">
            <i class="fa-solid fa-book-bookmark text-primary"></i>
            Lập phiếu mượn trực tiếp tại quầy
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
          class="mb-4 rounded-card border border-danger-border bg-danger-bg p-3 text-xs text-danger"
        >
          {{ borrowMessage.text }}
        </p>

        <form
          @submit.prevent="handleBorrowBook"
          class="space-y-3.5"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                for="borrow-reader-id"
                class="mb-1 block text-xs font-bold text-text-label"
              >
                MÃ ĐỘC GIẢ <span class="text-danger">*</span>
              </label>
              <input
                id="borrow-reader-id"
                v-model.trim="borrowForm.MADOCGIA"
                type="text"
                placeholder="VD: DG123456"
                required
                class="w-full p-2.5 rounded-input border border-border-input bg-bg-input text-xs uppercase outline-none focus:bg-bg-card focus:border-primary"
              />
            </div>

            <div>
              <label
                for="borrow-book-id"
                class="mb-1 block text-xs font-bold text-text-label"
              >
                MÃ SÁCH <span class="text-danger">*</span>
              </label>
              <input
                id="borrow-book-id"
                v-model.trim="borrowForm.MASACH"
                type="text"
                placeholder="VD: S001"
                required
                class="w-full p-2.5 rounded-input border border-border-input bg-bg-input text-xs uppercase outline-none focus:bg-bg-card focus:border-primary"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                for="borrow-duration"
                class="mb-1 block text-xs font-bold text-text-label"
              >
                THỜI HẠN
              </label>
              <select
                id="borrow-duration"
                v-model.number="borrowForm.SONGAYMUON"
                class="w-full p-2.5 rounded-input border border-border-input bg-bg-input text-xs outline-none focus:bg-bg-card focus:border-primary"
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
                class="mb-1 block text-xs font-bold text-text-label"
              >
                NGÀY MƯỢN
              </label>
              <input
                :value="todayDate"
                type="date"
                readonly
                class="w-full p-2.5 rounded-input border border-border-input bg-bg-input text-xs text-text-muted"
              />
            </div>

            <div>
              <label
                class="mb-1 block text-xs font-bold text-text-label"
              >
                HẠN TRẢ
              </label>
              <input
                :value="dueDate"
                type="date"
                readonly
                class="w-full p-2.5 rounded-input border border-border-input bg-bg-input text-xs text-text-muted"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
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

    <!-- Modal Từ chối yêu cầu mượn sách -->
    <div
      v-if="rejectingItem"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      @click.self="rejectingItem = null"
    >
      <div class="w-full max-w-md rounded-card bg-bg-card p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-border-subtle">
          <h3 class="font-bold text-base text-danger flex items-center gap-2">
            <i class="fa-solid fa-ban"></i> Từ Chối Yêu Cầu Mượn Sách
          </h3>
          <button @click="rejectingItem = null" class="text-text-muted hover:text-text-label">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="text-xs space-y-2 bg-bg-page p-3 rounded-lg border border-border-subtle">
          <p>Sách: <strong>{{ rejectingItem.SACH_INFO?.TENSACH || rejectingItem.MASACH }}</strong></p>
          <p>Độc giả: <strong>{{ rejectingItem.DOCGIA_INFO?.HOTEN || rejectingItem.MADOCGIA }}</strong></p>
        </div>

        <div>
          <label class="block text-xs font-bold text-text-label mb-1.5">
            Lý do từ chối:
          </label>
          <textarea
            v-model.trim="rejectReason"
            rows="3"
            placeholder="Nhập lý do (ví dụ: Sách tạm thời hư hao cần bảo quản, độc giả đang nợ tiền phạt...)"
            class="w-full p-2.5 rounded-input border border-border-input bg-bg-input text-xs outline-none focus:bg-bg-card focus:border-primary"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
          <button
            type="button"
            @click="rejectingItem = null"
            class="px-4 py-2 rounded-btn border border-border-base text-xs font-semibold text-text-label hover:bg-bg-page"
          >
            Hủy
          </button>
          <button
            type="button"
            @click="confirmReject"
            :disabled="isProcessingId === rejectingItem._id"
            class="px-4 py-2 rounded-btn bg-danger text-white text-xs font-bold hover:bg-danger/90 transition flex items-center gap-1.5"
          >
            <i v-if="isProcessingId === rejectingItem._id" class="fa-solid fa-spinner fa-spin"></i>
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Xác nhận trả sách & PHẠT HƯ HẠI SÁCH -->
    <div
      v-if="returningItem"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      @click.self="returningItem = null"
    >
      <div
        class="w-full max-w-lg rounded-card bg-bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div
          class="flex items-center justify-between pb-3 border-b border-border-subtle"
        >
          <h3 class="font-bold text-base flex items-center gap-2">
            <i class="fa-solid fa-receipt text-primary"></i> Xác Nhận Trả Sách & Tính Phạt
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
          <!-- Thông tin cơ bản -->
          <div
            class="p-3 rounded-xl bg-bg-page border border-border-subtle space-y-1"
          >
            <p>
              Sách:
              <strong>{{
                returningItem.SACH_INFO?.TENSACH || returningItem.MASACH
              }}</strong>
              <span class="text-text-muted ml-1">({{ returningItem.MASACH }})</span>
            </p>
            <p>
              Độc giả:
              <strong>{{
                returningItem.DOCGIA_INFO?.HOTEN || returningItem.MADOCGIA
              }}</strong>
              <span class="text-text-muted ml-1">({{ returningItem.MADOCGIA }})</span>
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

          <!-- Tình trạng trễ hạn -->
          <div
            v-if="returnSummary.isConfiscated"
            class="p-3.5 rounded-xl bg-danger-bg border border-danger-border text-danger space-y-1"
          >
            <div class="flex items-center gap-2 font-bold text-xs">
              <i class="fa-solid fa-triangle-exclamation"></i>
              QUÁ HẠN {{ returnSummary.lateDays }} NGÀY (> {{ MAX_LATE_DAYS }} ngày)
            </div>
            <p>
              QUY ĐỊNH: Tịch thu toàn bộ tiền cọc mượn sách:
              <strong class="font-bold ml-1">{{ formatCurrency(returnSummary.forfeitedDeposit) }}</strong>
            </p>
          </div>

          <div
            v-else-if="returnSummary.lateDays > 0"
            class="p-3.5 rounded-xl bg-warning-bg border border-warning-border text-warning space-y-1"
          >
            <p class="font-bold flex items-center gap-1.5">
              <i class="fa-solid fa-circle-exclamation"></i>
              Trễ hạn {{ returnSummary.lateDays }} ngày
            </p>
            <p>
              Tiền phạt trễ ({{ FINE_PER_DAY.toLocaleString("vi-VN") }}đ/ngày):
              <strong class="text-danger ml-1">{{ formatCurrency(returnSummary.lateFine) }}</strong>
            </p>
          </div>

          <div
            v-else
            class="p-3 rounded-xl bg-success-bg border border-success-border text-success flex items-center gap-2"
          >
            <i class="fa-solid fa-circle-check"></i>
            <span>Trả sách đúng hạn. Không phát sinh phạt trễ hạn.</span>
          </div>

          <!-- MỤC KIỂM TRA HƯ HẠI SÁCH -->
          <div class="p-3.5 rounded-xl border border-border-base bg-bg-card space-y-3">
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 font-bold cursor-pointer text-xs">
                <input
                  type="checkbox"
                  v-model="hasBookDamage"
                  class="rounded border-border-input text-warning focus:ring-0 h-4 w-4"
                />
                <span :class="hasBookDamage ? 'text-warning' : 'text-text-main'">
                  Sách bị hư hại / rách bìa / mất trang / hỏng sách
                </span>
              </label>
              <span v-if="hasBookDamage" class="text-[10px] px-2 py-0.5 rounded bg-warning-bg text-warning font-bold">
                Có phạt hư hại
              </span>
            </div>

            <!-- Form nhập phạt hư hại -->
            <div v-if="hasBookDamage" class="space-y-3 pt-2 border-t border-border-subtle">
              <div>
                <label class="block text-[11px] font-bold text-text-label mb-1">
                  Số tiền phạt hư hại (VNĐ) <span class="text-danger">*</span>
                </label>
                <div class="relative">
                  <input
                    type="number"
                    v-model.number="damageFineInput"
                    min="0"
                    step="5000"
                    placeholder="VD: 30000"
                    class="w-full p-2 pl-3 pr-10 rounded-input border border-border-input bg-bg-input text-xs font-bold text-text-main outline-none focus:border-warning"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">
                    đ
                  </span>
                </div>
                <!-- Quick presets -->
                <div class="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    @click="damageFineInput = 20000; damageNoteInput = 'Rách bìa hoặc vẽ bẩn nhẹ'"
                    class="px-2 py-0.5 rounded text-[10px] bg-bg-input hover:bg-border-base text-text-muted transition"
                  >
                    Rách nhẹ (20.000đ)
                  </button>
                  <button
                    type="button"
                    @click="damageFineInput = 50000"
                    class="px-2 py-0.5 rounded text-[10px] bg-bg-input hover:bg-border-base text-text-muted transition"
                  >
                    Rách nặng/mất trang (50.000đ)
                  </button>
                  <button
                    type="button"
                    @click="damageFineInput = Number(returningItem.TIENCOC) || 100000"
                    class="px-2 py-0.5 rounded text-[10px] bg-bg-input hover:bg-border-base text-text-muted transition"
                  >
                    Mất sách (Bằng tiền cọc)
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- BẢNG TỔNG KẾT TÀI CHÍNH -->
          <div class="p-3.5 rounded-xl bg-bg-page border border-border-subtle space-y-2">
            <p class="font-bold text-xs uppercase tracking-wider text-text-label border-b border-border-subtle pb-1">
              Tổng kết thu - chi quyết toán:
            </p>
            <div class="flex justify-between items-center text-xs">
              <span class="text-text-muted">Tiền cọc ban đầu:</span>
              <span class="font-semibold">{{ formatCurrency(returningItem.TIENCOC) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-text-muted">Phạt trễ hạn:</span>
              <span class="font-semibold text-danger">{{ formatCurrency(returnSummary.lateFine) }}</span>
            </div>
            <div v-if="hasBookDamage" class="flex justify-between items-center text-xs">
              <span class="text-text-muted">Phạt làm hư hại sách:</span>
              <span class="font-semibold text-warning">{{ formatCurrency(damageFineInput) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs font-bold border-t border-border-subtle pt-1.5">
              <span>Tổng tiền phạt:</span>
              <span class="text-danger text-sm">{{ formatCurrency(finalTotalFine) }}</span>
            </div>

            <!-- Kết luận hoàn cọc / thu thêm -->
            <div class="mt-2 pt-2 border-t border-dashed border-border-base">
              <div v-if="returnSummary.isConfiscated" class="text-danger font-bold text-xs">
                Tịch thu 100% tiền cọc
                <template v-if="damageFineInput > 0">
                  + Độc giả nộp thêm tiền hư hại: {{ formatCurrency(damageFineInput) }}
                </template>
              </div>
              <div v-else-if="finalRefund > 0" class="text-emerald-600 font-bold text-xs flex justify-between items-center">
                <span>Số tiền hoàn trả lại cho bạn đọc:</span>
                <span class="text-sm">{{ formatCurrency(finalRefund) }}</span>
              </div>
              <div v-else-if="finalExtraFee > 0" class="text-danger font-bold text-xs flex justify-between items-center">
                <span>Bạn đọc cần đóng thêm:</span>
                <span class="text-sm">{{ formatCurrency(finalExtraFee) }}</span>
              </div>
              <div v-else class="text-text-muted font-bold text-xs">
                Đã bù trừ đủ tiền cọc. Không hoàn và không thu thêm.
              </div>
            </div>
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
            <i v-else class="fa-solid fa-check"></i>
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
  "Thao Tác",
];

const auth = useAuthStore();
const isLoading = ref(false);
const isSubmittingBorrow = ref(false);
const isReturning = ref(false);
const isProcessingId = ref(null);

const fullList = ref([]);
const searchKeyword = ref("");
const activeTab = ref("ALL");
const isBorrowModalOpen = ref(false);

const borrowMessage = ref({ type: "", text: "" });
const borrowForm = ref({ MADOCGIA: "", MASACH: "", SONGAYMUON: 14 });

// Trả sách & Phạt hư hại
const returningItem = ref(null);
const hasBookDamage = ref(false);
const damageFineInput = ref(0);
const damageNoteInput = ref("");

// Từ chối yêu cầu
const rejectingItem = ref(null);
const rejectReason = ref("");

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
  item.TRANGTHAI !== "Chờ Duyệt" &&
  item.TRANGTHAI !== "Từ Chối" &&
  Boolean(item.NGAYHENTRA) &&
  startOfDay(item.NGAYHENTRA) < startOfDay(new Date());

const getLateDays = (item) => {
  if (!item?.NGAYHENTRA) return 0;
  if (item.TRANGTHAI === "Chờ Duyệt" || item.TRANGTHAI === "Từ Chối") return 0;
  const endDate = item.NGAYTRA ? new Date(item.NGAYTRA) : new Date();
  const diffMs = startOfDay(endDate) - startOfDay(item.NGAYHENTRA);
  return Math.max(0, Math.ceil(diffMs / MS_PER_DAY));
};

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

// --- Computed ---
const todayDate = toDateInput(new Date());

const dueDate = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() + Number(borrowForm.value.SONGAYMUON));
  return toDateInput(date);
});

const TAB_FILTERS = {
  ALL: () => true,
  ChoDuyet: (i) => i.TRANGTHAI === "Chờ Duyệt",
  DangMuon: (i) => i.TRANGTHAI === "Đang Mượn" && !isOverdue(i),
  TreHan: (i) => (i.TRANGTHAI === "Trễ Hạn" || isOverdue(i)) && i.TRANGTHAI !== "Đã Trả",
  DaTra: (i) => i.TRANGTHAI === "Đã Trả",
  TuChoi: (i) => i.TRANGTHAI === "Từ Chối",
};

const statusTabs = computed(() => [
  { label: "Tất cả phiếu", value: "ALL", count: fullList.value.length },
  {
    label: "Chờ duyệt",
    value: "ChoDuyet",
    count: fullList.value.filter(TAB_FILTERS.ChoDuyet).length,
  },
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
  {
    label: "Từ chối",
    value: "TuChoi",
    count: fullList.value.filter(TAB_FILTERS.TuChoi).length,
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
      lateFine: 0,
      forfeitedDeposit: 0,
    };

  const lateDays = getLateDays({ ...item, NGAYTRA: null });
  const deposit = Number(item.TIENCOC) || 0;
  const isConfiscated = lateDays > MAX_LATE_DAYS;
  const lateFine = isConfiscated
    ? (deposit > 0 ? deposit : 100000)
    : lateDays * FINE_PER_DAY;

  return {
    lateDays,
    isConfiscated,
    lateFine,
    forfeitedDeposit: deposit || 50000,
  };
});

const finalTotalFine = computed(() => {
  const lateFine = returnSummary.value.lateFine;
  const damageFine = hasBookDamage.value ? Number(damageFineInput.value) || 0 : 0;
  return lateFine + damageFine;
});

const finalRefund = computed(() => {
  const item = returningItem.value;
  if (!item || returnSummary.value.isConfiscated) return 0;
  const deposit = Number(item.TIENCOC) || 0;
  return Math.max(0, deposit - finalTotalFine.value);
});

const finalExtraFee = computed(() => {
  const item = returningItem.value;
  if (!item) return 0;
  const deposit = Number(item.TIENCOC) || 0;
  if (returnSummary.value.isConfiscated) {
    return hasBookDamage.value ? Number(damageFineInput.value) || 0 : 0;
  }
  return Math.max(0, finalTotalFine.value - deposit);
});

// --- Actions ---
const openBorrowModal = () => {
  borrowMessage.value = { type: "", text: "" };
  isBorrowModalOpen.value = true;
};

const closeBorrowModal = () => {
  if (!isSubmittingBorrow.value) isBorrowModalOpen.value = false;
};

const openReturnModal = (item) => {
  returningItem.value = item;
  hasBookDamage.value = false;
  damageFineInput.value = 0;
};

const openRejectModal = (item) => {
  rejectingItem.value = item;
  rejectReason.value = "";
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

// Duyệt yêu cầu mượn
const handleApprove = async (item) => {
  if (!confirm(`Xác nhận duyệt yêu cầu mượn sách "${item.SACH_INFO?.TENSACH || item.MASACH}" cho bạn đọc ${item.DOCGIA_INFO?.HOTEN || item.MADOCGIA}?`)) {
    return;
  }
  try {
    isProcessingId.value = item._id;
    const res = await theodoimuonsachService.duyetMuon(item._id);
    borrowMessage.value = {
      type: "success",
      text: res.message || "Duyệt yêu cầu mượn thành công!",
    };
    await fetchData();
  } catch (err) {
    alert(getErrorMessage(err, "Không thể duyệt yêu cầu mượn sách"));
  } finally {
    isProcessingId.value = null;
  }
};

// Từ chối yêu cầu mượn
const confirmReject = async () => {
  if (!rejectingItem.value) return;
  try {
    isProcessingId.value = rejectingItem.value._id;
    const res = await theodoimuonsachService.tuChoiMuon(rejectingItem.value._id, {
      LYDOTUCHOI: rejectReason.value,
    });
    alert(res.message || "Đã từ chối yêu cầu mượn sách.");
    rejectingItem.value = null;
    await fetchData();
  } catch (err) {
    alert(getErrorMessage(err, "Không thể từ chối yêu cầu"));
  } finally {
    isProcessingId.value = null;
  }
};

// Lập phiếu mượn tại quầy
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

// Xác nhận trả sách
const confirmReturn = async () => {
  if (!returningItem.value) return;
  try {
    isReturning.value = true;
    const res = await theodoimuonsachService.traSach(returningItem.value._id, {
      TIENPHATHUHAI: hasBookDamage.value ? Number(damageFineInput.value) || 0 : 0,
    });
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
