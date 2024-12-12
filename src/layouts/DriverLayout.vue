<!-- layouts/DriverLayout.vue -->
<template>
  <div class="min-h-screen bg-gray-100 relative">
    <DriverSidebar 
      :isOpen="sidebarState.isOpen" 
      @update:isOpen="toggleSidebar"
      :class="[
        'transition-all duration-300 ease-in-out fixed inset-y-0 left-0',
        { 'z-[80]': sidebarState.isActive, 'z-[60]': !sidebarState.isActive }
      ]"
    />
  
    <div class="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
      <DriverHeader 
        :isSidebarOpen="sidebarState.isOpen"
        @toggle-sidebar="toggleSidebar"
        :class="[
          'sticky top-0 transition-all duration-300 ease-in-out',
          { 'z-[60]': sidebarState.isActive, 'z-[70]': !sidebarState.isActive }
        ]"
      />
      
      <PageHeader :key="$route.path" :title="currentPageTitle" />
      
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
  
    <div 
      v-if="sidebarState.isOpen" 
      class="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity md:hidden z-50"
      @click="closeSidebarOnMobile"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import DriverHeader from '@/components/driver/Header.vue'
import DriverSidebar from '@/components/driver/Sidebar.vue'
import PageHeader from '@/components/common/PageHeader.vue'

const route = useRoute()

const sidebarState = reactive({
  isOpen: false,
  isActive: false
})

const isDriverDropdownOpen = ref(false)

const handleClickOutside = (event) => {
  if (window.innerWidth < 768 && sidebarState.isOpen) {
    const sidebar = document.querySelector('[data-sidebar]')
    const header = document.querySelector('[data-header]')
    if (sidebar && !sidebar.contains(event.target) && 
        header && !header.contains(event.target)) {
      sidebarState.isOpen = false
      sidebarState.isActive = false
    }
  }
}

const handleSidebarInteraction = (event) => {
  const sidebar = document.querySelector('[data-sidebar]')
  sidebarState.isActive = sidebar && sidebar.contains(event.target)
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
  sidebarState.isOpen = !sidebarState.isOpen
  sidebarState.isActive = sidebarState.isOpen
}

const closeSidebarOnMobile = () => {
  if (window.innerWidth < 768) {
    sidebarState.isOpen = false
    sidebarState.isActive = false
  }
}

const openDriverDropdown = () => {
  isDriverDropdownOpen.value = true
  sidebarState.isOpen = true
}

provide('sidebarState', sidebarState)
provide('toggleSidebar', toggleSidebar)
provide('isDriverDropdownOpen', isDriverDropdownOpen)
provide('openDriverDropdown', openDriverDropdown)
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

