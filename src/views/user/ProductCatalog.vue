<template>
    <div>
      <h1 class="text-2xl font-bold mb-4">Product Catalog</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import ProductCard from '@/components/user/ProductCard.vue';
  
  const products = ref([
    { id: 1, name: 'Product 1', price: 19.99, image: '/placeholder.svg?height=200&width=200' },
    { id: 2, name: 'Product 2', price: 29.99, image: '/placeholder.svg?height=200&width=200' },
    { id: 3, name: 'Product 3', price: 39.99, image: '/placeholder.svg?height=200&width=200' },
  ]);
  </script>