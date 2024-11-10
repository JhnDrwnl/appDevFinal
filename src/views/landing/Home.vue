<template>
  <div>
    <Header />
    <main class="container mx-auto px-6 py-8">
      <h1 class="text-4xl font-bold text-center mb-8">Welcome to Poultry Paradise</h1>
      <p class="text-xl text-center mb-8">Your one-stop shop for all your poultry needs!</p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="(feature, index) in features" :key="index" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-semibold mb-4">{{ feature.title }}</h2>
          <p class="text-gray-600">{{ feature.description }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '@/components/landing/Header.vue'

const features = ref([
  {
    title: 'Wide Selection',
    description: 'Browse our extensive catalog of poultry products, from feed to equipment.'
  },
  {
    title: 'Expert Advice',
    description: 'Get guidance from our team of poultry experts to help you succeed.'
  },
  {
    title: 'Fast Shipping',
    description: 'Enjoy quick and reliable shipping on all your poultry supplies.'
  }
])
</script>