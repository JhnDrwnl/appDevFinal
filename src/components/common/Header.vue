<!-- components/common/Header.vue -->
<template>
  <header 
    ref="header" 
    class="bg-white shadow-sm transition-all duration-300"
    :class="{ 
      'fixed top-0 left-0 right-0 z-50 animate-slideDown': isScrolled,
      'relative': !isScrolled
    }"
  >
    <nav class="max-w-7xl mx-auto px-8">
      <div class="flex justify-between items-center h-24">
        <!-- Left side with logo and company name -->
        <div class="flex items-center space-x-4">
          <router-link to="/" class="flex items-center">
            <img 
              src="@/assets/image/SALogo.png"
              alt="Supreme Agrivet Logo" 
              class="h-14 w-auto"
            />
            <div class="ml-2 flex flex-col">
              <span class="text-xl font-bold text-gray-900 font-sans leading-tight">Supreme</span>
              <span class="text-lg font-medium text-gray-700 font-serif -mt-1">Agrivet</span>
            </div>
          </router-link>
        </div>

        <!-- Centered navigation -->
        <div class="flex-1 flex justify-center items-center space-x-10">
          <!-- Home link -->
          <router-link 
            to="/" 
            class="text-base font-medium transition-colors duration-200 relative group"
            :class="[
              $route.name === 'Home'
                ? 'text-[#FF9934]'
                : 'text-gray-700 hover:text-[#FF9934]'
            ]"
          >
            Home
            <span 
              class="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF9934] transform transition-transform duration-200"
              :class="{
                'scale-x-100': $route.name === 'Home',
                'scale-x-0 group-hover:scale-x-100': $route.name !== 'Home'
              }"
            ></span>
          </router-link>

          <!-- Shop Dropdown -->
          <div class="relative group">
            <button 
              @mouseenter="showMainDropdown"
              @mouseleave="hideMainDropdownIfNotHovered"
              @click="navigateToUserHome"
              class="text-sm font-medium transition-colors duration-200 text-gray-700 hover:text-[#FF9934] relative dropdown-toggle"
              :class="{ 'text-[#FF9934]': isMainDropdownOpen }"
            >
              Shop
              <span 
                class="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF9934] transform transition-transform duration-200"
                :class="{ 'scale-x-100': isMainDropdownOpen, 'scale-x-0 group-hover:scale-x-100': !isMainDropdownOpen }"
              ></span>
            </button>
            <div 
              v-show="isMainDropdownOpen" 
              @mouseenter="showMainDropdown"
              @mouseleave="hideMainDropdownIfNotHovered"
              class="absolute left-0 mt-2 w-64 bg-white shadow-lg rounded-md overflow-hidden z-20"
            >
              <div class="p-4 flex flex-col space-y-2">
                <template v-for="category in rootCategories" :key="category.id">
                  <router-link 
                    :to="{ name: 'UserHome', query: { category: category.id } }"
                    class="text-sm font-semibold text-gray-900 hover:text-[#FF9934]"
                    @click.native="handleMainDropdownClick(category.id)"
                  >
                    {{ category.name }}
                  </router-link>
                  <div v-if="getChildCategories(category.id).length > 0" class="ml-4 mt-1 flex flex-col space-y-1">
                    <router-link 
                      v-for="childCategory in getChildCategories(category.id)" 
                      :key="childCategory.id"
                      :to="{ name: 'UserHome', query: { category: childCategory.id } }"
                      class="text-sm text-gray-700 hover:text-[#FF9934]"
                      @click.native="handleMainDropdownClick(childCategory.id)"
                    >
                      {{ childCategory.name }}
                    </router-link>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Poultry Tips and Contact Us links -->
          <a
            v-for="item in navItems"
            :key="item.name"
            :href="item.to"
            @click.prevent="navigateTo(item.to, item.name)"
            class="text-base font-medium transition-colors duration-200 relative group"
            :class="[
              $route.name === item.name
                ? 'text-[#FF9934]'
                : 'text-gray-700 hover:text-[#FF9934]'
            ]"
          >
            {{ item.text }}
            <span 
              class="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF9934] transform transition-transform duration-200"
              :class="{
                'scale-x-100': $route.name === item.name || activeNavItem === item.name,
                'scale-x-0 group-hover:scale-x-100': $route.name !== item.name && activeNavItem !== item.name
              }"
            ></span>
          </a>
        </div>

        <!-- Right side icons -->
        <div class="flex items-center space-x-6">
          <!-- Search -->
          <button class="text-gray-700 hover:text-[#FF9934] focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <!-- Shopping Cart -->
          <div class="relative">
            <button class="text-gray-700 hover:text-[#FF9934] focus:outline-none">
              <ShoppingBasket class="w-6 h-6" />
              <span class="absolute -top-1 -right-1 bg-[#FF9934] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
            </button>
          </div>

          <!-- Notifications (only for authenticated users) -->
          <div v-if="isAuthenticated" class="relative">
            <button class="text-gray-700 hover:text-[#FF9934] focus:outline-none">
              <Bell class="w-6 h-6" />
              <span v-if="unreadNotificationsCount > 0" class="absolute -top-1 -right-1 bg-[#FF9934] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {{ unreadNotificationsCount }}
              </span>
            </button>
          </div>

          <!-- Profile Dropdown -->
          <div class="relative" ref="profileDropdown">
            <button @click="toggleUserDropdown" class="flex items-center focus:outline-none dropdown-toggle">
              <img 
                :src="profilePicture" 
                alt="User profile" 
                class="w-10 h-10 rounded-xl object-cover"
              />
            </button>
            <div 
              v-show="isUserDropdownOpen" 
              class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-20 border border-gray-100"
            >
              <template v-if="isAuthenticated">
                <router-link to="/user/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Account</router-link>
                <router-link to="/user/orders" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Orders</router-link>
                <button @click="handleLogout" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Logout</button>
              </template>
              <template v-else>
                <router-link to="/login" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Login</router-link>
                <router-link to="/register" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Register</router-link>
              </template>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="flex items-center md:hidden">
            <button
              @click="toggleMobileMenu"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#FF9934] hover:bg-gray-100 focus:outline-none"
            >
              <span class="sr-only">Open main menu</span>
              <svg
                class="w-7 h-7"
                :class="{ 'hidden': mobileMenuOpen, 'block': !mobileMenuOpen }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                class="w-7 h-7"
                :class="{ 'block': mobileMenuOpen, 'hidden': !mobileMenuOpen }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div
        class="md:hidden"
        :class="{ 'block': mobileMenuOpen, 'hidden': !mobileMenuOpen }"
      >
        <div class="pt-2 pb-3 space-y-1">
          <!-- Home link for mobile -->
          <router-link 
            to="/" 
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#FF9934] hover:bg-gray-50 rounded-md"
            @click.native="closeMobileMenu"
          >
            Home
          </router-link>

          <!-- SHOP Dropdown for mobile -->
          <div class="relative">
            <button @click="toggleMobileDropdown" class="w-full text-left block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#FF9934] hover:bg-gray-50 rounded-md">
              SHOP
            </button>
            <div v-if="isMobileDropdownOpen" class="mt-2 space-y-2 pl-4">
              <template v-for="category in rootCategories" :key="category.id">
                <router-link
                  :to="{ name: 'UserHome', query: { category: category.id } }"
                  class="block py-2 text-sm font-semibold text-gray-900 hover:text-[#FF9934]"
                  @click.native="handleMobileDropdownClick(category.id)"
                >
                  {{ category.name }}
                </router-link>
                <div v-if="getChildCategories(category.id).length > 0" class="ml-4 mt-1 space-y-1">
                  <router-link
                    v-for="childCategory in getChildCategories(category.id)"
                    :key="childCategory.id"
                    :to="{ name: 'UserHome', query: { category: childCategory.id } }"
                    class="block py-1 text-sm text-gray-700 hover:text-[#FF9934]"
                    @click.native="handleMobileDropdownClick(childCategory.id)"
                  >
                    {{ childCategory.name }}
                  </router-link>
                </div>
              </template>
            </div>
          </div>

          <!-- Main navigation for mobile -->
          <a
            v-for="item in navItems"
            :key="item.name"
            href="#"
            @click.prevent="navigateTo(item.to, item.name)"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#FF9934] hover:bg-gray-50 rounded-md"
          >
            {{ item.text }}
          </a>

          <!-- Authentication links for mobile -->
          <template v-if="isAuthenticated">
            <router-link to="/user/profile" class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#FF9934] hover:bg-gray-50 rounded-md">Account</router-link>
            <router-link to="/user/orders" class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#FF9934] hover:bg-gray-50 rounded-md">Orders</router-link>
            <button @click="handleLogout" class="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-[#FF9934] hover:bg-gray-50 rounded-md">Logout</button>
          </template>
          <template v-else>
            <router-link to="/login" class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#FF9934] hover:bg-gray-50 rounded-md">Login</router-link>
            <router-link to="/register" class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#FF9934] hover:bg-gray-50 rounded-md">Register</router-link>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { useCategoryStore } from '@/store/modules/categories'
import { ShoppingBasket, Bell } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const categoryStore = useCategoryStore()

const mobileMenuOpen = ref(false)
const isDropdownOpen = ref(false)
const isMobileDropdownOpen = ref(false)
const activeNavItem = ref(null)
const isDropdownClicked = ref(false)
const header = ref(null)
const isScrolled = ref(false)
const profileDropdown = ref(null)
const unreadNotificationsCount = ref(0)
const isMainDropdownOpen = ref(false)
const isUserDropdownOpen = ref(false)
const isDropdownHovered = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)

const profilePicture = ref('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'36\' height=\'36\' viewBox=\'0 0 36 36\'%3E%3Crect width=\'36\' height=\'36\' fill=\'%23f0f2f5\'/%3E%3Cpath d=\'M18 20.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM8 28.5c0-2.5 5-5 10-5s10 2.5 10 5\' stroke=\'%23bec3c9\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E')

const navItems = [
  { name: 'PoultryTips', to: '/poultry-tips', text: 'Poultry Tips' },
  { name: 'contactUs', to: '/contact', text: 'Contact Us' },
]

const rootCategories = computed(() => categoryStore.getRootCategories)
const getChildCategories = computed(() => categoryStore.getChildCategories)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  if (!mobileMenuOpen.value) {
    isMobileDropdownOpen.value = false
  }
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
  isMobileDropdownOpen.value = false
}

const showMainDropdown = () => {
  isMainDropdownOpen.value = true
  isDropdownHovered.value = true
}

const hideMainDropdownIfNotHovered = () => {
  isDropdownHovered.value = false
  setTimeout(() => {
    if (!isDropdownHovered.value) {
      isMainDropdownOpen.value = false
    }
  }, 100)
}

const handleMainDropdownClick = (categoryId) => {
  router.push({ name: 'UserHome', query: { category: categoryId } })
  closeMobileMenu()
}

const handleMobileDropdownClick = (categoryId) => {
  router.push({ name: 'UserHome', query: { category: categoryId } })
  closeMobileMenu()
}

const navigateToUserHome = () => {
  router.push({ name: 'UserHome' })
}

const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value
  if (isUserDropdownOpen.value) {
    isMainDropdownOpen.value = false
  }
}

const closeDropdowns = () => {
  isMainDropdownOpen.value = false
  isUserDropdownOpen.value = false
  isDropdownHovered.value = false
}

const toggleMobileDropdown = () => {
  isMobileDropdownOpen.value = !isMobileDropdownOpen.value
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.dropdown-toggle')) {
    closeDropdowns()
  }
}

const navigateTo = (path, name) => {
  if (route.path !== path) {
    router.push(path)
  }
  activeNavItem.value = name
  isDropdownOpen.value = false
  isDropdownClicked.value = false
  closeMobileMenu()
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push({ name: 'login' })
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

watch(() => route.name, () => {
  activeNavItem.value = null
  isDropdownOpen.value = false
  isDropdownClicked.value = false
})

const handleScroll = () => {
  const scrollPosition = window.pageYOffset
  if (scrollPosition > 100 && !isScrolled.value) {
    isScrolled.value = true
  } else if (scrollPosition <= 100 && isScrolled.value) {
    isScrolled.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
  categoryStore.fetchCategories()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
header {
  transition: transform 0.3s ease;
}
@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slideDown {
  animation: slideDown 0.3s ease-in-out forwards;
}
</style>

