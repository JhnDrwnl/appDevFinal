<!-- components/landing/ProductDetailModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Close Button -->
      <div class="flex justify-end p-4">
        <button @click="close" class="text-gray-500 hover:text-gray-700">
          <XIcon class="w-6 h-6" />
        </button>
      </div>

      <div class="px-6 pb-6">
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Product Images -->
          <div class="space-y-4">
            <div class="aspect-square relative rounded-lg overflow-hidden">
              <div class="absolute inset-0 flex transition-transform duration-300 ease-in-out" :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }">
                <img 
                  v-for="(image, index) in displayImages"
                  :key="index"
                  :src="image"
                  :alt="product?.name"
                  class="w-full h-full object-cover flex-shrink-0"
                />
              </div>
              <!-- Arrow Navigation -->
              <button 
                v-if="allImages.length > 1"
                @click="previousImage" 
                class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[#FF9934] p-2 rounded-full text-white hover:bg-[#FF8000] transition-colors duration-300"
                aria-label="Previous image"
              >
                <ChevronLeftIcon class="w-6 h-6" />
              </button>
              <button 
                v-if="allImages.length > 1"
                @click="nextImage" 
                class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#FF9934] p-2 rounded-full text-white hover:bg-[#FF8000] transition-colors duration-300"
                aria-label="Next image"
              >
                <ChevronRightIcon class="w-6 h-6" />
              </button>
            </div>
            <!-- Thumbnail Gallery -->
            <div v-if="allImages.length > 1" class="flex space-x-2 overflow-x-auto">
              <button 
                v-for="(image, index) in allImages" 
                :key="index"
                @click="setCurrentImage(index)"
                class="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
                :class="{ 'ring-2 ring-[#FF9934]': currentImageIndex % allImages.length === index }"
                :aria-label="`View image ${index + 1}`"
              >
                <img :src="image" :alt="`${product?.name} thumbnail ${index + 1}`" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- Product Details -->
          <div class="space-y-4">
            <!-- Product Name -->
            <h2 class="text-2xl font-bold text-gray-800">{{ product?.name }}</h2>

            <!-- Categories -->
            <div v-if="product?.categories && product.categories.length > 0" class="flex flex-wrap gap-2">
              <span 
                v-for="category in product.categories" 
                :key="category"
                class="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded-full"
              >
                {{ category }}
              </span>
            </div>

            <!-- Rating -->
            <div class="flex gap-1">
              <StarIcon 
                v-for="i in 5" 
                :key="i"
                :class="[
                  'w-5 h-5',
                  i <= (product?.rating || 0) ? 'text-[#FF9934]' : 'text-gray-200'
                ]"
              />
            </div>

            <!-- Prices -->
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-2xl font-bold text-[#FF9934]">
                  ₱{{ product?.finalPrice.toFixed(2) }}
                </span>
                <span v-if="product?.finalPrice < product?.price" class="text-lg line-through text-gray-500">
                  ₱{{ product?.price.toFixed(2) }}
                </span>
              </div>
            </div>

            <!-- Product Description -->
            <div v-if="product?.description" class="mt-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <div v-html="product.description" class="text-gray-600"></div>
            </div>

            <!-- Applied Rules -->
            <div v-if="product?.appliedRules?.length > 0" class="text-sm text-gray-600">
              <p class="font-semibold">Applied discounts:</p>
              <ul class="list-disc list-inside">
                <li v-for="rule in product?.appliedRules" :key="rule.id">
                  {{ rule.name }}: {{ formatRuleValue(rule) }}
                </li>
              </ul>
            </div>

            <!-- Product Info -->
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Availability:</span>
                <span :class="[
                  'font-medium',
                  product?.stockQuantity <= 0 ? 'text-red-500' : 'text-green-500'
                ]">
                  {{ product?.stockQuantity <= 0 ? 'Out of Stock' : `In Stock (${product?.stockQuantity})` }}
                </span>
              </div>
            </div>

            <!-- Quantity and Reserve -->
            <div v-if="product?.stockQuantity > 0" class="space-y-4">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <div class="flex items-center gap-2">
                  <input 
                    type="number" 
                    v-model="quantity"
                    :min="minimumQuantity"
                    :max="product.stockQuantity"
                    class="w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
                  />
                  <span class="text-sm text-gray-500">
                    Available: {{ product.stockQuantity }}
                  </span>
                </div>
                <p v-if="minimumQuantity > 1" class="text-sm text-blue-600">
                  This product has a minimum quantity of {{ minimumQuantity }}
                </p>
              </div>

              <button 
                @click="reserve"
                :disabled="!isValidQuantity"
                class="w-full bg-[#FF9934] hover:bg-[#FF8000] disabled:bg-gray-300 text-white px-6 py-3 rounded-full text-sm font-semibold transition-colors duration-300"
              >
                Reserve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { StarIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  product: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'reserve']);

const quantity = ref(1);
const minimumQuantity = computed(() => props.product?.minimumQuantity || 1);
const currentImageIndex = ref(0);

const allImages = computed(() => {
  if (!props.product) return [];
  return [
    props.product.thumbnailURL,
    ...(props.product.imageURLs || [])
  ].filter(Boolean);
});

const displayImages = computed(() => {
  return allImages.value.length > 1 ? [...allImages.value, allImages.value[0]] : allImages.value;
});

const isValidQuantity = computed(() => {
  if (!props.product) return false;
  return quantity.value >= minimumQuantity.value && 
         quantity.value <= props.product.stockQuantity;
});

watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    quantity.value = minimumQuantity.value;
    currentImageIndex.value = 0;
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
});

const formatRuleValue = (rule) => {
  return rule.type === 'percentage'
    ? `${rule.value}% off`
    : `₱${rule.value.toFixed(2)} off`;
};

const close = () => {
  emit('close');
};

const reserve = () => {
  if (isValidQuantity.value) {
    emit('reserve', {
      productId: props.product.id,
      quantity: quantity.value
    });
    close();
  }
};

const previousImage = () => {
  if (currentImageIndex.value === 0) {
    currentImageIndex.value = allImages.value.length - 1;
  } else {
    currentImageIndex.value--;
  }
};

const nextImage = () => {
  if (currentImageIndex.value === allImages.value.length - 1) {
    currentImageIndex.value = 0;
  } else {
    currentImageIndex.value++;
  }
};

const setCurrentImage = (index) => {
  currentImageIndex.value = index;
};
</script>