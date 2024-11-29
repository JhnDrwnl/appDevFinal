<!-- components/landing/PromotionalBanner -->
<template>
    <div class="bg-[#FF9B50] text-white py-3">
      <div class="max-w-7xl mx-auto px-8 flex justify-between items-center">
        <span class="text-sm">Buy now get 50% discount on first order.</span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const isVisible = ref(true)
  
  const closePromotion = () => {
    isVisible.value = false
    // You might want to emit an event here to inform the parent component
    // that the promotion has been closed
    // emit('close')
  }
  </script>
  
  