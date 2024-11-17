<template>
  <div class="px-6 lg:px-8 py-4">
    <div class="max-w-7xl mx-auto w-full">
      <div class="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 class="text-2xl font-semibold text-gray-900">{{ title }}</h1>
          
          <!-- Breadcrumb navigation -->
          <nav class="flex mt-3 sm:mt-0" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
              <li>
                <router-link 
                  to="/admin/" 
                  class="text-sm text-gray-500 hover:text-[#0095FF] transition-colors duration-200"
                  @click="resetIconRotation"
                >
                  Home
                </router-link>
              </li>
              <li class="flex items-center">
                <transition name="rotate" mode="out-in">
                  <svg 
                    :key="iconRotation"
                    class="w-5 h-5 text-gray-400 transition-transform duration-300" 
                    :class="{ 'rotate-180': iconRotation }"
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fill-rule="evenodd" 
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                      clip-rule="evenodd"
                    />
                  </svg>
                </transition>
                <span class="text-sm text-gray-700 ml-2">{{ title }}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title: {
    type: String,
    required: true
  }
})

const iconRotation = ref(false)

const resetIconRotation = () => {
  iconRotation.value = true
  setTimeout(() => {
    iconRotation.value = false
  }, 300)
}
</script>

<style scoped>
.rotate-enter-active,
.rotate-leave-active {
  transition: transform 0.3s ease-out;
}

.rotate-enter-from,
.rotate-leave-to {
  transform: rotate(-180deg);
}

.rotate-enter-to,
.rotate-leave-from {
  transform: rotate(0);
}
</style>