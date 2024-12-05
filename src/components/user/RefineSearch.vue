<!-- components/landing/RefineSearch.vue -->
<template>
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">Refine Search</h2>
      
      <!-- Price Range Slider -->
      <div class="mb-6">
        <h3 class="font-semibold mb-4 text-gray-700">Price Range</h3>
        <div class="relative px-2">
          <div class="h-1 bg-gray-200 rounded-full">
            <div
              class="absolute h-1 bg-[#FF9934] rounded-full"
              :style="{
                left: `${((priceRange[0] - minAvailablePrice) / (maxAvailablePrice - minAvailablePrice)) * 100}%`,
                width: `${((priceRange[1] - priceRange[0]) / (maxAvailablePrice - minAvailablePrice)) * 100}%`
              }"
            ></div>
          </div>
          
          <!-- Price Thumbs -->
          <div 
            v-for="(value, index) in priceRange" 
            :key="index"
            class="absolute top-0 -mt-1.5 -ml-2.5"
            :style="{
              left: `${((value - minAvailablePrice) / (maxAvailablePrice - minAvailablePrice)) * 100}%`
            }"
          >
            <div 
              class="w-5 h-5 bg-[#FF9934] border-2 border-white rounded-full shadow cursor-pointer"
              @mousedown="startDragging(index, $event)"
            ></div>
            <div 
              class="absolute mt-2 -ml-4 text-sm font-medium text-gray-600 whitespace-nowrap"
              :style="{ width: '80px', textAlign: 'center' }"
            >
              ₱{{ formatPrice(value) }}
            </div>
          </div>
  
          <!-- Hidden Range Inputs -->
          <input
            type="range"
            v-model.number="priceRange[0]"
            :min="minAvailablePrice"
            :max="maxAvailablePrice"
            :step="priceStep"
            class="absolute w-full top-0 h-1 opacity-0 cursor-pointer"
            @input="updatePriceRange(0)"
          />
          <input
            type="range"
            v-model.number="priceRange[1]"
            :min="minAvailablePrice"
            :max="maxAvailablePrice"
            :step="priceStep"
            class="absolute w-full top-0 h-1 opacity-0 cursor-pointer"
            @input="updatePriceRange(1)"
          />
        </div>
      </div>
  
      <!-- Stock Status -->
      <div class="mb-4 mt-8">
        <h3 class="font-semibold mb-2 text-gray-700">Stock Status</h3>
        <div class="space-y-2">
          <label class="flex items-center">
            <input
              type="checkbox"
              v-model="inStock"
              class="form-checkbox text-[#FF9934] rounded border-gray-300 focus:border-[#FF9934] focus:ring focus:ring-[#FF9934] focus:ring-opacity-50"
            />
            <span class="ml-2 text-gray-700">In Stock</span>
          </label>
          <label class="flex items-center">
            <input
              type="checkbox"
              v-model="onSale"
              class="form-checkbox text-[#FF9934] rounded border-gray-300 focus:border-[#FF9934] focus:ring focus:ring-[#FF9934] focus:ring-opacity-50"
            />
            <span class="ml-2 text-gray-700">On Sale</span>
          </label>
        </div>
      </div>
  
      <!-- Apply Filters Button -->
      <div class="mt-6 flex justify-start">
        <button
          @click="applyFilters"
          class="bg-[#FF9934] hover:bg-[#FF8000] text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center justify-center text-sm"
        >
          <FilterIcon class="w-4 h-4 mr-2" />
          Apply Filters
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { FilterIcon } from 'lucide-vue-next';
  import { useProductStore } from '@/store/modules/products';
  
  const productStore = useProductStore();
  
  const priceRange = ref([156, 894]);
  const inStock = ref(false);
  const onSale = ref(false);
  
  const minAvailablePrice = ref(156);
  const maxAvailablePrice = ref(894);
  const priceStep = ref(1);
  
  onMounted(async () => {
    await productStore.fetchProducts();
    const prices = productStore.products.map(p => p.finalPrice);
    minAvailablePrice.value = Math.floor(Math.min(...prices));
    maxAvailablePrice.value = Math.ceil(Math.max(...prices));
    priceRange.value = [minAvailablePrice.value, maxAvailablePrice.value];
    
    const priceDifference = maxAvailablePrice.value - minAvailablePrice.value;
    priceStep.value = Math.max(1, Math.floor(priceDifference / 100));
  
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  });
  
  onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  });
  
  const updatePriceRange = (index) => {
    if (index === 0 && priceRange.value[0] > priceRange.value[1]) {
      priceRange.value[0] = priceRange.value[1];
    } else if (index === 1 && priceRange.value[1] < priceRange.value[0]) {
      priceRange.value[1] = priceRange.value[0];
    }
  };
  
  const formatPrice = (price) => {
    return price.toFixed(2);
  };
  
  const applyFilters = () => {
    const filters = {
      priceRange: {
        min: priceRange.value[0],
        max: priceRange.value[1]
      },
      inStock: inStock.value,
      onSale: onSale.value
    };
  
    emit('apply-filters', filters);
  };
  
  // Drag functionality
  const isDragging = ref(false);
  const currentThumb = ref(null);
  
  const startDragging = (index, event) => {
    event.preventDefault();
    isDragging.value = true;
    currentThumb.value = index;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (event) => {
    if (!isDragging.value) return;
    
    const slider = event.target.closest('.relative');
    if (!slider) return;
    
    const rect = slider.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    const value = Math.round(
      minAvailablePrice.value + 
      (maxAvailablePrice.value - minAvailablePrice.value) * percentage
    );
    
    priceRange.value[currentThumb.value] = Math.max(
      minAvailablePrice.value,
      Math.min(maxAvailablePrice.value, value)
    );
    
    updatePriceRange(currentThumb.value);
  };
  
  const handleMouseUp = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  // Define emits
  const emit = defineEmits(['apply-filters']);
  </script>
  
  <style scoped>
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    pointer-events: auto;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
  }
  
  input[type="range"]::-moz-range-thumb {
    pointer-events: auto;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    border: none;
  }
  </style>