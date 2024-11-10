<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <img :src="product.image" :alt="product.name" class="w-full h-48 object-cover">
    <div class="p-4">
      <h3 class="text-lg font-semibold text-gray-800">{{ product.name }}</h3>
      <p class="mt-1 text-sm text-gray-600">{{ product.description }}</p>
      <div class="mt-4 flex items-center justify-between">
        <span class="text-lg font-bold text-gray-900">${{ product.price.toFixed(2) }}</span>
        <button @click="addToCart" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Add to Cart
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Remove the import statement for defineProps and defineEmits

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['add-to-cart']);

const addToCart = () => {
  emit('add-to-cart', props.product);
};
</script>