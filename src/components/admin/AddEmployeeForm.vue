<!-- components/admin/AddEmployeeForm.vue -->
<template>
    <div class="bg-white p-6 rounded-lg shadow-sm">
      <!-- Header with Search -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-gray-900">Add New Employee</h2>
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            @input="debouncedSearch"
            placeholder="Search a user"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF] w-64"
          >
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
  
      <!-- Search Results -->
      <div v-if="searchQuery && employeeStore.allUsers.length > 0" class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Search Results</h3>
        <ul class="divide-y divide-gray-200">
          <li v-for="user in employeeStore.paginatedUsers" :key="user.id" class="py-2">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ user.username || 'N/A' }}</p>
                <p class="text-sm text-gray-500">{{ user.email }}</p>
              </div>
              <button
                @click="selectUser(user)"
                class="px-3 py-1 bg-[#0095FF] text-white rounded-full text-sm hover:bg-[#0077CC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0095FF]"
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
            :disabled="employeeStore.currentPage === 1"
            class="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span class="text-sm text-gray-600">
            Page {{ employeeStore.currentPage }} of {{ employeeStore.totalPages }}
          </span>
          <button
            @click="nextPage"
            :disabled="employeeStore.currentPage === employeeStore.totalPages"
            class="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
  
      <form @submit.prevent="addEmployee" class="space-y-6">
        <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
            <input
              v-model="newEmployee.username"
              id="username"
              type="text"
              required
              class="mt-1 block w-full px-4 py-3 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
            >
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              v-model="newEmployee.email"
              id="email"
              type="email"
              required
              class="mt-1 block w-full px-4 py-3 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
            >
          </div>
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
            <select
              v-model="newEmployee.role"
              id="role"
              required
              class="mt-1 block w-full px-4 py-3 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="stock manager">Stock Manager</option>
              <option value="cashier">Cashier</option>
              <option value="driver">Driver</option>
            </select>
          </div>
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
            <select
              v-model="newEmployee.status"
              id="status"
              required
              class="mt-1 block w-full px-4 py-3 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0095FF]"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-[#0095FF] text-white rounded-full hover:bg-[#0077CC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0095FF]"
          >
            Add Employee
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import { useEmployeeStore } from '@/store/modules/employees'
  import debounce from 'lodash/debounce'
  
  const emit = defineEmits(['close', 'employee-added'])
  const employeeStore = useEmployeeStore()
  
  const searchQuery = ref('')
  const newEmployee = ref({
    id: '',
    username: '',
    email: '',
    role: '',
    status: ''
  })
  
  const searchUsers = async () => {
    if (searchQuery.value.trim()) {
      await employeeStore.searchAllUsers(searchQuery.value)
    }
  }
  
  const debouncedSearch = debounce(searchUsers, 300)
  
  const selectUser = (user) => {
    newEmployee.value = {
      id: user.id,
      username: user.username || '',
      email: user.email,
      role: '',
      status: ''
    }
    searchQuery.value = ''
  }
  
  const addEmployee = async () => {
    try {
      await employeeStore.addEmployee(newEmployee.value)
      emit('employee-added', newEmployee.value)
    } catch (error) {
      console.error('Error adding employee:', error)
      // Handle error (e.g., show an error message to the user)
    }
  }
  
  const prevPage = () => {
    if (employeeStore.currentPage > 1) {
      employeeStore.searchAllUsers(searchQuery.value, employeeStore.currentPage - 1)
    }
  }
  
  const nextPage = () => {
    if (employeeStore.currentPage < employeeStore.totalPages) {
      employeeStore.searchAllUsers(searchQuery.value, employeeStore.currentPage + 1)
    }
  }
  
  // Clear search results when the component is unmounted
  watch(() => searchQuery.value, (newValue) => {
    if (!newValue) {
      employeeStore.allUsers = []
    }
  })
  </script>