<!-- components/user/Productcards.vue -->
<template>
  <div>
    <div :class="{'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8': view === 'grid', 'space-y-4': view === 'list'}">
      <div 
        v-for="product in paginatedProducts" 
        :key="product.id" 
        :class="{'bg-white rounded-lg shadow-sm overflow-hidden group flex flex-col': view === 'grid', 'bg-white rounded-lg shadow-sm overflow-hidden group flex': view === 'list'}"
      >
        <!-- Product Image Container -->
        <div :class="{'relative aspect-square overflow-hidden': view === 'grid', 'relative w-1/3 aspect-square overflow-hidden': view === 'list'}">
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

          <!-- Product Image -->
          <img 
            :src="product.thumbnailURL || product.imageURLs[0] || '/placeholder.svg?height=300&width=300'" 
            :alt="product.name"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Product Info -->
        <div :class="{'p-6 flex flex-col flex-grow': view === 'grid', 'p-6 flex flex-col flex-grow w-2/3': view === 'list'}">
          <!-- Product Name -->
          <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ product.name }}</h3>

          <!-- Categories (only in list view) -->
          <div v-if="view === 'list' && product.categories && product.categories.length > 0" class="flex flex-wrap gap-2 mb-2">
            <span 
              v-for="category in product.categories" 
              :key="category"
              class="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full"
            >
              {{ category }}
            </span>
          </div>

          <!-- Product Description -->
          <div class="text-sm text-gray-600 mb-4" v-html="truncateDescription(product.description, view === 'list' ? 200 : 100)"></div>

          <!-- Prices and Discounts -->
          <div class="mt-auto">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xl font-bold text-[#FF9934]">
                ₱{{ product.finalPrice.toFixed(2) }}
              </span>
              <span v-if="product.isOnSale" class="text-sm line-through text-gray-500">
                ₱{{ product.price.toFixed(2) }}
              </span>
            </div>

            <!-- Applied Rules -->
            <div v-if="product.appliedRules && product.appliedRules.length > 0" class="text-sm text-gray-600 mb-2">
              <p v-for="rule in product.appliedRules" :key="rule.id" class="font-semibold">
                {{ rule.name }}: {{ formatRuleValue(rule) }}
              </p>
            </div>

            <!-- Reserve Button -->
            <button 
              v-if="product.stockQuantity > 0"
              @click="showProductDetails(product)"
              class="bg-[#FF9934] hover:bg-[#FF8000] text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out w-full"
            >
              RESERVE
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <ProductDetailModal
      :is-open="isModalOpen"
      :product="selectedProduct"
      @close="closeModal"
      @reserve="handleReserve"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProductStore } from '@/store/modules/products';
import { useProductPriceRuleStore } from '@/store/modules/productPriceRules';
import { usePriceRuleStore } from '@/store/modules/priceRules';
import { useCategoryStore } from '@/store/modules/categories';
import { useBasketStore } from '@/store/modules/basket';
import { db } from '@/services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import DOMPurify from 'dompurify';
import ProductDetailModal from '@/components/landing/ProductDetailModal.vue';

const route = useRoute();
const productStore = useProductStore();
const productPriceRuleStore = useProductPriceRuleStore();
const priceRuleStore = usePriceRuleStore();
const categoryStore = useCategoryStore();
const basketStore = useBasketStore();

const props = defineProps({
  categoryId: {
    type: String,
    default: null
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  currentPage: {
    type: Number,
    default: 1
  },
  sortBy: {
    type: String,
    default: 'default'
  },
  view: {
    type: String,
    default: 'grid'
  }
});

const isModalOpen = ref(false);
const selectedProduct = ref(null);

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

const filteredProducts = computed(() => {
  let products = productStore.products;
  
  // Apply category filter
  if (props.categoryId) {
    products = products.filter(product => 
      product.categoryIds.includes(props.categoryId)
    );
  }
  
  // Apply price range filter
  if (props.filters.priceRange) {
    products = products.filter(product => 
      product.finalPrice >= props.filters.priceRange.min &&
      product.finalPrice <= props.filters.priceRange.max
    );
  }
  
  // Apply stock status filter
  if (props.filters.inStock) {
    products = products.filter(product => product.stockQuantity > 0);
  }
  
  // Apply sale status filter
  if (props.filters.onSale) {
    products = products.filter(product => {
      const appliedRules = getAppliedRules(product);
      const finalPrice = calculateFinalPrice(product, appliedRules);
      return finalPrice < product.price;
    });
  }
  
  return products.map(product => {
    const appliedRules = getAppliedRules(product);
    const finalPrice = calculateFinalPrice(product, appliedRules);
    return {
      ...product,
      finalPrice,
      appliedRules,
      isOnSale: finalPrice < product.price
    };
  });
});

const formatRuleValue = (rule) => {
  return rule.type === 'percentage'
    ? `${rule.value}% off`
    : `₱${rule.value.toFixed(2)} off`;
};

const showProductDetails = (product) => {
  selectedProduct.value = product;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedProduct.value = null;
};

const handleReserve = ({ productId, quantity }) => {
  const product = productStore.getProductById(productId)
  if (product) {
    basketStore.addToBasket(product, quantity)
    alert(`${quantity} ${product.name}(s) has been added to your basket!`)
  }
  closeModal()
};

const isNewProduct = (product) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return new Date(product.createdAt) > oneWeekAgo;
};

const sortedProducts = computed(() => {
  let sorted = [...filteredProducts.value];
  switch (props.sortBy) {
    case 'name_asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name_desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'price_asc':
      sorted.sort((a, b) => a.finalPrice - b.finalPrice);
      break;
    case 'price_desc':
      sorted.sort((a, b) => b.finalPrice - a.finalPrice);
      break;
    default:
      // Keep the default order
      break;
  }
  return sorted;
});

const paginatedProducts = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return sortedProducts.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / props.itemsPerPage));

onMounted(() => {
  productStore.fetchProducts();
  productPriceRuleStore.fetchProductPriceRules();
  priceRuleStore.fetchPriceRules();
  categoryStore.fetchCategories();
});

watch(() => route.query.category, (newCategoryId) => {
  props.categoryId = newCategoryId || null;
});

watch(() => props.filters, () => {
  // This will trigger a re-computation of filteredProducts
}, { deep: true });

const truncateDescription = (html, maxLength) => {
  const sanitizedHtml = DOMPurify.sanitize(html || '');
  const div = document.createElement('div');
  div.innerHTML = sanitizedHtml;
  let text = div.textContent || div.innerText || '';
  
  if (text.length <= maxLength) {
    return sanitizedHtml;
  }
  
  text = text.substr(0, maxLength);
  const lastSpaceIndex = text.lastIndexOf(' ');
  if (lastSpaceIndex > 0) {
    text = text.substr(0, lastSpaceIndex);
  }
  return text + '...';
};

defineExpose({ totalPages, filteredProducts });
</script>

<style scoped>
/* No additional styles needed */
</style>

