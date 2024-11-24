<template>
    <div class="bg-[#FF9B50] text-white py-3">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-sm mb-4 md:mb-0">
            Powered By OpenCart Supreme Agrivet © {{ currentYear }}
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  
  const currentYear = ref(new Date().getFullYear())
  
  onMounted(() => {
    // You can add any initialization logic here if needed
  })
  </script>
  