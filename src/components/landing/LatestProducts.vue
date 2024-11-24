<template>
    <div class="bg-white py-24">
      <div class="container mx-auto px-4">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-6 text-gray-800">Latest Products</h2>
          <p class="text-gray-600 leading-relaxed max-w-3xl mx-auto text-lg">
            Discover our newest selection of high-quality poultry products, from farm-fresh eggs to essential supplies.
          </p>
        </div>
  
        <!-- Products Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="product in products" :key="product.id" class="bg-white rounded-lg shadow-sm overflow-hidden group">
            <!-- Product Image Container -->
            <div class="relative aspect-square overflow-hidden">
              <!-- Sold Out Badge -->
              <div v-if="product.soldOut" class="absolute top-4 left-4 z-10">
                <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  SOLD OUT
                </span>
              </div>
              
              <!-- Action Buttons -->
              <div class="absolute right-4 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="bg-white p-2 rounded-full shadow-md hover:bg-[#FF9934] hover:text-white transition-colors">
                  <EyeIcon class="w-5 h-5" />
                </button>
                <button class="bg-white p-2 rounded-full shadow-md hover:bg-[#FF9934] hover:text-white transition-colors">
                  <HeartIcon class="w-5 h-5" />
                </button>
                <button class="bg-white p-2 rounded-full shadow-md hover:bg-[#FF9934] hover:text-white transition-colors">
                  <BarChart3Icon class="w-5 h-5" />
                </button>
              </div>
  
              <!-- Product Image -->
              <img 
                :src="product.image" 
                :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
  
            <!-- Product Info -->
            <div class="p-6">
              <!-- Rating -->
              <div class="flex gap-1 mb-2">
                <StarIcon 
                  v-for="i in 5" 
                  :key="i"
                  :class="[
                    'w-4 h-4',
                    i <= product.rating ? 'text-[#FF9934]' : 'text-gray-200'
                  ]"
                />
              </div>
  
              <!-- Product Name -->
              <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ product.name }}</h3>
  
              <!-- Price and Action -->
              <div class="flex items-center justify-between relative">
                <span class="text-xl font-bold text-[#FF9934]" v-if="product.price">
                  ${{ product.price.toFixed(2) }}
                </span>
                <button 
                  v-if="!product.soldOut"
                  class="bg-[#FF9934] hover:bg-[#FF8000] text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 absolute right-0 opacity-0 group-hover:opacity-100"
                >
                  RESERVE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { EyeIcon, HeartIcon, StarIcon, BarChart3Icon } from 'lucide-vue-next';
  
  const products = [
    {
      id: 1,
      name: 'White Brown Eggs',
      image: '/src/assets/products/white-brown-eggs.jpg',
      rating: 1,
      soldOut: true
    },
    {
      id: 2,
      name: 'Eggs goose',
      image: '/src/assets/products/eggs-goose.jpg',
      price: 122.00,
      rating: 2
    },
    {
      id: 3,
      name: 'Chicken Coop',
      image: '/src/assets/products/chicken-coop.jpg',
      price: 299.99,
      rating: 4
    },
    {
      id: 4,
      name: 'Egg Incubator',
      image: '/src/assets/products/egg-incubator.jpg',
      price: 199.99,
      rating: 5
    }
  ];
  </script>
  
  <style scoped>
  .group:hover .group-hover\:opacity-100 {
    opacity: 1;
  }
  </style>
  
  