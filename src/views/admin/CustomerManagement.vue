<!-- views/admin/CustomerManagement.vue -->
<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-6">
      <div class="relative flex-1 max-w-md">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search customers"
          @input="handleSearch"
          class="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
        />
        <span class="absolute left-3 top-2.5 text-gray-400">
          <MagnifyingGlassIcon class="w-5 h-5" />
        </span>
      </div>
    </div>

    <div v-if="customerStore.isLoading" class="text-center py-4">
      <p>Loading customers...</p>
    </div>

    <div v-else-if="customerStore.error" class="text-center py-4 text-red-500">
      <p>{{ customerStore.error }}</p>
    </div>

    <div v-else-if="paginatedCustomers.length === 0" class="text-center py-4">
      <p>No customers found.</p>
    </div>

    <div v-else>
      <div v-if="!selectedCustomer" class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto relative">
          <table class="w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th v-for="header in tableHeaders" :key="header.key" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortBy(header.key)">
                  {{ header.label }}
                  <ArrowsUpDownIcon v-if="sortKey === header.key" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="inline-block w-4 h-4 ml-1" />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Reservations
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="customer in paginatedCustomers" :key="customer.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img class="h-10 w-10 rounded-full" :src="customer.photoURL || '/placeholder.svg?height=40&width=40'" :alt="customer.username" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ customer.username }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ customer.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(customer.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ customer.totalReservations || 0 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button @click="viewCustomerDetails(customer)" class="text-[#FF9934] hover:text-[#E88820] mr-2">
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <UserDetailsAndOrders
        v-else
        :user="selectedCustomer"
        :totalReservations="selectedCustomer.totalReservations"
        @close="closeCustomerDetails"
      />

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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCustomerStore } from '@/store/modules/customers'
import { useReservationStore } from '@/store/modules/reservation'
import { 
  MagnifyingGlassIcon, 
  ArrowsUpDownIcon, 
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import UserDetailsAndOrders from '@/components/admin/UserDetailsAndOrders.vue'

const customerStore = useCustomerStore()
const reservationStore = useReservationStore()
const searchQuery = ref('')
const sortKey = ref('createdAt')
const sortDirection = ref('desc')
const currentPage = ref(1)
const rowsPerPage = ref(10)
const selectedCustomer = ref(null)

const tableHeaders = [
  { key: 'username', label: 'Name' },
  { key: 'email', label: 'Email Address' },
  { key: 'createdAt', label: 'Registration Date' }
]

onMounted(async () => {
  await customerStore.fetchCustomers()
  await fetchTotalReservations()
})

const fetchTotalReservations = async () => {
  const reservations = await reservationStore.fetchAllReservations()
  if (reservations.success) {
    customerStore.customers.forEach(customer => {
      customer.totalReservations = reservations.reservations.filter(r => r.userId === customer.id).length
    })
  }
}

const filteredCustomers = computed(() => {
  return customerStore.customers.filter(customer => {
    const matchesSearch = customer.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          customer.email.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesSearch;
  });
});

const sortedCustomers = computed(() => {
  return [...filteredCustomers.value].sort((a, b) => {
    let modifier = sortDirection.value === 'asc' ? 1 : -1
    if (a[sortKey.value] < b[sortKey.value]) return -1 * modifier
    if (a[sortKey.value] > b[sortKey.value]) return 1 * modifier
    return 0
  })
})

const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return sortedCustomers.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(sortedCustomers.value.length / rowsPerPage.value))

const formatDate = (date) => {
  return date ? new Date(date).toLocaleString() : 'N/A'
}

const handleSearch = () => {
  currentPage.value = 1
}

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
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

const viewCustomerDetails = (customer) => {
  selectedCustomer.value = customer
}

const closeCustomerDetails = () => {
  selectedCustomer.value = null
}

watch(searchQuery, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

