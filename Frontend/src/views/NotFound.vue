<template>
  <div class="min-h-screen bg-bg-page flex items-center justify-center p-6 text-center select-none font-sans">
    <div class="max-w-md space-y-4 rounded-card border border-border-base bg-bg-card p-8 shadow-card">
      <div class="text-7xl font-black text-primary tracking-wider">404</div>
      <h1 class="text-2xl font-bold text-text-main">Không Tìm Thấy Trang</h1>
      <p class="text-sm text-text-muted">
        Đường dẫn bạn yêu cầu không tồn tại hoặc bạn không có quyền truy cập vào trang này.
      </p>
      <div class="pt-4">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-btn bg-primary hover:bg-primary-hover active:bg-primary-active text-btn-text font-bold text-xs shadow-sm transition"
        >
          <i class="fa-solid fa-house"></i>
          Quay Về Trang Chủ
        </RouterLink>
      </div>
    </div>
  </div>
</template>
