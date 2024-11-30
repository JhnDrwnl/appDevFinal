<!-- views/admin/CategoryList.vue -->
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
              placeholder="Search Category"
              v-model="searchQuery"
              class="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
            />
            <span class="absolute left-3 top-2.5 text-gray-400">
              <MagnifyingGlassIcon class="w-5 h-5" />
            </span>
          </div>
          <button
            @click="showAddCategory"
            class="bg-[#FF9934] text-white px-4 py-2 rounded-full hover:bg-[#E88820] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934]"
          >
            Add Category
          </button>
        </div>
  
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto relative">
            <table class="w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th @click="sort('name')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    Category Name
                    <ArrowsUpDownIcon v-if="sortColumn === 'name'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="inline-block w-4 h-4 ml-1" />
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent Category
                  </th>
                  <th @click="sort('productCount')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    Products Count
                    <ArrowsUpDownIcon v-if="sortColumn === 'productCount'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="inline-block w-4 h-4 ml-1" />
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="category in paginatedCategories" :key="category.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ getCategoryParentNames(category) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ category.productCount || 0 }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center space-x-2">
                      <button
                        @click="editCategory(category.id)"
                        class="text-green-600 hover:text-green-800 focus:outline-none"
                      >
                        <PencilSquareIcon class="h-5 w-5" />
                      </button>
                      <button
                        @click="confirmDeleteCategory(category.id)"
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
  
      <AddCategory 
        v-else-if="currentView === 'add'" 
        @cancel="showList" 
        @save="handleSaveCategory" 
        @created="handleCategoryCreated"
      />
  
      <EditCategory 
        v-else-if="currentView === 'edit'" 
        :category-id="selectedCategory.id" 
        @cancel="showList" 
        @save="handleUpdateCategory" 
      />
  
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3 text-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Confirm Deletion</h3>
            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-gray-500">
                Are you sure you want to delete this category? This action cannot be undone.
              </p>
            </div>
            <div class="items-center px-4 py-3">
              <button
                @click="deleteCategory"
                class="px-4 py-2 bg-red-600 text-white text-base font-medium rounded w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
              >
                Delete
              </button>
              <button
                @click="cancelDelete"
                class="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded w-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
  import { 
    MagnifyingGlassIcon, 
    ArrowsUpDownIcon, 
    PencilSquareIcon, 
    TrashIcon,
    ChevronLeftIcon,
    ChevronRightIcon
  } from '@heroicons/vue/24/outline'
  import AddCategory from '@/components/admin/AddCategory.vue'
  import EditCategory from '@/components/admin/EditCategory.vue'
  import Alert from '@/components/common/Alert.vue'
  import { useCategoryStore } from '@/store/modules/categories'
  
  const categoryStore = useCategoryStore()
  const currentView = ref('list')
  const searchQuery = ref('')
  const selectedCategory = ref(null)
  const showAlert = ref(false)
  const alertType = ref('')
  const alertMessage = ref('')
  const showDeleteModal = ref(false)
  const categoryToDelete = ref(null)
  
  const sortColumn = ref('name')
  const sortDirection = ref('asc')
  const currentPage = ref(1)
  const rowsPerPage = ref(10)
  
  onMounted(async () => {
    await categoryStore.fetchCategories()
  })
  
  const categories = computed(() => categoryStore.categories)
  
  const filteredCategories = computed(() => {
    return categories.value.filter(category =>
      category.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })
  
  const sortedCategories = computed(() => {
    return [...filteredCategories.value].sort((a, b) => {
      let modifier = sortDirection.value === 'asc' ? 1 : -1
      if (a[sortColumn.value] < b[sortColumn.value]) return -1 * modifier
      if (a[sortColumn.value] > b[sortColumn.value]) return 1 * modifier
      return 0
    })
  })
  
  const totalPages = computed(() => Math.ceil(sortedCategories.value.length / rowsPerPage.value))
  
  const paginatedCategories = computed(() => {
    const start = (currentPage.value - 1) * rowsPerPage.value
    const end = start + rowsPerPage.value
    return sortedCategories.value.slice(start, end)
  })
  
  const showAddCategory = () => {
    currentView.value = 'add'
    categoryStore.clearError()
  }
  
  const showList = () => {
    currentView.value = 'list'
    selectedCategory.value = null
    categoryStore.clearError()
  }
  
  const editCategory = (categoryId) => {
    selectedCategory.value = categoryStore.getCategoryById(categoryId)
    currentView.value = 'edit'
    categoryStore.clearError()
  }
  
  const confirmDeleteCategory = (categoryId) => {
    categoryToDelete.value = categoryId
    showDeleteModal.value = true
  }
  
  const deleteCategory = async () => {
    if (categoryToDelete.value) {
      const result = await categoryStore.deleteCategory(categoryToDelete.value)
      if (result.success) {
        showAlertWithTimeout('success', 'Category deleted successfully')
        await categoryStore.fetchCategories()
      } else {
        showAlertWithTimeout('error', `Error deleting category: ${result.error}`)
      }
      showDeleteModal.value = false
      categoryToDelete.value = null
    }
  }
  
  const cancelDelete = () => {
    showDeleteModal.value = false
    categoryToDelete.value = null
  }
  
  const handleSaveCategory = async (newCategory) => {
    const result = await categoryStore.addCategory(newCategory)
    if (result.success) {
      showAlertWithTimeout('success', 'Category added successfully')
      await categoryStore.fetchCategories()
      showList()
    } else {
      showAlertWithTimeout('error', `Error adding category: ${result.error}`)
    }
  }
  
  const handleCategoryCreated = (newCategory) => {
    showAlertWithTimeout('success', `Category "${newCategory.name}" added successfully`)
    showList()
  }
  
  const handleUpdateCategory = async (updatedCategory) => {
    const result = await categoryStore.updateCategory(updatedCategory.id, updatedCategory)
    if (result.success) {
      showAlertWithTimeout('success', 'Category updated successfully')
      await categoryStore.fetchCategories()
      showList()
    } else {
      showAlertWithTimeout('error', `Error updating category: ${result.error}`)
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
  
  const hideAlert = () => {
    showAlert.value = false
  }
  
  const showAlertWithTimeout = (type, message) => {
    showAlert.value = true
    alertType.value = type
    alertMessage.value = message
    setTimeout(hideAlert, 3000)
  }
  
  const getCategoryParentNames = (category) => {
    if (!category.parentIds || category.parentIds.length === 0) return 'Top-level Category';
    
    const parentNames = category.parentIds
      .map(parentId => {
        const parentCategory = categories.value.find(c => c.id === parentId);
        return parentCategory ? parentCategory.name : 'Unknown';
      })
      .filter(Boolean); 
    
    return parentNames.length > 0 ? parentNames.join(', ') : 'Unknown';
  };
  </script>
  
  