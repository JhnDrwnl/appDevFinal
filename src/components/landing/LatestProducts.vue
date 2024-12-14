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
        <div v-for="product in latestProducts" :key="product.id" class="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
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

            <!-- Product Image -->
            <img 
              :src="product.thumbnailURL || product.imageURLs[0] || '/placeholder.svg?height=300&width=300'" 
              :alt="product.name"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Product Info -->
          <div class="p-6 flex flex-col flex-grow">
            <!-- Product Name -->
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ product.name }}</h3>

            <!-- Product Description -->
            <div class="text-sm text-gray-600 mb-4 flex-grow" v-html="truncateDescription(product.description, 100)"></div>

            <!-- Prices and Discounts -->
            <div class="mt-auto">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xl font-bold text-[#FF9934]">
                  ₱{{ product.finalPrice.toFixed(2) }}
                </span>
                <span v-if="product.finalPrice < product.price" class="text-sm line-through text-gray-500">
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
    </div>
    <ProductDetailModal
      :is-open="!!selectedProduct"
      :product="selectedProduct"
      @close="selectedProduct = null"
      @reserve="handleReserve"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProductStore } from '@/store/modules/products';
import { useProductPriceRuleStore } from '@/store/modules/productPriceRules';
import { usePriceRuleStore } from '@/store/modules/priceRules';
import { useBasketStore } from '@/store/modules/basket';
import ProductDetailModal from '@/components/landing/ProductDetailModal.vue';
import DOMPurify from 'dompurify';

const productStore = useProductStore();
const productPriceRuleStore = useProductPriceRuleStore();
const priceRuleStore = usePriceRuleStore();
const basketStore = useBasketStore();

const latestProducts = ref([]);
const selectedProduct = ref(null);

onMounted(async () => {
  try {
    await Promise.all([
      productStore.fetchProducts(),
      productPriceRuleStore.fetchProductPriceRules(),
      priceRuleStore.fetchPriceRules(),
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
      };
    });

  return productRules;
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

const isNewProduct = (product) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return new Date(product.createdAt) > oneWeekAgo;
};

const showProductDetails = (product) => {
  selectedProduct.value = product;
};

const handleReserve = ({ productId, quantity }) => {
  const product = latestProducts.value.find(p => p.id === productId);
  if (product) {
    basketStore.addToBasket(product, quantity);
    alert(`${quantity} ${product.name}(s) has been added to your basket!`);
  }
  selectedProduct.value = null;
};
</script>

