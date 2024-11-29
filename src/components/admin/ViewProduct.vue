<template>
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">View Product</h1>
        <button
          @click="$emit('back')"
          class="text-sm text-[#0095FF] hover:text-[#0077CC]"
        >
          Back to Products
        </button>
      </div>
  
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- General Information -->
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <h2 class="text-lg font-medium text-gray-900 mb-4">General</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Product Name</label>
                <div class="mt-1 text-sm text-gray-900">{{ product.name }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <div class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{{ product.description }}</div>
              </div>
            </div>
          </div>
  
          <!-- Media -->
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Media</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div v-for="(image, index) in product.imageURLs" :key="index" class="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img :src="image" :alt="`Product image ${index + 1}`" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>
  
          <!-- Pricing -->
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Pricing</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Base Price</label>
                <div class="mt-1 text-sm text-gray-900">${{ product.price.toFixed(2) }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Discount Type</label>
                <div class="mt-1 text-sm text-gray-900">{{ capitalizeFirstLetter(product.discountType) }}</div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Thumbnail -->
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Thumbnail</h2>
            <div class="relative aspect-video rounded-lg overflow-hidden mb-4">
              <img
                v-if="product.thumbnailURL"
                :src="product.thumbnailURL"
                :alt="product.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center">
                <ImageIcon class="w-12 h-12 text-gray-400" />
              </div>
            </div>
          </div>
  
          <!-- Product Details -->
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Product Details</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Category</label>
                <div class="mt-1 text-sm text-gray-900">{{ product.category }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tags</label>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span
                    v-for="tag in product.tags"
                    :key="tag"
                    class="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Stock Status</label>
                <div class="mt-1 text-sm text-gray-900">{{ product.inStock ? 'In Stock' : 'Out of Stock' }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Date Added</label>
                <div class="mt-1 text-sm text-gray-900">{{ formatDate(product.date) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ImageIcon } from 'lucide-vue-next'
  
  const props = defineProps({
    product: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['back'])
  
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  </script>