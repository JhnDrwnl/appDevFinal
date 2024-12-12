<!-- components/admin/Header.vue -->
<template>
  <header data-header class="px-6 lg:px-8 py-4">
    <div class="max-w-7xl mx-auto w-full">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div class="flex items-center justify-between h-16 px-6">
          <div class="flex items-center gap-4">
            <button
              @click="$emit('toggle-sidebar')"
              class="p-2.5 rounded-xl text-black hover:bg-gray-50/75 transition-colors duration-200"
              aria-label="Toggle sidebar"
            >
              <MenuIcon class="h-5 w-5" />
            </button>
          </div>

          <div class="flex items-center gap-4 md:gap-6">
            <!-- Search -->
            <div class="hidden md:flex items-center">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Try to searching"
                  class="w-80 px-5 py-2.5 text-sm bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9934]/10 focus:border-transparent transition-all duration-200"
                />
                <SearchIcon class="absolute right-4 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <!-- Notifications Dropdown -->
            <div class="relative">
              <button
                @click="toggleNotifications"
                class="text-gray-500 hover:text-gray-700 transition-colors duration-200 relative"
              >
                <BellIcon class="h-5 w-5" />
                <span v-if="totalNotificationsCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {{ totalNotificationsCount }}
                </span>
              </button>

              <div
                v-if="isNotificationsOpen"
                class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
              >
                <div v-if="totalNotificationsCount === 0" class="px-4 py-2 text-sm text-gray-700">
                  No new notifications
                </div>
                <div v-else>
                  <div v-if="removalRequestsCount > 0">
                    <h3 class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Removal Requests</h3>
                    <div v-for="request in removalRequests" :key="request.id" class="px-4 py-2 hover:bg-gray-50">
                      <router-link :to="{ name: 'RemovalRequestForm', params: { id: request.id } }" class="text-sm text-gray-700">
                        Removal request for item {{ request.itemId }}
                      </router-link>
                    </div>
                  </div>
                  <!-- Add other notification types here -->
                </div>
              </div>
            </div>

            <!-- Orders -->
            <button class="text-gray-500 hover:text-gray-700 transition-colors duration-200 relative">
              <ShoppingBagIcon class="h-5 w-5" />
              <span class="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
            </button>

            <!-- Profile Dropdown -->
            <div class="relative ml-auto">
              <button
                @click="toggleUserMenu"
                class="focus:outline-none focus:ring-2 focus:ring-[#FF9934]/10 rounded-xl transition-all duration-200"
                aria-haspopup="true"
                :aria-expanded="isUserMenuOpen"
              >
                <img
                  class="w-9 h-9 rounded-xl object-cover ring-2 ring-gray-100"
                  :src="user?.photoURL || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'36\' height=\'36\' viewBox=\'0 0 36 36\'%3E%3Crect width=\'36\' height=\'36\' fill=\'%23f0f2f5\'/%3E%3Cpath d=\'M18 20.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM8 28.5c0-2.5 5-5 10-5s10 2.5 10 5\' stroke=\'%23bec3c9\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E'"
                  :alt="user?.displayName || 'User avatar'"
                />
              </button>

              <div
                v-if="isUserMenuOpen"
                class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                style="right: -24px;"
              >
                <div class="px-4 py-3 border-b border-gray-50">
                  <p class="text-sm font-medium text-gray-900">{{ user?.email || 'Unknown User' }}</p>
                  <p class="text-xs font-medium text-gray-500 mt-1">{{ user?.role || 'No Role' }}</p>
                </div>
                <router-link
                  :to="{ name: 'AdminProfile' }"
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  @click="handleMyPreferences"
                >
                  <SettingsIcon class="w-4 h-4 mr-2" />
                  My Preferences
                </router-link>
                <div class="border-t border-gray-50 mt-2 pt-2">
                  <a
                    href="#"
                    @click.prevent="handleLogout"
                    class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Sign out
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import { useRemovalRequestStore } from '@/store/modules/removalRequests'
import { useRouter } from 'vue-router'
import { 
  MenuIcon, 
  SearchIcon, 
  BellIcon, 
  ShoppingBagIcon, 
  SettingsIcon 
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const removalRequestStore = useRemovalRequestStore()

const isUserMenuOpen = ref(false)
const isNotificationsOpen = ref(false)
const user = computed(() => authStore.user)

const removalRequests = computed(() => removalRequestStore.removalRequests)
const removalRequestsCount = computed(() => removalRequests.value.length)

// Placeholder for other notification types
const otherNotificationsCount = ref(0)

const totalNotificationsCount = computed(() => removalRequestsCount.value + otherNotificationsCount.value)

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    closeUserMenu()
    router.push({ name: 'login' })
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const openAdminDropdown = inject('openAdminDropdown')

const handleMyPreferences = () => {
  closeUserMenu()
  openAdminDropdown()
}

const fetchNotifications = async () => {
  await removalRequestStore.fetchRemovalRequests()
  // Fetch other notification types here
}

onMounted(() => {
  fetchNotifications()
})

defineProps({
  isSidebarOpen: {
    type: Boolean,
    required: true
  }
})

defineEmits(['toggle-sidebar'])
</script>

