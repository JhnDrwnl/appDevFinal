<!-- components/admin/AddEmployeeForm.vue -->
<template>
  <div class="bg-white p-6 rounded-lg shadow-sm">
    <!-- Header with Search -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-900">Add Employee</h2>
      <div class="relative">
        <input
          type="text"
          v-model="searchQuery"
          @input="debouncedSearch"
          placeholder="Search a user"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934] w-64"
        >
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="searchQuery && filteredUsers.length > 0" class="mb-6">
      <h3 class="text-lg font-semibold mb-2">Search Results</h3>
      <ul class="divide-y divide-gray-200">
        <li v-for="user in paginatedUsers" :key="user.id" class="py-2">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900">{{ user.username || 'N/A' }}</p>
              <p class="text-sm text-gray-500">{{ user.email }}</p>
            </div>
            <button
              @click="selectUser(user)"
              class="px-3 py-1 bg-[#FF9934] text-white rounded-full text-sm hover:bg-[#E88820] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934]"
            >
              Select
            </button>
          </div>
        </li>
      </ul>
      <!-- Pagination -->
      <div class="flex justify-between items-center mt-4">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <span class="text-sm text-gray-600">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>

    <form @submit.prevent="updateEmployeeRole" class="space-y-6">
      <div class="flex space-x-4">
        <div class="flex-1">
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input
            v-model="selectedUser.username"
            id="username"
            type="text"
            readonly
            class="mt-1 block w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
          >
        </div>
        <div class="flex-1">
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="selectedUser.email"
            id="email"
            type="email"
            readonly
            class="mt-1 block w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
          >
        </div>
        <div class="flex-1">
          <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
          <select
            v-model="selectedUser.role"
            id="role"
            required
            class="mt-1 block w-full px-4 py-3 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="stock manager">Stock Manager</option>
            <option value="cashier">Cashier</option>
            <option value="driver">Driver</option>
          </select>
        </div>
      </div>
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934]"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="!selectedUser.id || !selectedUser.role"
          class="px-4 py-2 bg-[#FF9934] text-white rounded-full hover:bg-[#E88820] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934] disabled:opacity-50"
        >
          Add Employee
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useEmployeeStore } from '@/store/modules/employees'
import { db } from '@/services/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import debounce from 'lodash/debounce'

const emit = defineEmits(['close', 'employee-updated', 'show-alert'])
const employeeStore = useEmployeeStore()

const searchQuery = ref('')
const selectedUser = ref({
  id: '',
  username: '',
  email: '',
  role: ''
})

const currentPage = ref(1)
const itemsPerPage = 5
const filteredUsers = ref([])

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredUsers.value.slice(start, end)
})

const searchUsers = async () => {
  if (searchQuery.value.trim()) {
    const usersRef = collection(db, 'users')
    const q = query(
      usersRef,
      where('email', '>=', searchQuery.value.toLowerCase()),
      where('email', '<=', searchQuery.value.toLowerCase() + '\uf8ff')
    )
    const querySnapshot = await getDocs(q)
    filteredUsers.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    currentPage.value = 1 // Reset to first page on new search
  } else {
    filteredUsers.value = []
  }
}

const debouncedSearch = debounce(searchUsers, 300)

const selectUser = (user) => {
  selectedUser.value = {
    id: user.id,
    username: user.username || '',
    email: user.email,
    role: user.role || ''
  }
  searchQuery.value = ''
}

const updateEmployeeRole = async () => {
  try {
    const result = await employeeStore.updateEmployeeRole(selectedUser.value.id, selectedUser.value.role)
    if (result.success) {
      emit('employee-updated', selectedUser.value)
      emit('show-alert', {
        type: 'success',
        message: 'Employee role updated successfully'
      })
      emit('close')
    }
  } catch (error) {
    console.error('Error updating employee role:', error)
    emit('show-alert', {
      type: 'error',
      message: 'Error updating employee role: ' + error.message
    })
  }
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

// Clear search results when the component is unmounted
watch(() => searchQuery.value, (newValue) => {
  if (!newValue) {
    filteredUsers.value = []
    currentPage.value = 1
  }
})
</script>

