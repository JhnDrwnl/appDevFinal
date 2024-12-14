<!-- views/user/Home.vue -->
<template>
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
    <!-- Sidebar -->
    <div class="lg:col-span-1 space-y-6">
      <Categories :selectedCategoryId="selectedCategoryId" />
      <RefineSearch @apply-filters="applyFilters" />
      <BestSellers />
      <!-- <LatestProducts /> -->
    </div>

    <!-- Main Content Area -->
    <div class="lg:col-span-3">
      <div class="space-y-6">
        <!-- Product Header -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h1 class="text-2xl font-bold mb-4">{{ selectedCategory ? selectedCategory.name : 'All Products' }}</h1>
          <p class="text-gray-600">
            {{ selectedCategory ? selectedCategory.description : 'Browse our wide range of products.' }}
          </p>
        </div>

        <!-- Product Controls -->
        <div class="bg-white border border-gray-200 rounded-lg p-4">
          <ProductListControls 
            @update-items-per-page="updateItemsPerPage"
            @update-sort="updateSort"
            @update-view="updateView"
          />
        </div>

        <!-- Product Grid -->
        <div>
          <ProductCards 
            ref="productCards"
            :categoryId="selectedCategoryId" 
            :filters="filters"
            :itemsPerPage="itemsPerPage"
            :currentPage="currentPage"
            :sortBy="sortBy"
            :view="view"
          />
        </div>

        <!-- Pagination -->
        <Pagination 
          :currentPage="currentPage"
          :totalPages="totalPages"
          :totalItems="totalItems"
          :itemsPerPage="itemsPerPage"
          @page-change="changePage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCategoryStore } from '@/store/modules/categories'
import Categories from '@/components/user/Categories.vue'
// import LatestProducts from '@/components/landing/LatestProducts.vue'
import RefineSearch from '@/components/user/RefineSearch.vue'
import ProductListControls from '@/components/user/ProductListControls.vue'
import ProductCards from '@/components/user/ProductCards.vue'
import Pagination from '@/components/user/Pagination.vue'

const route = useRoute()
const categoryStore = useCategoryStore()

const selectedCategoryId = ref(null)
const filters = ref({})
const itemsPerPage = ref(10)
const currentPage = ref(1)
const sortBy = ref('default')
const view = ref('grid')
const productCards = ref(null)

const selectedCategory = computed(() => {
  if (selectedCategoryId.value) {
    return categoryStore.getCategoryById(selectedCategoryId.value)
  }
  return null
})

const totalPages = computed(() => {
  return productCards.value ? productCards.value.totalPages : 1
})

const totalItems = computed(() => {
  return productCards.value ? productCards.value.filteredProducts.length : 0
})

watch(() => route.query.category, (newCategoryId) => {
  selectedCategoryId.value = newCategoryId || null
  currentPage.value = 1 // Reset to first page when category changes
})

const applyFilters = (newFilters) => {
  filters.value = newFilters
  currentPage.value = 1 // Reset to first page when filters change
}

const updateItemsPerPage = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage
  currentPage.value = 1 // Reset to first page when items per page changes
}

const updateSort = (newSortBy) => {
  sortBy.value = newSortBy
  currentPage.value = 1 // Reset to first page when sort changes
}

const updateView = (newView) => {
  view.value = newView
}

const changePage = (newPage) => {
  currentPage.value = newPage
}

// Fetch categories when the component is mounted
categoryStore.fetchCategories()
</script>