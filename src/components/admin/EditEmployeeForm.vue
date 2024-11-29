<!-- components/admin/EditEmployeeForm.vue -->
<template>
  <div class="bg-white p-6 rounded-lg shadow-sm">
    <h2 class="text-2xl font-semibold text-gray-900 mb-6">Edit Employee</h2>
    <form @submit.prevent="updateEmployee" class="space-y-6">
      <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input
            v-model="editedEmployee.username"
            id="username"
            type="text"
            required
            class="mt-1 block w-full px-4 py-3 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
          >
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="editedEmployee.email"
            id="email"
            type="email"
            required
            class="mt-1 block w-full px-4 py-3 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
          >
        </div>
        <div>
          <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
          <select
            v-model="editedEmployee.role"
            id="role"
            required
            class="mt-1 block w-full px-4 py-3 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
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
          class="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0095FF]"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-[#0095FF] text-white rounded-full hover:bg-[#0077CC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0095FF]"
        >
          Update Employee
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  employee: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'employee-updated'])

const editedEmployee = ref({
  id: '',
  username: '',
  email: '',
  role: ''
})

onMounted(() => {
  editedEmployee.value = { ...props.employee }
})

const updateEmployee = () => {
  emit('employee-updated', editedEmployee.value)
}
</script>