<template>
    <div v-if="product">
      <h1 class="text-2xl font-bold mb-4">{{ product.name }}</h1>
      <div class="flex flex-col md:flex-row gap-8">
        <img :src="product.image" :alt="product.name" class="w-full md:w-1/2 rounded-lg shadow-md">
        <div class="space-y-4">
          <p class="text-gray-600">{{ product.description }}</p>
          <p class="text-2xl font-bold">${{ product.price.toFixed(2) }}</p>
          <button @click="addToCart" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Add to Cart</button>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Loading product details...</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  
  const route = useRoute();
  const product = ref(null);
  
  onMounted(() => {
    // Simulate fetching product details
    // In a real application, you would fetch this data from your API
    product.value = {
      id: parseInt(route.params.id),
      name: `Product ${route.params.id}`,
      description: 'This is a sample product description.',
      price: 29.99,
      image: '/placeholder.svg?height=400&width=400'
    };
  });
  
  const addToCart = () => {
    // Implement add to cart logic here
    console.log('Added to cart:', product.value);
  };
  </script>