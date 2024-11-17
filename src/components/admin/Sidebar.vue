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
              <span class="text-white text-lg font-bold">S</span>
            </div>
          </div>
          <h1 v-if="isOpenState" class="text-lg font-semibold text-gray-900">Spike Admin</h1>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <router-link
          v-for="item in regularMenuItems"
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

        <!-- Administration dropdown -->
        <div class="relative">
          <button
            @click="toggleAdminMenu"
            class="w-full flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-colors"
            :class="[
              isAdminMenuOpen || isActive('/admin/administration')
                ? 'bg-[#EBF5FF] text-[#0095FF]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            ]"
          >
            <Cog6ToothIcon class="w-5 h-5 mr-3" aria-hidden="true" />
            <span v-if="isOpenState">Administration</span>
            <ChevronDownIcon 
              v-if="isOpenState"
              class="w-5 h-5 ml-auto transition-transform duration-200"
              :class="{ 'transform rotate-180': isAdminMenuOpen }"
            />
          </button>
          <div
            v-if="isOpenState && isAdminMenuOpen"
            class="mt-1 space-y-1 px-2"
          >
            <router-link
              v-for="subItem in adminSubItems"
              :key="subItem.path"
              :to="subItem.path"
              class="flex items-center pl-9 pr-2 py-2 text-sm font-medium rounded-xl transition-colors"
              :class="[
                isActive(subItem.path)
                  ? 'bg-[#EBF5FF] text-[#0095FF]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              ]"
            >
              <component :is="subItem.icon" class="w-5 h-5 mr-3" aria-hidden="true" />
              {{ subItem.name }}
            </router-link>
          </div>
        </div>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { 
  HomeIcon, 
  UsersIcon, 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  Cog6ToothIcon,
  ChevronDownIcon,
  UserGroupIcon,
  IdentificationIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:isOpen'])

const route = useRoute()
const isAdminMenuOpen = ref(false)
const isHovered = ref(false)
const isMobile = ref(false)
const sidebarRef = ref(null)
const clickOutsideCount = ref(0)
const lastClickTime = ref(0)

const isOpenState = computed(() => props.isOpen || (!isMobile.value && isHovered.value))

const regularMenuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon },
  { name: 'Users', path: '/admin/users', icon: UsersIcon },
  { name: 'Products', path: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCartIcon },
]

const adminSubItems = [
  { name: 'Employees', path: '/admin/administration/employees', icon: UserGroupIcon },
  { name: 'Profiles', path: '/admin/administration/profiles', icon: IdentificationIcon },
  { name: 'Permissions', path: '/admin/administration/permissions', icon: ShieldCheckIcon },
]

const isActive = (path) => {
  return route.path.startsWith(path)
}

const toggleAdminMenu = () => {
  isAdminMenuOpen.value = !isAdminMenuOpen.value
}

const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
  if (!props.isOpen) {
    isAdminMenuOpen.value = false
  }
}

const updateIsMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    emit('update:isOpen', true)
  }
}

const handleClickOutside = (event) => {
  if (!isMobile.value) return; // Only apply click-outside behavior on mobile

  if (isOpenState.value && !event.target.closest('[data-sidebar]') && !event.target.closest('[data-header]')) {
    const currentTime = new Date().getTime()
    if (currentTime - lastClickTime.value <= 300) {
      // Double click (two clicks within 300ms)
      clickOutsideCount.value = 0
      emit('update:isOpen', false)
    } else {
      // Single click
      clickOutsideCount.value += 1
      if (clickOutsideCount.value >= 2) {
        clickOutsideCount.value = 0
        emit('update:isOpen', false)
      }
    }
    lastClickTime.value = currentTime
  } else {
    // Reset the counter if clicked inside the sidebar or header
    clickOutsideCount.value = 0
  }
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>