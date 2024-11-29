<!-- components/admin/AddCategory.vue -->
<template>
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-gray-900">Add Category</h2>
        <button
          @click="$emit('cancel')"
          class="text-sm text-[#0095FF] hover:text-[#0077CC]"
        >
          Back to Categories
        </button>
      </div>
  
      <form @submit.prevent="saveCategory" class="space-y-6">
        <div>
          <label for="categoryName" class="block text-sm font-medium text-gray-700">Category Name</label>
          <input
            id="categoryName"
            v-model="newCategory.name"
            type="text"
            required
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
          />
        </div>
  
        <div>
          <label for="parentCategory" class="block text-sm font-medium text-gray-700">Parent Category</label>
          <select
            id="parentCategory"
            v-model="newCategory.parentId"
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
          >
            <option :value="null">None (Top-level category)</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
  
        <div>
          <label for="categoryDescription" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="categoryDescription"
            v-model="newCategory.description"
            rows="3"
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
          ></textarea>
        </div>
  
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="$emit('cancel')"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-[#0095FF] text-white rounded-lg hover:bg-[#0077CC]"
          >
            Save Category
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const props = defineProps({
    categories: {
      type: Array,
      required: true
    }
  })
  
  const emit = defineEmits(['cancel', 'save'])
  
  const newCategory = ref({
    name: '',
    parentId: null,
    description: ''
  })
  
  const saveCategory = () => {
    emit('save', { ...newCategory.value })
    newCategory.value = { name: '', parentId: null, description: '' }
  }
  </script>