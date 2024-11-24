<template>
    <transition name="fade">
      <button 
        v-if="showButton"
        @click="scrollToTop"
        class="fixed bottom-8 right-8 bg-[#FF9934] text-white p-3 rounded-full shadow-lg hover:bg-[#FF8000] transition-colors"
        aria-label="Scroll to top"
      >
        <ArrowUpIcon class="w-6 h-6" />
      </button>
    </transition>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { ArrowUpIcon } from 'lucide-vue-next'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const showButton = ref(false)
  
  const checkScroll = () => {
    showButton.value = window.pageYOffset > 300
  }
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    router.push('/')
  }
  
  onMounted(() => {
    window.addEventListener('scroll', checkScroll)
  })
  
  onUnmounted(() => {
    window.removeEventListener('scroll', checkScroll)
  })
  </script>
  
  <style scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
  </style>
  
  