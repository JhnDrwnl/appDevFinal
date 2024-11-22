<template>
    <aside 
      ref="sidebarRef"
      data-sidebar
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      class="fixed inset-y-4 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 ease-in-out overflow-hidden"
      :class="[
        isOpenState ? 'w-64' : 'w-16',
        isMobile ? 'left-4' : 'left-4 md:translate-x-0',
        { '-translate-x-full': !isOpenState && isMobile }
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo section -->
        <div class="flex items-center h-16 px-4">
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 rounded-lg bg-[#0095FF] flex items-center justify-center">
                <span class="text-white text-lg font-bold">D</span>
              </div>
            </div>
            <h1 v-if="isOpenState" class="text-lg font-semibold text-gray-900">Driver Panel</h1>
          </div>
        </div>
  
        <!-- Navigation -->
        <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-colors"
            :class="[
              isActive(item.path)
                ? 'bg-[#EBF5FF] text-[#0095FF]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5 mr-3" aria-hidden="true" />
            <span v-if="isOpenState">{{ item.name }}</span>
          </router-link>
        </nav>
      </div>
    </aside>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { 
    HomeIcon, 
    TruckIcon, 
    MapIcon,
    ClipboardDocumentListIcon,
    UserIcon
  } from '@heroicons/vue/24/outline'
  
  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: true
    }
  })
  
  const emit = defineEmits(['update:isOpen'])
  
  const route = useRoute()
  const isHovered = ref(false)
  const isMobile = ref(false)
  const sidebarRef = ref(null)
  
  const isOpenState = computed(() => props.isOpen || (!isMobile.value && isHovered.value))
  
  const menuItems = [
    { name: 'Dashboard', path: '/driver/dashboard', icon: HomeIcon },
    { name: 'Active Deliveries', path: '/driver/active-deliveries', icon: TruckIcon },
    { name: 'Route Map', path: '/driver/route-map', icon: MapIcon },
    { name: 'Delivery History', path: '/driver/delivery-history', icon: ClipboardDocumentListIcon },
    { name: 'Profile', path: '/driver/profile', icon: UserIcon },
  ]
  
  const isActive = (path) => {
    return route.path.startsWith(path)
  }
  
  const handleMouseEnter = () => {
    isHovered.value = true
  }
  
  const handleMouseLeave = () => {
    isHovered.value = false
  }
  
  const updateIsMobile = () => {
    isMobile.value = window.innerWidth < 768
    if (!isMobile.value) emit('update:isOpen', true)
  }
  
  onMounted(() => {
    updateIsMobile()
    window.addEventListener('resize', updateIsMobile)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateIsMobile)
  })
  </script>