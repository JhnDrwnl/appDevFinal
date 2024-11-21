<!-- components/common/Alert.vue -->
<template>
    <div
      v-if="show"
      class="flex items-center p-4 mb-4 rounded-lg transition-all duration-300"
      :class="[typeClasses[type]]"
      role="alert"
    >
      <!-- Icons -->
      <div v-if="type === 'error'" class="flex-shrink-0 w-5 h-5 mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      </div>
      <div v-else-if="type === 'warning'" class="flex-shrink-0 w-5 h-5 mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
      </div>
      <div v-else-if="type === 'info'" class="flex-shrink-0 w-5 h-5 mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      </div>
      <div v-else-if="type === 'success'" class="flex-shrink-0 w-5 h-5 mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
  
      <!-- Content -->
      <div class="ml-1 text-sm font-medium flex-grow">
        <slot></slot>
      </div>
  
      <!-- Action Button (optional) -->
      <button
        v-if="action"
        @click="$emit('action')"
        class="ml-4 text-sm font-medium underline focus:outline-none"
        :class="[actionClasses[type]]"
      >
        {{ action }}
      </button>
  
      <!-- Close Button (optional) -->
      <button
        v-if="dismissible"
        @click="dismiss"
        class="ml-4 inline-flex items-center justify-center w-5 h-5 focus:outline-none"
        :class="[closeButtonClasses[type]]"
      >
        <span class="sr-only">Close</span>
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const props = defineProps({
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['error', 'warning', 'info', 'success'].includes(value)
    },
    action: {
      type: String,
      default: ''
    },
    dismissible: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Boolean,
      default: true
    }
  })
  
  const emit = defineEmits(['update:modelValue', 'action'])
  
  const show = ref(props.modelValue)
  
  const typeClasses = {
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800'
  }
  
  const actionClasses = {
    error: 'text-red-800 hover:text-red-900',
    warning: 'text-yellow-800 hover:text-yellow-900',
    info: 'text-blue-800 hover:text-blue-900',
    success: 'text-green-800 hover:text-green-900'
  }
  
  const closeButtonClasses = {
    error: 'text-red-700 hover:text-red-900',
    warning: 'text-yellow-700 hover:text-yellow-900',
    info: 'text-blue-700 hover:text-blue-900',
    success: 'text-green-700 hover:text-green-900'
  }
  
  const dismiss = () => {
    show.value = false
    emit('update:modelValue', false)
  }
  </script>