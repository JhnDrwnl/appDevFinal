<!-- components/admin/EditEmployeeForm.vue -->
<template>
  <div class="bg-white p-6 rounded-lg shadow-sm">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-900">Edit Employee</h2>
    </div>

    <form @submit.prevent="updateEmployee" class="space-y-6">
      <div class="flex space-x-4">
        <div class="flex-1">
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input
            v-model="editedEmployee.username"
            id="username"
            type="text"
            readonly
            class="mt-1 block w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
          >
        </div>
        <div class="flex-1">
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="editedEmployee.email"
            id="email"
            type="email"
            readonly
            class="mt-1 block w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
          >
        </div>
        <div class="flex-1">
          <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
          <select
            v-model="editedEmployee.role"
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
          :disabled="!editedEmployee.id || !editedEmployee.role"
          class="px-4 py-2 bg-[#FF9934] text-white rounded-full hover:bg-[#E88820] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934] disabled:opacity-50"
        >
          Update Employee
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useEmployeeStore } from '@/store/modules/employees'

const props = defineProps({
  employee: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'employee-updated', 'show-alert'])
const employeeStore = useEmployeeStore()

const editedEmployee = ref({
  id: '',
  username: '',
  email: '',
  role: ''
})

onMounted(() => {
  editedEmployee.value = { ...props.employee }
})

const updateEmployee = async () => {
  try {
    const result = await employeeStore.updateEmployeeRole(editedEmployee.value.id, editedEmployee.value.role)
    if (result.success) {
      emit('employee-updated', editedEmployee.value)
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
</script>

