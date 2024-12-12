<!-- components/admin/Sidebar.vue -->
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
            <img src="@/assets/image/SALogo.png" alt="Supreme Agri-vet Logo" class="w-8 h-8" />
          </div>
          <h1 v-if="isOpenState" class="text-lg font-semibold text-gray-900">Supreme Agri-vet</h1>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <router-link
          v-for="item in regularMenuItems"
          :key="item.path"
          :to="item.path"
          @click="closeAllDropdowns"
          class="flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-colors"
          :class="[
            isActive(item.path)
              ? 'bg-[#FFF0E0] text-[#FF9934]'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" aria-hidden="true" />
          <span v-if="isOpenState">{{ item.name }}</span>
        </router-link>

        <!-- Dropdown menus -->
        <div v-for="menu in dropdownMenus" :key="menu.name" class="relative">
          <button
            @click="toggleMenu(menu)"
            class="w-full flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <component :is="menu.icon" class="w-5 h-5 mr-3" aria-hidden="true" />
            <span v-if="isOpenState">{{ menu.name }}</span>
            <ChevronDownIcon 
              v-if="isOpenState"
              class="w-5 h-5 ml-auto transition-transform duration-200"
              :class="{ 'transform rotate-180': menu.isOpen }"
            />
          </button>
          <div
            v-if="isOpenState && menu.isOpen"
            class="mt-1 space-y-1 px-2"
          >
            <router-link
              v-for="subItem in menu.subItems"
              :key="subItem.path"
              :to="subItem.path"
              class="flex items-center pl-9 pr-2 py-2 text-sm font-medium rounded-xl transition-colors"
              :class="[
                isActive(subItem.path)
                  ? 'bg-[#FFF0E0] text-[#FF9934]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              ]"
            >
              <component :is="subItem.icon" class="w-5 h-5 mr-3" aria-hidden="true" />
              {{ subItem.name }}
            </router-link>
          </div>
        </div>

        <!-- Profile link (last and always visible) -->
        <router-link
          :to="{ name: 'StockManagerProfile' }"
          class="flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-colors"
          :class="[
            isActive('/stock-manager/profile')
              ? 'bg-[#FFF0E0] text-[#FF9934]'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          ]"
        >
          <IdentificationIcon class="w-5 h-5 mr-3" aria-hidden="true" />
          <span v-if="isOpenState">Profile</span>
        </router-link>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  HomeIcon, 
  ChevronDownIcon,
  IdentificationIcon,
  ArchiveBoxIcon,
  TagIcon,
  
  CurrencyDollarIcon,

  CubeIcon,
  CalendarDaysIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:isOpen'])

const route = useRoute()
const router = useRouter()
const isHovered = ref(false)
const isMobile = ref(false)
const sidebarRef = ref(null)
const clickOutsideCount = ref(0)
const lastClickTime = ref(0)

const isOpenState = computed(() => props.isOpen || (!isMobile.value && isHovered.value))

const regularMenuItems = [
  { name: 'Dashboard', path: '/stock-manager/dashboard', icon: HomeIcon },
  { name: 'Reserve Items', path: '/stock-manager/reservation/reservation', icon: CalendarDaysIcon },
]

const dropdownMenus = ref([
  {
    name: 'Price Rules',
    icon: CurrencyDollarIcon,
    isOpen: false,
    subItems: [
      { name: 'Price Rules', path: '/stock-manager/price-rules/price-rules', icon: CurrencyDollarIcon},
      { name: 'Product Price Rules', path: '/stock-manager/price-rules/product-price-rules', icon: CubeIcon },
      { name: 'Category Price Rules', path: '/stock-manager/price-rules/categories-price-rules', icon: TagIcon },
    ]
  },
  {
    name: 'Catalog',
    icon: ArchiveBoxIcon,
    isOpen: false,
    subItems: [
      { name: 'Products', path: '/stock-manager/catalog/products', icon: CubeIcon },
      { name: 'Categories', path: '/stock-manager/catalog/categories', icon: TagIcon },
    ]
  },
])

const isActive = (path) => {
  return route.path.startsWith(path)
}

const selectFirstSubItem = (menu) => {
  if (menu.subItems && menu.subItems.length > 0) {
    router.push(menu.subItems[0].path)
  }
}

const toggleMenu = (clickedMenu) => {
  dropdownMenus.value.forEach(menu => {
    if (menu === clickedMenu) {
      menu.isOpen = !menu.isOpen
      if (menu.isOpen) {
        selectFirstSubItem(menu)
      }
    } else {
      menu.isOpen = false
    }
  })
}

const closeAllDropdowns = () => {
  dropdownMenus.value.forEach(menu => {
    menu.isOpen = false
  })
}

const handleMouseEnter = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
  if (!props.isOpen) {
    closeAllDropdowns()
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

const openRelevantDropdown = (path) => {
  dropdownMenus.value.forEach(menu => {
    if (menu.subItems.some(item => path.startsWith(item.path))) {
      menu.isOpen = true
    } else {
      menu.isOpen = false
    }
  })
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
  document.addEventListener('mousedown', handleClickOutside)
  openRelevantDropdown(route.path)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
  document.removeEventListener('mousedown', handleClickOutside)
})

watch(() => route.path, (newPath) => {
  if (isMobile.value) {
    emit('update:isOpen', false)
  }
  openRelevantDropdown(newPath)
})
</script>

