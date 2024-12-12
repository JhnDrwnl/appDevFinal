<!-- views/cashier/PickupReservation -->
<template>
  <div class="w-full">
    <div v-if="!selectedReservation">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Pickup Reservations</h2>
      
      <Alert 
        v-if="showAlert" 
        :type="alertType" 
        :dismissible="true" 
        @update:modelValue="showAlert = $event"
      >
        {{ alertMessage }}
      </Alert>
    
      <div class="space-y-6">
        <div class="flex items-center justify-between mb-6">
          <div class="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search Pickup Reservation"
              v-model="searchQuery"
              class="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
            />
            <span class="absolute left-3 top-2.5 text-gray-400">
              <MagnifyingGlassIcon class="w-5 h-5" />
            </span>
          </div>
        </div>

        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FF9934]"></div>
        </div>
    
        <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p class="font-bold">Error</p>
          <p>{{ error }}</p>
        </div>
    
        <div v-else class="bg-white rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto relative">
            <table class="w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th @click="sort('id')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    Reservation ID
                    <ArrowsUpDownIcon v-if="sortColumn === 'id'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="inline-block w-4 h-4 ml-1" />
                  </th>
                  <th @click="sort('createdAt')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    Date
                    <ArrowsUpDownIcon v-if="sortColumn === 'createdAt'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="inline-block w-4 h-4 ml-1" />
                  </th>
                  <th @click="sort('totalAmount')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    Total Amount
                    <ArrowsUpDownIcon v-if="sortColumn === 'totalAmount'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="inline-block w-4 h-4 ml-1" />
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="reservation in paginatedReservations" :key="reservation.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ reservation.id }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(reservation.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₱{{ formatPrice(reservation.totalAmount) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span 
                      :class="[
                        'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                        getStatusClass(reservation.status)
                      ]"
                    >
                      {{ reservation.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex space-x-4">
                      <button
                        @click="showReservationDetails(reservation)"
                        class="text-blue-600 hover:text-blue-800 focus:outline-none"
                        title="View"
                      >
                        <EyeIcon class="h-5 w-5" />
                      </button>
                      <button
                        v-if="canAddToPOS && !reservation.addedToPOS"
                        @click="addToPOS(reservation)"
                        class="bg-[#FF9934] hover:bg-[#FF7700] text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline flex items-center space-x-2"
                        title="Add to POS"
                      >
                        <PlusIcon class="h-5 w-5" />
                        <span>Add to POS</span>
                      </button>
                      <span v-else-if="reservation.addedToPOS" class="text-green-600">Added to POS</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
    
        <div class="flex items-center justify-between mt-6">
          <div class="text-sm text-gray-500">
            Rows per page: 
            <select v-model="rowsPerPage" class="ml-2 border-gray-300 rounded-md">
              <option>5</option>
              <option>10</option>
              <option>25</option>
            </select>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeftIcon class="h-5 w-5" />
            </button>
            <span class="text-sm text-gray-500">
              {{ currentPage }} of {{ totalPages }}
            </span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRightIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  
    <div v-else>
      <ReservationDetails
        :reservation="selectedReservation"
        @close="closeReservationDetails"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useReservationStore } from '@/store/modules/reservation'
import { useAuthStore } from '@/store/modules/auth'
import { storeToRefs } from 'pinia'
import { 
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  ArrowsUpDownIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import Alert from '@/components/common/Alert.vue'
import ReservationDetails from '@/components/admin/ReservationDetails.vue'

const router = useRouter()
const reservationStore = useReservationStore()
const authStore = useAuthStore()
const { reservations, isLoading, error } = storeToRefs(reservationStore)

const searchQuery = ref('')
const rowsPerPage = ref(10)
const currentPage = ref(1)
const sortColumn = ref('createdAt')
const sortDirection = ref('desc')
const selectedReservation = ref(null)

// Alert related refs
const showAlert = ref(false)
const alertType = ref('success')
const alertMessage = ref('')

const canAddToPOS = computed(() => {
  const userRole = authStore.user?.role
  return userRole === 'admin' || userRole === 'cashier'
})

const filteredReservations = computed(() => {
  return reservations.value.filter(reservation =>
    reservation.type === 'pickup' &&
    (reservation.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    reservation.status.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

const sortedReservations = computed(() => {
  return [...filteredReservations.value].sort((a, b) => {
    let comparison = 0
    
    if (sortColumn.value === 'totalAmount') {
      comparison = a.totalAmount - b.totalAmount
    } else if (sortColumn.value === 'createdAt') {
      comparison = new Date(a.createdAt) - new Date(b.createdAt)
    } else {
      if (a[sortColumn.value] < b[sortColumn.value]) comparison = -1
      if (a[sortColumn.value] > b[sortColumn.value]) comparison = 1
    }
    
    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

const totalPages = computed(() => Math.ceil(sortedReservations.value.length / rowsPerPage.value))

const paginatedReservations = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return sortedReservations.value.slice(start, end)
})

onMounted(async () => {
  try {
    await reservationStore.fetchAllReservations()
  } catch (error) {
    showAlertMessage(`Error fetching reservations: ${error.message}`, 'error')
  }
})

watch(rowsPerPage, () => {
  currentPage.value = 1
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = dateString.toDate ? dateString.toDate() : new Date(dateString)
  return date.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const formatPrice = (price) => {
  return (parseFloat(price) || 0).toFixed(2)
}

const getStatusClass = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'in_process':
      return 'bg-yellow-100 text-yellow-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const showAlertMessage = (message, type = 'success') => {
  showAlert.value = true
  alertType.value = type
  alertMessage.value = message
  setTimeout(() => {
    showAlert.value = false
  }, 3000) // Hide alert after 3 seconds
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const sort = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

const showReservationDetails = (reservation) => {
  selectedReservation.value = reservation
}

const closeReservationDetails = () => {
  selectedReservation.value = null
}

const addToPOS = async (reservation) => {
  try {
    const result = await reservationStore.addPickupReservationToPOS(reservation.id)
    if (result.success) {
      showAlertMessage('Reservation added to POS items successfully', 'success')
      // Refresh the reservations list
      await reservationStore.fetchAllReservations()
    } else {
      showAlertMessage(`Error adding reservation to POS: ${result.error}`, 'error')
    }
  } catch (error) {
    showAlertMessage(`Error adding reservation to POS: ${error.message}`, 'error')
  }
}
</script>

<style scoped>
.overflow-x-auto {
  overflow-x: auto;
  position: relative;
}

table {
  position: relative;
  z-index: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>