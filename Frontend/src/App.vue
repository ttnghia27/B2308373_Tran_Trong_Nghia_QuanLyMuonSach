<template>
  <div v-if="isAuthPage" class="min-h-screen bg-slate-100">
    <RouterView />
  </div>

  <div v-else class="flex h-screen bg-slate-100 overflow-hidden font-sans">
    <!-- Sidebar trái -->
    <AdminSidebar />

    <!-- Khu vực nội dung chính -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top header bar -->
      <Header />

      <!-- View chính cuộn độc lập -->
      <main class="flex-1 overflow-y-auto p-6 bg-slate-50">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import AdminSidebar from "@/components/AdminSidebar.vue";
import Header from "@/components/Header.vue";

const route = useRoute();

const isAuthPage = computed(() => {
  return (
    route.name === "Login" ||
    route.name === "Register" ||
    route.name === "NotFound"
  );
});
</script>
