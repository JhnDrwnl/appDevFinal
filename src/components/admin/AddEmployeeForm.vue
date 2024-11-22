<!-- components/admin/AddEmployeeForm.vue -->
<template>
    <div class="bg-white p-6 rounded-lg shadow-sm">
      <h2 class="text-2xl font-semibold text-gray-900 mb-6">Add New Employee</h2>
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
  import { ref } from 'vue'
  
  const emit = defineEmits(['close', 'employee-added'])
  
  const newEmployee = ref({
    username: '',
    email: '',
    role: '',
    status: ''
  })
  
  const addEmployee = () => {
    emit('employee-added', newEmployee.value)
  }
  </script>