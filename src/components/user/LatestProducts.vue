<!-- components/landing/LatestProducts.vue -->
<template>
    <div class="bg-white py-24">
      <div class="container mx-auto px-4">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-6 text-gray-800">Latest Products</h2>
          <p class="text-gray-600 leading-relaxed max-w-3xl mx-auto text-lg">
            Discover our newest arrivals of premium-quality chicks, feeds, and supplements, carefully selected to meet your poultry farming needs.
          </p>
        </div>
  
        <!-- Products Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="product in latestProducts" :key="product.id" class="bg-white rounded-lg shadow-sm overflow-hidden group">
            <!-- Product Image Container -->
            <div class="relative aspect-square overflow-hidden">
              <!-- Stock Status Badge -->
              <div class="absolute top-4 left-4 z-10">
                <span v-if="product.stockQuantity <= 0" class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  SOLD OUT
                </span>
                <span v-else-if="product.stockQuantity <= 5" class="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  LOW STOCK
                </span>
              </div>
  
              <!-- New Product Badge -->
              <div v-if="isNewProduct(product)" class="absolute top-4 right-4 z-10">
                <span class="bg-black text-white px-3 py-1 rounded-full text-sm font-semibold">
                  NEW
                </span>
              </div>
              
              <!-- Action Buttons -->
              <div class="absolute right-4 top-16 flex flex-col gap-2 z-10">
                <button 
                  @click="showProductDetails(product)"
                  class="bg-[#FF9934] p-2 rounded-full shadow-md text-white hover:bg-[#FF8000] transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 transform translate-x-full group-hover:translate-x-0"
                >
                  <EyeIcon class="w-5 h-5" />
                </button>
                <button 
                  class="bg-[#FF9934] p-2 rounded-full shadow-md text-white hover:bg-[#FF8000] transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 transform translate-x-full group-hover:translate-x-0 delay-[50ms]"
                >
                  <HeartIcon class="w-5 h-5" />
                </button>
                <button 
                  class="bg-[#FF9934] p-2 rounded-full shadow-md text-white hover:bg-[#FF8000] transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 transform translate-x-full group-hover:translate-x-0 delay-[100ms]"
                >
                  <BarChart3Icon class="w-5 h-5" />
                </button>
              </div>
  
              <!-- Product Image -->
              <img 
                :src="product.thumbnailURL || product.imageURLs[0] || '/placeholder.svg?height=300&width=300'" 
                :alt="product.name"
                class="w-full h-full object-cover"
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
                    i <= (product.rating || 0) ? 'text-[#FF9934]' : 'text-gray-200'
                  ]"
                />
              </div>
  
              <!-- Product Name -->
              <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ product.name }}</h3>
  
              <!-- Prices and Action -->
              <div class="flex items-center justify-between relative">
                <div>
                  <span class="text-xl font-bold text-[#FF9934]">
                    ₱{{ product.finalPrice.toFixed(2) }}
                  </span>
                  <span v-if="product.finalPrice < product.price" class="ml-2 text-sm line-through text-gray-500">
                    ₱{{ product.price.toFixed(2) }}
                  </span>
                </div>
                <button 
                  v-if="product.stockQuantity > 0"
                  @click="showProductDetails(product)"
                  class="bg-[#FF9934] hover:bg-[#FF8000] text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out absolute right-0 opacity-0 group-hover:opacity-100 transform translate-y-full group-hover:translate-y-0 delay-[150ms]"
                >
                  RESERVE
                </button>
              </div>
  
              <!-- Applied Rules -->
              <div v-if="product.appliedRules.length > 0" class="mt-2 text-sm text-gray-600">
                <p class="font-semibold">Applied discounts:</p>
                <ul class="list-disc list-inside">
                  <li v-for="rule in product.appliedRules" :key="rule.id">
                    {{ rule.name }}: {{ formatRuleValue(rule) }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ProductDetailModal
      :is-open="!!selectedProduct"
      :product="selectedProduct"
      @close="selectedProduct = null"
      @reserve="handleReserve"
    />
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { EyeIcon, HeartIcon, StarIcon, BarChart3Icon } from 'lucide-vue-next';
  import { useProductStore } from '@/store/modules/products';
  import { useProductPriceRuleStore } from '@/store/modules/productPriceRules';
  import { usePriceRuleStore } from '@/store/modules/priceRules';
  import { useCategoryStore } from '@/store/modules/categories';
  import ProductDetailModal from '@/components/landing/ProductDetailModal.vue';
  
  const productStore = useProductStore();
  const productPriceRuleStore = useProductPriceRuleStore();
  const priceRuleStore = usePriceRuleStore();
  const categoryStore = useCategoryStore();
  
  const latestProducts = ref([]);
  const selectedProduct = ref(null);
  
  onMounted(async () => {
    try {
      await Promise.all([
        productStore.fetchProducts(),
        productPriceRuleStore.fetchProductPriceRules(),
        priceRuleStore.fetchPriceRules(),
        categoryStore.fetchCategories()
      ]);
      
      latestProducts.value = productStore.products
        .slice(0, 4)
        .map(product => {
          const appliedRules = getAppliedRules(product);
          const finalPrice = calculateFinalPrice(product, appliedRules);
          return {
            ...product,
            finalPrice,
            appliedRules
          };
        });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  });
  
  const getAppliedRules = (product) => {
    const productRules = productPriceRuleStore.productPriceRules
      .filter(rule => rule.productId === product.id)
      .map(rule => {
        const priceRule = priceRuleStore.priceRules.find(pr => pr.id === rule.priceRuleId);
        return {
          id: rule.id,
          name: priceRule ? priceRule.name : 'Unknown Rule',
          value: priceRule ? priceRule.value : 0,
          type: priceRule ? priceRule.type : 'fixed',
          isProductRule: true
        };
      });
  
    const categoryRules = product.categoryIds.flatMap(categoryId => {
      const category = categoryStore.getCategoryById(categoryId);
      if (category && category.priceRule) {
        return [{
          id: category.priceRule.id,
          name: `${category.name} - ${category.priceRule.priceRuleName}`,
          value: category.priceRule.priceRuleValue,
          type: category.priceRule.priceRuleType,
          isProductRule: false
        }];
      }
      return [];
    });
  
    return [...productRules, ...categoryRules];
  };
  
  const calculateFinalPrice = (product, appliedRules) => {
    let finalPrice = product.price;
  
    appliedRules.forEach(rule => {
      if (rule.type === 'percentage') {
        finalPrice *= (1 - rule.value / 100);
      } else {
        finalPrice -= rule.value;
      }
    });
  
    return Math.max(finalPrice, 0); // Ensure the price doesn't go below 0
  };
  
  const formatRuleValue = (rule) => {
    return rule.type === 'percentage'
      ? `${rule.value}% off`
      : `₱${rule.value.toFixed(2)} off`;
  };
  
  const isNewProduct = (product) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(product.createdAt) > oneWeekAgo;
  };
  
  const showProductDetails = (product) => {
    selectedProduct.value = product;
  };
  
  const handleReserve = ({ productId, quantity }) => {
    // Implement reserve functionality
    console.log('Reserving product:', { productId, quantity });
  };
  </script>
  
  <style scoped>
  .group:hover .group-hover\:opacity-100 {
    opacity: 1;
  }
  .group:hover .group-hover\:translate-x-0 {
    transform: translateX(0);
  }
  .group:hover .group-hover\:translate-y-0 {
    transform: translateY(0);
  }
  </style>
  
  