<!-- views/admin/Employees.vue -->
<template>
  <div>
    <Alert
      v-if="showAlert"
      :type="alertType"
      :dismissible="true"
      v-model="showAlert"
      class="mb-6"
    >
      {{ alertMessage }}
    </Alert>

    <div v-if="!isAddingEmployee && !isEditingEmployee">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Employees</h1>
        <div class="flex items-center space-x-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search employees"
            @input="handleSearch"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
          />
          <button
            v-if="isAdmin"
            @click="showAddEmployeeForm"
            class="bg-[#FF9934] text-white px-6 py-2 rounded-full hover:bg-[#E88820] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934]"
          >
            Add Employee
          </button>
        </div>
      </div>
      
      <div v-if="!authStore.isAuthenticated" class="text-center py-4 text-red-500">
        <p>You must be logged in to view employees.</p>
      </div>

      <div v-else-if="employeeStore.isLoading" class="text-center py-4">
        <p>Loading employees...</p>
      </div>

      <div v-else-if="employeeStore.error" class="text-center py-4 text-red-500">
        <p>{{ employeeStore.error }}</p>
      </div>

      <div v-else-if="sortedEmployees.length === 0" class="text-center py-4">
        <p>No employees found.</p>
      </div>

      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" v-if="isAdmin" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="employee in sortedEmployees" :key="employee.id" :class="{ 'bg-gray-50': employee.role === 'admin' }">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img class="h-10 w-10 rounded-full" :src="employee.photoURL || '/placeholder.svg?height=40&width=40'" :alt="employee.username" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ employee.username }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ employee.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ employee.role }}</td>
              <td v-if="isAdmin && employee.role !== 'admin'" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button @click="showEditEmployeeForm(employee)" class="text-green-600 hover:text-green-900 mr-4">
                  <PencilSquareIcon class="h-5 w-5" />
                </button>
                <button @click="deleteEmployee(employee.id)" class="text-red-600 hover:text-red-900">
                  <TrashIcon class="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AddEmployeeForm 
      v-if="isAddingEmployee"
      @close="cancelAddEmployee"
      @employee-added="handleEmployeeAdded"
      @show-alert="showAlertMessage"
    />

    <EditEmployeeForm 
      v-if="isEditingEmployee"
      :employee="employeeToEdit"
      @close="cancelEditEmployee"
      @employee-updated="handleEmployeeUpdated"
      @show-alert="showAlertMessage"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useEmployeeStore } from '@/store/modules/employees'
import { useAuthStore } from '@/store/modules/auth'
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import AddEmployeeForm from '@/components/admin/AddEmployeeForm.vue'
import EditEmployeeForm from '@/components/admin/EditEmployeeForm.vue'
import Alert from '@/components/common/Alert.vue'

const employeeStore = useEmployeeStore()
const authStore = useAuthStore()
const searchQuery = ref('')
const isAddingEmployee = ref(false)
const isEditingEmployee = ref(false)
const employeeToEdit = ref(null)

const showAlert = ref(false)
const alertType = ref('success')
const alertMessage = ref('')

const isAdmin = computed(() => authStore.user && authStore.user.role === 'admin')

const sortedEmployees = computed(() => {
  const employees = employeeStore.filteredEmployees
  return employees.sort((a, b) => {
    if (a.role === 'admin') return -1
    if (b.role === 'admin') return 1
    return 0
  })
})

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await employeeStore.fetchEmployees()
  }
})

watch(() => authStore.isAuthenticated, async (newValue) => {
  if (newValue) {
    await employeeStore.fetchEmployees()
  }
})

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    employeeStore.searchEmployees(searchQuery.value.trim())
  } else {
    employeeStore.fetchEmployees()
  }
}

const showAddEmployeeForm = () => {
  isAddingEmployee.value = true
}

const showEditEmployeeForm = (employee) => {
  employeeToEdit.value = { ...employee }
  isEditingEmployee.value = true
}

const cancelAddEmployee = () => {
  isAddingEmployee.value = false
}

const cancelEditEmployee = () => {
  isEditingEmployee.value = false
  employeeToEdit.value = null
}

const deleteEmployee = async (id) => {
  if (confirm('Are you sure you want to delete this employee?')) {
    await employeeStore.deleteEmployee(id)
    await employeeStore.fetchEmployees()
    showAlertMessage('Employee deleted successfully', 'success')
  }
}

const handleEmployeeAdded = async (newEmployee) => {
  await employeeStore.addEmployee(newEmployee)
  isAddingEmployee.value = false
  await employeeStore.fetchEmployees()
  showAlertMessage('Employee added successfully', 'success')
}

const handleEmployeeUpdated = async (updatedEmployee) => {
  await employeeStore.updateEmployee(updatedEmployee)
  isEditingEmployee.value = false
  employeeToEdit.value = null
  await employeeStore.fetchEmployees()
  showAlertMessage('Employee updated successfully', 'success')
}

const showAlertMessage = (message, type = 'success') => {
  if (typeof message === 'object' && message.message) {
    alertMessage.value = message.message
    alertType.value = message.type || type
  } else {
    alertMessage.value = message
    alertType.value = type
  }
  showAlert.value = true
  setTimeout(() => {
    showAlert.value = false
  }, 5000) // Hide the alert after 5 seconds
}
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



