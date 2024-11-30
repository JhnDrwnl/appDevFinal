<!-- components/admin/Category.vue -->
<template>
    <div>
      <h2 class="text-2xl font-semibold text-gray-900 mb-6">Edit Category</h2>
  
      <form @submit.prevent="updateCategory" class="space-y-6">
        <div>
          <label for="categoryName" class="block text-sm font-medium text-gray-700">Category Name</label>
          <input
            id="categoryName"
            v-model="editedCategory.name"
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
              <span class="ml-2 font-medium">{{ selectedParentNames }}</span>
            </div>
            <div class="tree-container font-mono max-h-60 overflow-y-auto">
              <TreeNode
                v-for="category in rootCategories"
                :key="category.id"
                :node="category"
                :level="0"
                :selected-ids="editedCategory.parentIds"
                :view-only="false"
                :disabled-id="editedCategory.id"
                @select-parent="toggleParent"
              />
            </div>
          </div>
        </div>
  
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="$emit('cancel')"
            class="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-[#FF9934] text-white rounded-full hover:bg-[#E88820] transition-colors duration-200"
          >
            Update Category
          </button>
        </div>
      </form>
  
      <div v-if="error" class="mt-4 text-red-600">
        {{ error }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useCategoryStore } from '@/store/modules/categories'
  import TreeNode from '@/components/admin/TreeNode.vue'
  
  const props = defineProps({
    categoryId: {
      type: String,
      required: true
    }
  })
  
  const emit = defineEmits(['cancel', 'save'])
  
  const categoryStore = useCategoryStore()
  
  const editedCategory = ref({
    id: '',
    name: '',
    parentIds: []
  })
  
  const error = computed(() => categoryStore.error)
  
  const categories = computed(() => categoryStore.categories)
  
  const rootCategories = computed(() => categoryStore.getRootCategories)
  
  const selectedParentNames = computed(() => {
    if (editedCategory.value.parentIds.length === 0) return 'None (Top-level category)'
    return editedCategory.value.parentIds
      .map(id => categories.value.find(cat => cat.id === id)?.name)
      .filter(Boolean)
      .join(', ')
  })
  
  onMounted(async () => {
    try {
      const category = await categoryStore.getCategoryById(props.categoryId)
      if (category) {
        editedCategory.value = { 
          ...category,
          parentIds: category.parentIds || []
        }
      } else {
        error.value = 'Category not found'
      }
    } catch (err) {
      console.error('Error fetching category:', err)
      error.value = 'Failed to load category'
    }
  })
  
  const updateCategory = async () => {
    try {
      const result = await categoryStore.updateCategory(editedCategory.value.id, editedCategory.value)
      if (result.success) {
        emit('save', editedCategory.value)
      } else {
        error.value = result.error || 'Failed to update category'
      }
    } catch (err) {
      console.error('Error updating category:', err)
      error.value = 'An unexpected error occurred'
    }
  }
  
  const toggleParent = (categoryId) => {
    const index = editedCategory.value.parentIds.indexOf(categoryId)
    if (index === -1) {
      editedCategory.value.parentIds.push(categoryId)
    } else {
      editedCategory.value.parentIds.splice(index, 1)
    }
  }
  </script>
  
  <style scoped>
  .tree-container {
    user-select: none;
  }
  </style>
  
  