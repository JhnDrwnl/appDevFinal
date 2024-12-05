<!-- layouts/UserLayout.vue -->
<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- Header -->
    <Header />



    <!-- Main Content -->
    <main class="flex-grow py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" class="h-full" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Footer -->
    <Footer />

    <!-- Bottom Bar -->
    <BottomBar />
  </div>
</template>

<script setup>
import Header from '@/components/common/Header.vue'
import Footer from '@/components/landing/Footer.vue'
import BottomBar from '@/components/common/BottomBar.vue'
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.router-view-container) {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>

