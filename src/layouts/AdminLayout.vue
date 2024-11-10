<template>
    <div class="flex flex-col min-h-screen bg-gray-100">
      <Header @toggle-sidebar="toggleSidebar" />
      <div class="flex flex-1 overflow-hidden">
        <AdminSidebar :is-open="sidebarOpen" />
        <main class="flex-1 overflow-x-hidden overflow-y-auto">
          <div class="container mx-auto px-4 py-8">
            <router-view></router-view>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import Header from '@/components/admin/Header.vue'
  import Footer from '@/components/admin/Footer.vue'
  import AdminSidebar from '@/components/admin/Sidebar.vue'
  
  const sidebarOpen = ref(true)
  
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }
  </script>
  
  <style scoped>
  @media (max-width: 768px) {
    .flex-1 {
      flex-direction: column;
    }
  }
  </style>