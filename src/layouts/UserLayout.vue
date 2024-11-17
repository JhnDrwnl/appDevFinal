<template>
  <div class="min-h-screen bg-gray-100 relative">
    <!-- Sidebar with dynamic z-index -->
    <AdminSidebar 
      :isOpen="isSidebarOpen" 
      @update:isOpen="toggleSidebar"
      :class="[
        'transition-all duration-300 ease-in-out fixed inset-y-0 left-0',
        isSidebarActive ? 'z-[80]' : 'z-[60]'
      ]"
    />
  
    <!-- Main Content -->
    <div 
      class="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out"
    >
      <!-- Header with dynamic z-index -->
      <Header/>
      
      <main class="flex-1 px-6 py-4 lg:px-8 overflow-x-hidden">
        <div class="max-w-7xl mx-auto w-full">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </div>
      </main>
    </div>

    <Footer/>
  </div>
  </template>
  
  <script setup>
  import { ref} from 'vue'
  import { useRoute } from 'vue-router'
  import Header from '@/components/common/Header.vue'
  import Footer from '@/components/landing/Header.vue'

  
  const route = useRoute()
  const isSidebarOpen = ref(false)
  const isSidebarActive = ref(false)
  
  </script>
  
  <style>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  
  .fade-enter-active,
  .fade-leave-to {
    opacity: 0;
  }
  </style>