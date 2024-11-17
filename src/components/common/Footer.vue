<template>
  <footer class="px-6 py-6 lg:px-8">
    <div class="max-w-7xl mx-auto w-full">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div class="flex flex-col sm:flex-row items-center justify-between h-full px-6 py-4">
          <p class="text-sm text-gray-500 mb-4 sm:mb-0">
            © {{ currentYear }} Darwin Appdev. All rights reserved.
          </p>
          <div class="flex items-center space-x-4">
            <a href="#" class="text-sm text-gray-500 hover:text-[#0095FF] transition-colors duration-200">Privacy Policy</a>
            <a href="#" class="text-sm text-gray-500 hover:text-[#0095FF] transition-colors duration-200">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>