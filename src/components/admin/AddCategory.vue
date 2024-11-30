<!-- components/admin/AddCategory.vue -->
<template>
    <div>
      <h2 class="text-2xl font-semibold text-gray-900 mb-6">Add Category</h2>
  
      <form @submit.prevent="saveCategory" class="space-y-6">
        <div>
          <label for="categoryName" class="block text-sm font-medium text-gray-700">Category Name</label>
          <input
            id="categoryName"
            v-model="newCategory.name"
            type="text"
            required
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
            placeholder="Enter category name"
          />
        </div>
  
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Parent Categories</label>
          <div class="bg-white border border-gray-300 rounded-lg p-4">
            <div class="mb-3 p-2 bg-gray-50 border border-gray-200 rounded-md">
              <span class="text-sm text-gray-500">Selected Parents:</span>
              <span class="ml-2 font-medium">{{ selectedCategoryNames }}</span>
            </div>
            <div v-if="loading" class="text-center py-4">
              Loading categories...
            </div>
            <div v-else-if="error" class="text-center py-4 text-red-600">
              {{ error }}
            </div>
            <div v-else class="tree-container font-mono max-h-60 overflow-y-auto">
              <div v-if="categories.length === 0" class="text-center py-4 text-gray-500">
                No categories available
              </div>
              <TreeNode
                v-for="category in rootCategories"
                :key="category.id"
                :node="category"
                :level="0"
                :selected-ids="newCategory.parentIds"
                :disabled-id="null"
                :view-only="false"
                @select-parent="toggleParent"
              />
            </div>
          </div>
        </div>
  
        <div class="mt-6 flex justify-end space-x-3">
            <button
            @click="$emit('cancel')"
            class="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
            Cancel
            </button>
            <button
            @click="saveProduct"
            :disabled="isLoading"
            class="px-4 py-2 bg-[#FF9934] text-white rounded-full hover:bg-[#E08824] disabled:opacity-50 transition-colors duration-200"
            >
            {{ isLoading ? 'Saving...' : 'Save Changes' }}
            </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useCategoryStore } from '@/store/modules/categories'
  import TreeNode from './TreeNode.vue'
  
  const categoryStore = useCategoryStore()
  const emit = defineEmits(['cancel', 'save', 'created'])
  
  const newCategory = ref({
    name: '',
    parentIds: []
  })
  
  const categories = computed(() => categoryStore.categories)
  const loading = computed(() => categoryStore.loading)
  const error = computed(() => categoryStore.error)
  
  const rootCategories = computed(() => categoryStore.getRootCategories)
  
  const selectedCategoryNames = computed(() => {
    if (newCategory.value.parentIds.length === 0) return 'None (Top-level category)'
    return newCategory.value.parentIds
      .map(id => categories.value.find(c => c.id === id)?.name)
      .filter(Boolean)
      .join(', ')
  })
  
  const toggleParent = (categoryId) => {
    const index = newCategory.value.parentIds.indexOf(categoryId)
    if (index === -1) {
      newCategory.value.parentIds.push(categoryId)
    } else {
      newCategory.value.parentIds.splice(index, 1)
    }
  }
  
  const saveCategory = async () => {
    const result = await categoryStore.addCategory({
      name: newCategory.value.name,
      parentIds: newCategory.value.parentIds
    })
  
    if (result.success) {
      emit('created', result.category)
      newCategory.value = { name: '', parentIds: [] }
    }
  }
  
  onMounted(async () => {
    await categoryStore.fetchCategories()
  })
  </script>
  
  <style scoped>
  .tree-container {
    user-select: none;
  }
  </style>
  
  