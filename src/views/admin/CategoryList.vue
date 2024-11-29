<!-- views/admin/CategoryList.vue -->
<template>
    <div class="max-w-7xl mx-auto w-full">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div class="p-6 lg:p-8">
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-semibold text-gray-900">Categories</h1>
            <button
              @click="showAddCategory"
              class="bg-[#0095FF] text-white px-4 py-2 rounded-lg hover:bg-[#0077CC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0095FF]"
            >
              Add Category
            </button>
          </div>
  
          <div v-if="currentView === 'list'">
            <div class="mb-4">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search categories"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
              />
            </div>
  
            <v3-tree-vue
              :items="treeData"
              :options="treeOptions"
              @node-click="handleNodeClick"
              @node-toggle="handleNodeToggle"
            >
              <template #default="{ node, isExpanded }">
                <div class="flex items-center justify-between w-full py-2">
                  <div class="flex items-center">
                    <span v-if="node.children && node.children.length" class="mr-2">
                      <ChevronRight v-if="!isExpanded" class="w-4 h-4" />
                      <ChevronDown v-else class="w-4 h-4" />
                    </span>
                    <span>{{ node.text }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button
                      @click.stop="editCategory(node)"
                      class="text-gray-600 hover:text-gray-900"
                    >
                      <Edit2 class="w-4 h-4" />
                    </button>
                    <button
                      @click.stop="deleteCategory(node)"
                      class="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </template>
            </v3-tree-vue>
          </div>
  
          <AddCategory
            v-else-if="currentView === 'add'"
            :categories="categories"
            @cancel="showList"
            @save="handleSaveCategory"
          />
  
          <EditCategory
            v-else-if="currentView === 'edit'"
            :category="selectedCategory"
            :categories="categories"
            @cancel="showList"
            @save="handleUpdateCategory"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import V3TreeVue from 'vue3-tree-vue'
  import { ChevronRight, ChevronDown, Edit2, Trash2 } from 'lucide-vue-next'
  import AddCategory from '@/components/admin/AddCategory.vue'
  import EditCategory from '@/components/admin/EditCategory.vue'
  
  const currentView = ref('list')
  const searchQuery = ref('')
  const selectedCategory = ref(null)
  
  const categories = ref([
    { id: 1, name: 'Electronics', parentId: null },
    { id: 2, name: 'Computers', parentId: 1 },
    { id: 3, name: 'Laptops', parentId: 2 },
    { id: 4, name: 'Desktops', parentId: 2 },
    { id: 5, name: 'Smartphones', parentId: 1 },
    { id: 6, name: 'Clothing', parentId: null },
    { id: 7, name: 'Men', parentId: 6 },
    { id: 8, name: 'Women', parentId: 6 },
  ])
  
  const treeData = computed(() => {
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
          id: item.id,
          text: item.name,
          children: buildTree(items, item.id)
        }))
    }
  
    return buildTree(categories.value.filter(category => 
      category.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    ))
  })
  
  const treeOptions = {
    checkbox: false,
    expandOnClick: false,
  }
  
  const showAddCategory = () => {
    currentView.value = 'add'
  }
  
  const showList = () => {
    currentView.value = 'list'
    selectedCategory.value = null
  }
  
  const editCategory = (node) => {
    selectedCategory.value = categories.value.find(c => c.id === node.id)
    currentView.value = 'edit'
  }
  
  const deleteCategory = async (node) => {
    if (confirm(`Are you sure you want to delete the category "${node.text}" and all its subcategories?`)) {
      const deleteRecursive = (categoryId) => {
        categories.value = categories.value.filter(c => c.id !== categoryId)
        const childCategories = categories.value.filter(c => c.parentId === categoryId)
        childCategories.forEach(child => deleteRecursive(child.id))
      }
      deleteRecursive(node.id)
    }
  }
  
  const handleNodeClick = (node) => {
    console.log('Node clicked:', node)
  }
  
  const handleNodeToggle = (node, isExpanded) => {
    console.log('Node toggled:', node, 'Expanded:', isExpanded)
  }
  
  const handleSaveCategory = (newCategory) => {
    newCategory.id = Math.max(...categories.value.map(c => c.id)) + 1
    categories.value.push(newCategory)
    showList()
  }
  
  const handleUpdateCategory = (updatedCategory) => {
    const index = categories.value.findIndex(c => c.id === updatedCategory.id)
    if (index !== -1) {
      categories.value[index] = updatedCategory
    }
    showList()
  }
  </script>