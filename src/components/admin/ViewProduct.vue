<!-- components/admin/ViewProducts.vue -->
<template>
    <div class="bg-white rounded-lg overflow-hidden">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-semibold text-gray-900">View Product</h1>
          <button
            @click="$emit('back')"
            class="text-sm text-[#FF9934] hover:text-[#E08824] transition-colors duration-200"
          >
            Back to Products
          </button>
        </div>
  
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Product Images -->
          <div class="space-y-4">
            <div class="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden">
              <img :src="product.thumbnailURL" alt="Product Thumbnail" class="object-cover w-full h-full" />
            </div>
            <div class="grid grid-cols-4 gap-2">
              <div v-for="(image, index) in product.imageURLs" :key="index" class="aspect-w-1 aspect-h-1 rounded-md overflow-hidden">
                <img :src="image" :alt="`Product Image ${index + 1}`" class="object-cover w-full h-full" />
              </div>
            </div>
          </div>
  
          <!-- Product Details -->
          <div class="space-y-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ product.name }}</h2>
              <div v-html="product.description" class="text-gray-600 mt-1"></div>
            </div>
  
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Price</h2>
              <p class="text-2xl font-bold text-[#FF9934]">₱{{ product.price.toFixed(2) }}</p>
              <p v-if="product.discountType !== 'none'" class="text-sm text-green-600">
                {{ discountText }}
              </p>
            </div>
  
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Stock</h2>
              <p :class="stockStatusClass">{{ stockStatusText }}</p>
            </div>
  
            <div v-if="product.category">
              <h2 class="text-lg font-semibold text-gray-900">Category</h2>
              <p class="text-gray-600">{{ product.category }}</p>
            </div>
  
            <div v-if="product.tags && product.tags.length > 0">
              <h2 class="text-lg font-semibold text-gray-900">Tags</h2>
              <div class="flex flex-wrap gap-2 mt-1">
                <span
                  v-for="tag in product.tags"
                  :key="tag"
                  class="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
  
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Date Added</h2>
              <p class="text-gray-600">{{ formatDate(product.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    product: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['back'])
  
  const discountText = computed(() => {
    if (props.product.discountType === 'percentage') {
      return `${props.product.discountValue}% off`
    } else if (props.product.discountType === 'fixed') {
      return `₱${props.product.discountValue.toFixed(2)} off`
    }
    return ''
  })
  
  const stockStatusText = computed(() => {
    return props.product.stockQuantity > 0 
      ? `In Stock (${props.product.stockQuantity})` 
      : 'Out of Stock'
  })
  
  const stockStatusClass = computed(() => {
    return props.product.stockQuantity > 0
      ? 'text-green-600'
      : 'text-red-600'
  })
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  </script>