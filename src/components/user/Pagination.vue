<template>
    <div class="bg-white border border-gray-200 rounded-lg p-4 mt-6">
      <div class="flex justify-between items-center">
        <p class="text-sm text-gray-600">
          Showing {{ startIndex }} to {{ endIndex }} of {{ totalItems }} items
        </p>
        <div class="flex items-center space-x-2">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
            :class="currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#FF9934] text-white hover:bg-[#FF8000]'"
          >
            Previous
          </button>
          <div class="flex space-x-1">
            <button
              v-for="page in displayedPages"
              :key="page"
              @click="changePage(page)"
              class="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
              :class="currentPage === page ? 'bg-[#FF9934] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'"
            >
              {{ page }}
            </button>
          </div>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
            :class="currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#FF9934] text-white hover:bg-[#FF8000]'"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    totalItems: {
      type: Number,
      required: true
    },
    itemsPerPage: {
      type: Number,
      required: true
    }
  });
  
  const emit = defineEmits(['page-change']);
  
  const displayedPages = computed(() => {
    const range = 2;
    const pages = [];
    for (let i = Math.max(1, props.currentPage - range); i <= Math.min(props.totalPages, props.currentPage + range); i++) {
      pages.push(i);
    }
    return pages;
  });
  
  const startIndex = computed(() => {
    return (props.currentPage - 1) * props.itemsPerPage + 1;
  });
  
  const endIndex = computed(() => {
    return Math.min(props.currentPage * props.itemsPerPage, props.totalItems);
  });
  
  const changePage = (page) => {
    if (page >= 1 && page <= props.totalPages) {
      emit('page-change', page);
    }
  };
  </script>
  
  