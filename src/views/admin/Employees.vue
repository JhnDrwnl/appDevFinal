<!-- views/admin/Employees.vue -->
<template>
  <div class="max-w-7xl mx-auto w-full">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200">
      <Alert
        v-if="showAlert"
        :type="alertType"
        :dismissible="true"
        v-model="showAlert"
        class="m-6 lg:m-8"
      >
        {{ alertMessage }}
      </Alert>
      
      <transition name="fade" mode="out-in">
        <div v-if="!isAddingEmployee && !isEditingEmployee" class="p-6 lg:p-8" key="employee-list">
          <div class="flex justify-end items-center mb-6">
            <div class="flex items-center space-x-4">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search employees"
                @input="handleSearch"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
              />
              <button
                v-if="isAdmin"
                @click="showAddEmployeeForm"
                class="bg-[#0095FF] text-white px-4 py-2 rounded-lg hover:bg-[#0077CC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0095FF]"
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

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th v-if="isAdmin" class="px-6 py-3 w-px"></th>
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
                  <td v-if="isAdmin && employee.role !== 'admin'" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="relative">
                      <button @click="toggleActions(employee.id)" class="text-gray-400 hover:text-gray-500">
                        <EllipsisVerticalIcon class="h-5 w-5" />
                      </button>
                      <div v-if="activeEmployeeId === employee.id" 
                           class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-10" 
                           role="menu" 
                           aria-orientation="vertical" 
                           aria-labelledby="options-menu">
                        <div class="py-1" role="none">
                          <button @click="showEditEmployeeForm(employee)" class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full" role="menuitem">
                            <PencilSquareIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                            Edit
                          </button>
                          <button @click="deleteEmployee(employee.id)" class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full" role="menuitem">
                            <TrashIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <AddEmployeeForm 
          v-else-if="isAddingEmployee"
          key="add-employee-form"
          @close="cancelAddEmployee"
          @employee-added="handleEmployeeAdded"
        />

        <EditEmployeeForm 
          v-else-if="isEditingEmployee"
          key="edit-employee-form"
          :employee="employeeToEdit"
          @close="cancelEditEmployee"
          @employee-updated="handleEmployeeUpdated"
        />
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useEmployeeStore } from '@/store/modules/employees'
import { useAuthStore } from '@/store/modules/auth'
import { EllipsisVerticalIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import AddEmployeeForm from '@/components/admin/AddEmployeeForm.vue'
import EditEmployeeForm from '@/components/admin/EditEmployeeForm.vue'
import Alert from '@/components/common/Alert.vue'

const employeeStore = useEmployeeStore()
const authStore = useAuthStore()
const searchQuery = ref('')
const isAddingEmployee = ref(false)
const isEditingEmployee = ref(false)
const activeEmployeeId = ref(null)
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

const toggleActions = (id) => {
  activeEmployeeId.value = activeEmployeeId.value === id ? null : id
}

const showAddEmployeeForm = () => {
  isAddingEmployee.value = true
}

const showEditEmployeeForm = (employee) => {
  employeeToEdit.value = { ...employee }
  isEditingEmployee.value = true
  activeEmployeeId.value = null
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
    activeEmployeeId.value = null
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
  alertMessage.value = message
  alertType.value = type
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