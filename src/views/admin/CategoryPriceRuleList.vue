<!-- views/admin/CategoryPriceRuleList.vue -->
<template>
  <div class="w-full">
    <Alert 
      v-if="showAlert" 
      :type="alertType" 
      :dismissible="true" 
      @update:modelValue="showAlert = $event"
    >
      {{ alertMessage }}
    </Alert>

    <div v-if="currentView === 'list'">
      <div class="flex items-center justify-between mb-6">
        <div class="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search Category Price Rules"
            v-model="searchQuery"
            class="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
          />
          <span class="absolute left-3 top-2.5 text-gray-400">
            <MagnifyingGlassIcon class="w-5 h-5" />
          </span>
        </div>
        <button
          @click="showAddCategoryPriceRule"
          class="bg-[#FF9934] text-white px-4 py-2 rounded-full hover:bg-[#E88820] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934]"
        >
          Add Category Price Rule
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto relative">
          <table class="w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price Rule
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="rule in paginatedCategoryPriceRules" :key="rule.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="text-sm font-medium text-gray-900">{{ rule.categoryName }}</div>
                    <span :class="getStatusClass(rule)" class="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ getStatus(rule) }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ rule.priceRuleName }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ formatPriceRuleValue(rule) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="editCategoryPriceRule(rule)"
                      class="text-green-600 hover:text-green-800 focus:outline-none"
                    >
                      <PencilSquareIcon class="h-5 w-5" />
                    </button>
                    <button
                      @click="confirmDeleteCategoryPriceRule(rule)"
                      class="text-red-600 hover:text-red-800 focus:outline-none"
                    >
                      <TrashIcon class="h-5 w-5" />
                    </button>
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

    <AddCategoryPriceRule
      v-else-if="currentView === 'add'"
      @cancel="showList"
      @save="handleSaveCategoryPriceRule"
    />

    <EditCategoryPriceRule
      v-else-if="currentView === 'edit'"
      :categoryPriceRule="selectedCategoryPriceRule"
      @cancel="showList"
      @save="handleUpdateCategoryPriceRule"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Confirm Deletion</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Are you sure you want to delete this category price rule? This action cannot be undone.
            </p>
          </div>
          <div class="items-center px-4 py-3">
            <button
              @click="deleteCategoryPriceRule"
              class="px-4 py-2 bg-[#FF9934] text-white text-base font-medium rounded-full w-full shadow-sm hover:bg-[#E88820] focus:outline-none focus:ring-2 focus:ring-[#FF9934] mb-2"
            >
              Delete
            </button>
            <button
              @click="cancelDelete"
              class="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-full w-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCategoryPriceRuleStore } from '@/store/modules/categoryPriceRules'
import { usePriceRuleStore } from '@/store/modules/priceRules'
import AddCategoryPriceRule from '@/components/admin/AddCategoryPriceRule.vue'
import EditCategoryPriceRule from '@/components/admin/EditCategoryPriceRule.vue'
import Alert from '@/components/common/Alert.vue'
import { 
  MagnifyingGlassIcon, 
  PencilSquareIcon, 
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

const categoryPriceRuleStore = useCategoryPriceRuleStore()
const priceRuleStore = usePriceRuleStore()
const currentView = ref('list')
const searchQuery = ref('')
const selectedCategoryPriceRule = ref(null)
const showAlert = ref(false)
const alertType = ref('')
const alertMessage = ref('')
const showDeleteModal = ref(false)
const categoryPriceRuleToDelete = ref(null)

const currentPage = ref(1)
const rowsPerPage = ref(10)

onMounted(async () => {
  await categoryPriceRuleStore.fetchCategoryPriceRules()
  await priceRuleStore.fetchPriceRules()
})

const categoryPriceRules = computed(() => categoryPriceRuleStore.categoryPriceRules)

const filteredCategoryPriceRules = computed(() => {
  return categoryPriceRules.value.filter(rule =>
    rule.categoryName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    rule.priceRuleName.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalPages = computed(() => Math.ceil(filteredCategoryPriceRules.value.length / rowsPerPage.value))

const paginatedCategoryPriceRules = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return filteredCategoryPriceRules.value.slice(start, end)
})

const showAddCategoryPriceRule = () => {
  currentView.value = 'add'
  categoryPriceRuleStore.clearError()
}

const showList = () => {
  currentView.value = 'list'
  selectedCategoryPriceRule.value = null
  categoryPriceRuleStore.clearError()
}

const editCategoryPriceRule = (rule) => {
  selectedCategoryPriceRule.value = { ...rule }
  currentView.value = 'edit'
  categoryPriceRuleStore.clearError()
}

const confirmDeleteCategoryPriceRule = (rule) => {
  categoryPriceRuleToDelete.value = { id: rule.id, categoryId: rule.categoryId }
  showDeleteModal.value = true
}

const deleteCategoryPriceRule = async () => {
  if (categoryPriceRuleToDelete.value && categoryPriceRuleToDelete.value.id && categoryPriceRuleToDelete.value.categoryId) {
    const result = await categoryPriceRuleStore.deleteCategoryPriceRule(
      categoryPriceRuleToDelete.value.id,
      categoryPriceRuleToDelete.value.categoryId
    )
    if (result.success) {
      showAlertWithTimeout('success', 'Category price rule deleted successfully')
    } else {
      showAlertWithTimeout('error', `Error deleting category price rule: ${result.error}`)
    }
    showDeleteModal.value = false
    categoryPriceRuleToDelete.value = null
  } else {
    showAlertWithTimeout('error', 'Invalid category price rule data for deletion')
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  categoryPriceRuleToDelete.value = null
}

const handleSaveCategoryPriceRule = async (newRule) => {
  try {
    const result = await categoryPriceRuleStore.addCategoryPriceRule(newRule)
    if (result.success) {
      showAlertWithTimeout('success', 'Category price rule added successfully')
      showList()
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    showAlertWithTimeout('error', `Error adding category price rule: ${error.message}`)
  }
}

const handleUpdateCategoryPriceRule = async (updatedRule) => {
  try {
    const result = await categoryPriceRuleStore.updateCategoryPriceRule(updatedRule.id, updatedRule)
    if (result.success) {
      showAlertWithTimeout('success', 'Category price rule updated successfully')
      showList()
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    showAlertWithTimeout('error', `Error updating category price rule: ${error.message}`)
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

watch(searchQuery, () => {
  currentPage.value = 1
})

watch(rowsPerPage, () => {
  currentPage.value = 1
})

const showAlertWithTimeout = (type, message) => {
  showAlert.value = true
  alertType.value = type
  alertMessage.value = message
  setTimeout(() => {
    showAlert.value = false
  }, 3000)
}

const getStatus = (rule) => {
  const now = new Date()
  const priceRule = priceRuleStore.getPriceRuleById(rule.priceRuleId)
  if (!priceRule) return 'Unknown'

  if (priceRule.startDate > now) {
    return 'Scheduled'
  } else if (priceRule.endDate && priceRule.endDate < now) {
    return 'Ended'
  } else if (priceRule.endDate && priceRule.endDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
    return 'Ending Soon'
  } else {
    return 'Active'
  }
}

const getStatusClass = (rule) => {
  const status = getStatus(rule)
  switch (status) {
    case 'Scheduled':
      return 'bg-blue-100 text-blue-800'
    case 'Ended':
      return 'bg-gray-100 text-gray-800'
    case 'Ending Soon':
      return 'bg-yellow-100 text-yellow-800'
    case 'Active':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatPriceRuleValue = (rule) => {
  if (!rule.priceRuleValue) return 'N/A'

  const priceRule = priceRuleStore.getPriceRuleById(rule.priceRuleId)
  if (!priceRule) return 'N/A'

  if (priceRule.type === 'percentage') {
    return `${rule.priceRuleValue}%`
  } else {
    return `₱${parseFloat(rule.priceRuleValue).toFixed(2)}`
  }
}
</script>

<style scoped>
.rounded-full {
  border-radius: 9999px;
}
</style>
