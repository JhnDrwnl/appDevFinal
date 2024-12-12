<!-- views/cashier/SalesHistory.vue -->
<template>
  <div class="w-full">
    <h2 class="text-2xl font-bold mb-4">Sales History</h2>
    <Alert 
      v-if="showAlert" 
      :type="alertType" 
      :dismissible="true" 
      @update:modelValue="showAlert = $event"
    >
      {{ alertMessage }}
    </Alert>

    <div v-if="!selectedSale" class="space-y-6">
      <div class="flex items-center justify-between mb-6">
        <div class="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search Sales"
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
                  <div class="flex items-center justify-between">
                    <span>Transaction ID</span>
                    <ArrowsUpDownIcon v-if="sortColumn === 'id'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="w-4 h-4" />
                  </div>
                </th>
                <th @click="sort('timestamp')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                  <div class="flex items-center justify-between">
                    <span>Date</span>
                    <ArrowsUpDownIcon v-if="sortColumn === 'timestamp'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="w-4 h-4" />
                  </div>
                </th>
                <th @click="sort('totalAmount')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                  <div class="flex items-center justify-between">
                    <span>Total Amount</span>
                    <ArrowsUpDownIcon v-if="sortColumn === 'totalAmount'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="w-4 h-4" />
                  </div>
                </th>
                <th @click="sort('items')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                  <div class="flex items-center justify-between">
                    <span>Items</span>
                    <ArrowsUpDownIcon v-if="sortColumn === 'items'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="w-4 h-4" />
                  </div>
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="sale in paginatedSales" :key="sale.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ sale.id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(sale.timestamp) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₱{{ formatPrice(sale.totalAmount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ sale.items.length }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="viewSaleDetails(sale)"
                    class="text-blue-600 hover:text-blue-800 focus:outline-none"
                    title="View"
                  >
                    <EyeIcon class="h-5 w-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex items-center justify-between mt-6">
        <div class="text-sm text-gray-500">
          Rows per page: 
          <select v-model="itemsPerPage" class="ml-2 border-gray-300 rounded-md">
            <option>5</option>
            <option>10</option>
            <option>25</option>
          </select>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="prevPage"
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

    <SaleDetails
      v-if="selectedSale"
      :sale="selectedSale"
      @back="selectedSale = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { 
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  ArrowsUpDownIcon,
} from '@heroicons/vue/24/outline'
import Alert from '@/components/common/Alert.vue'
import SaleDetails from '@/components/cashier/SaleDetails.vue'

const sales = ref([])
const isLoading = ref(true)
const error = ref(null)
const selectedSale = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref('')
const sortColumn = ref('timestamp')
const sortDirection = ref('desc')

// Alert related refs
const showAlert = ref(false)
const alertType = ref('success')
const alertMessage = ref('')

const fetchSales = async () => {
  try {
    const salesCollection = collection(db, 'sales')
    const q = query(salesCollection, orderBy('timestamp', 'desc'), limit(100))
    const querySnapshot = await getDocs(q)
    sales.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    isLoading.value = false
  } catch (err) {
    console.error('Error fetching sales:', err)
    error.value = 'An error occurred while fetching sales data'
    isLoading.value = false
  }
}

onMounted(fetchSales)

const filteredSales = computed(() => {
  return sales.value.filter(sale =>
    sale.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    sale.items.some(item => item.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

const sortedSales = computed(() => {
  return [...filteredSales.value].sort((a, b) => {
    let comparison = 0
    
    if (sortColumn.value === 'totalAmount' || sortColumn.value === 'items') {
      comparison = a[sortColumn.value] - b[sortColumn.value]
    } else if (sortColumn.value === 'timestamp') {
      comparison = new Date(a[sortColumn.value]) - new Date(b[sortColumn.value])
    } else {
      if (a[sortColumn.value] < b[sortColumn.value]) comparison = -1
      if (a[sortColumn.value] > b[sortColumn.value]) comparison = 1
    }
    
    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

const totalPages = computed(() => Math.ceil(sortedSales.value.length / itemsPerPage.value))

const paginatedSales = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedSales.value.slice(start, end)
})

watch(itemsPerPage, () => {
  currentPage.value = 1
})

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
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

const showAlertMessage = (message, type = 'success') => {
  showAlert.value = true
  alertType.value = type
  alertMessage.value = message
  setTimeout(() => {
    showAlert.value = false
  }, 3000) // Hide alert after 3 seconds
}

const prevPage = () => {
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

const viewSaleDetails = (sale) => {
  selectedSale.value = sale
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

