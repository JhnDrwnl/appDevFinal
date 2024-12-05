<!-- components/landing/ProductListControls.vue -->
<template>
  <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
    <div class="flex space-x-2">
      <button @click="toggleView('list')" class="p-2 hover:bg-[#FF9934] hover:text-white rounded transition-colors duration-200" :class="{ 'bg-[#FF9934] text-white': view === 'list' }">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
        </svg>
      </button>
      <button @click="toggleView('grid')" class="p-2 hover:bg-[#FF9934] hover:text-white rounded transition-colors duration-200" :class="{ 'bg-[#FF9934] text-white': view === 'grid' }">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
      <span class="text-sm text-gray-500">Product Compare ({{ compareCount }})</span>
    </div>
    <div class="flex items-center space-x-4">
      <div class="flex items-center">
        <span class="text-sm mr-2">Sort By:</span>
        <select v-model="sortBy" @change="updateSort" class="border border-gray-300 rounded px-2 py-1 text-sm focus:border-[#FF9934] focus:ring-[#FF9934]">
          <option value="default">Default</option>
          <option value="name_asc">Name (A - Z)</option>
          <option value="name_desc">Name (Z - A)</option>
          <option value="price_asc">Price (Low > High)</option>
          <option value="price_desc">Price (High > Low)</option>
        </select>
      </div>
      <div class="flex items-center">
        <span class="text-sm mr-2">Show:</span>
        <select v-model="itemsPerPage" @change="updateItemsPerPage" class="border border-gray-300 rounded px-2 py-1 text-sm focus:border-[#FF9934] focus:ring-[#FF9934]">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const sortBy = ref('default');
const itemsPerPage = ref(10);
const view = ref('grid');
const compareCount = ref(0);

const emit = defineEmits(['update-items-per-page', 'update-sort', 'update-view']);

const updateItemsPerPage = () => {
  emit('update-items-per-page', itemsPerPage.value);
};

const updateSort = () => {
  emit('update-sort', sortBy.value);
};

const toggleView = (newView) => {
  view.value = newView;
  emit('update-view', newView);
};
</script>