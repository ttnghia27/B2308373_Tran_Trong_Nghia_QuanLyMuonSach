<template>
  <div
    class="min-h-screen bg-bg-page flex flex-col items-center justify-center p-6 text-center space-y-3"
  >
    <h1 class="text-7xl font-black text-primary">404</h1>
    <p class="text-xl font-bold text-text-main">Không Tìm Thấy Trang</p>
    <p class="text-sm text-text-muted pb-1">
      Đường dẫn không tồn tại hoặc bạn không có quyền truy cập.
    </p>
    <RouterLink
      to="/"
      class="px-5 py-2.5 rounded-btn bg-primary hover:bg-primary-hover text-white text-sm font-bold"
    >
      Quay Về Trang Chủ
    </RouterLink>
  </div>
</template>
