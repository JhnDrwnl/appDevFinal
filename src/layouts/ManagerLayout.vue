<!-- layouts/ManagerLayout.vue -->
<template>
    <div class="min-h-screen bg-gray-100 relative">
      <!-- Sidebar with dynamic z-index -->
      <ManagerSidebar 
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
        <ManagerHeader 
          @toggle-sidebar="toggleSidebar" 
          :isSidebarOpen="isSidebarOpen"
          :class="[
            'sticky top-0 transition-all duration-300 ease-in-out',
            isSidebarActive ? 'z-[60]' : 'z-[70]'
          ]"
        />
        
        <PageHeader :key="$route.path" :title="currentPageTitle" />
        
        <main class="flex-1 px-6 py-4 lg:px-8 overflow-x-hidden">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
      </div>
    
      <!-- Overlay for mobile -->
      <div 
        v-if="isSidebarOpen" 
        class="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity md:hidden z-50"
        @click="closeSidebarOnMobile"
      ></div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted, provide } from 'vue'
  import { useRoute } from 'vue-router'
  import ManagerHeader from '@/components/manager/Header.vue'
  import ManagerSidebar from '@/components/manager/Sidebar.vue'
  import PageHeader from '@/components/common/PageHeader.vue'
  
  const route = useRoute()
  const isSidebarOpen = ref(false)
  const isSidebarActive = ref(false)
  const isManagerDropdownOpen = ref(false)
  
  // Handle click outside for mobile
  const handleClickOutside = (event) => {
    if (window.innerWidth < 768 && isSidebarOpen.value) {
      // Check if click is outside sidebar
      const sidebar = document.querySelector('[data-sidebar]')
      const header = document.querySelector('[data-header]')
      if (sidebar && !sidebar.contains(event.target) && 
          header && !header.contains(event.target)) {
        isSidebarOpen.value = false
        isSidebarActive.value = false
      }
    }
  }
  
  // Handle sidebar interaction
  const handleSidebarInteraction = (event) => {
    const sidebar = document.querySelector('[data-sidebar]')
    if (sidebar && sidebar.contains(event.target)) {
      isSidebarActive.value = true
    } else {
      isSidebarActive.value = false
    }
  }
  
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('mousedown', handleSidebarInteraction)
  })
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('mousedown', handleSidebarInteraction)
  })
  
  const currentPageTitle = computed(() => {
    const path = route.path.split('/').filter(Boolean)
    const lastSegment = path[path.length - 1]
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ')
  })
  
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
    // When toggling via button, make sidebar active
    isSidebarActive.value = isSidebarOpen.value
  }
  
  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      isSidebarOpen.value = false
      isSidebarActive.value = false
    }
  }
  
  const openManagerDropdown = () => {
    isManagerDropdownOpen.value = true
    isSidebarOpen.value = true // Ensure sidebar is open
  }
  
  provide('openManagerDropdown', openManagerDropdown)
  provide('isManagerDropdownOpen', isManagerDropdownOpen)
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