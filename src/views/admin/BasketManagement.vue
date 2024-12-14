<template>
    <div class="container mx-auto p-4">
      <div v-if="isLoading" class="text-center">
        <p>Loading...</p>
      </div>
      <div v-else-if="error" class="text-center text-red-500">
        <p>{{ error }}</p>
      </div>
      <div v-else>
        <div v-for="(userBasket, userId) in groupedBasketItems" :key="userId" class="mb-8">
          <h2 class="text-xl font-semibold mb-2">
            {{ userId.startsWith('guest_') ? 'Guest User' : 'Registered User' }}: {{ userId }}
          </h2>
          <table class="w-full border-collapse border border-gray-300">
            <thead>
              <tr class="bg-gray-100">
                <th class="border border-gray-300 p-2">Product</th>
                <th class="border border-gray-300 p-2">Price</th>
                <th class="border border-gray-300 p-2">Quantity</th>
                <th class="border border-gray-300 p-2">Final Price</th>
                <th class="border border-gray-300 p-2">Total</th>
                <th class="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in userBasket" :key="item.id" class="hover:bg-gray-50">
                <td class="border border-gray-300 p-2">
                  <div class="flex items-center">
                    <img :src="item.thumbnailURL || '/placeholder.svg?height=48&width=48'" :alt="item.name" class="w-12 h-12 object-cover rounded-md mr-2">
                    <div>
                      <div class="font-medium">{{ item.name }}</div>
                      <div class="text-sm text-gray-500">ID: {{ item.productId }}</div>
                    </div>
                  </div>
                </td>
                <td class="border border-gray-300 p-2">
                  <div>₱{{ item.price.toFixed(2) }}</div>
                  <div v-if="getAppliedRules(item).length > 0" class="text-xs text-gray-500 mt-1">
                    <div v-for="rule in getAppliedRules(item)" :key="rule.id">
                      {{ rule.name }}: {{ formatRuleValue(rule) }} off
                    </div>
                  </div>
                </td>
                <td class="border border-gray-300 p-2">
                  <input 
                    type="number" 
                    v-model="item.quantity" 
                    @change="updateQuantity(item)" 
                    min="1" 
                    class="w-16 p-1 border rounded"
                  >
                </td>
                <td class="border border-gray-300 p-2">₱{{ calculateFinalPrice(item).toFixed(2) }}</td>
                <td class="border border-gray-300 p-2">₱{{ (calculateFinalPrice(item) * item.quantity).toFixed(2) }}</td>
                <td class="border border-gray-300 p-2">
                  <button 
                    @click="removeItem(item.id)" 
                    class="bg-[#FF9934] text-white px-3 py-1 rounded hover:bg-opacity-80"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="mt-2">
            <p class="font-semibold">Total Items: {{ getUserBasketCount(userBasket) }}</p>
            <p class="font-semibold">Total Value: ₱{{ getUserBasketTotal(userBasket) }}</p>
          </div>
        </div>
        <div class="mt-4">
          <p class="text-xl font-semibold">Overall Total Items: {{ overallBasketCount }}</p>
          <p class="text-xl font-semibold">Overall Total Value: ₱{{ overallBasketTotal }}</p>
        </div>
        <button 
          @click="clearAllBaskets" 
          class="mt-4 bg-[#FF9934] text-white px-4 py-2 rounded hover:bg-opacity-80"
        >
          Clear All Baskets
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, computed, ref } from 'vue';
  import { useBasketStore } from '@/store/modules/basket';
  import { useProductStore } from '@/store/modules/products';
  import { useProductPriceRuleStore } from '@/store/modules/productPriceRules';
  import { usePriceRuleStore } from '@/store/modules/priceRules';
  import { useCategoryStore } from '@/store/modules/categories';
  import { collection, getDocs } from 'firebase/firestore';
  import { db } from '@/services/firebase';
  
  const basketStore = useBasketStore();
  const productStore = useProductStore();
  const productPriceRuleStore = useProductPriceRuleStore();
  const priceRuleStore = usePriceRuleStore();
  const categoryStore = useCategoryStore();
  
  const isLoading = ref(true);
  const error = ref(null);
  const allBasketItems = ref([]);
  
  const fetchAllBasketItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'baskets'));
      allBasketItems.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      isLoading.value = false;
    } catch (err) {
      console.error('Error fetching all basket items:', err);
      error.value = err.message;
      isLoading.value = false;
    }
  };
  
  onMounted(fetchAllBasketItems);
  
  const groupedBasketItems = computed(() => {
    return allBasketItems.value.reduce((acc, item) => {
      if (!acc[item.userId]) {
        acc[item.userId] = [];
      }
      acc[item.userId].push(item);
      return acc;
    }, {});
  });
  
  const getAppliedRules = (item) => {
    const product = productStore.getProductById(item.productId);
    if (!product) return [];
  
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
  
  const formatRuleValue = (rule) => {
    return rule.type === 'percentage'
      ? `${rule.value}%`
      : `₱${rule.value.toFixed(2)}`;
  };
  
  const calculateFinalPrice = (item) => {
    let finalPrice = item.price;
    const appliedRules = getAppliedRules(item);
  
    appliedRules.forEach(rule => {
      if (rule.type === 'percentage') {
        finalPrice *= (1 - rule.value / 100);
      } else {
        finalPrice -= rule.value;
      }
    });
  
    return Math.max(finalPrice, 0);
  };
  
  const getUserBasketCount = (userBasket) => {
    return userBasket.reduce((total, item) => total + item.quantity, 0);
  };
  
  const getUserBasketTotal = (userBasket) => {
    return userBasket.reduce((total, item) => total + calculateFinalPrice(item) * item.quantity, 0).toFixed(2);
  };
  
  const overallBasketCount = computed(() => {
    return allBasketItems.value.reduce((total, item) => total + item.quantity, 0);
  });
  
  const overallBasketTotal = computed(() => {
    return allBasketItems.value.reduce((total, item) => total + calculateFinalPrice(item) * item.quantity, 0).toFixed(2);
  });
  
  const updateQuantity = async (item) => {
    await basketStore.updateItemQuantity(item.id, item.quantity);
    await fetchAllBasketItems(); // Refresh the data
  };
  
  const removeItem = async (itemId) => {
    await basketStore.removeFromBasket(itemId);
    await fetchAllBasketItems(); // Refresh the data
  };
  
  const clearAllBaskets = async () => {
    if (confirm('Are you sure you want to clear all baskets? This action cannot be undone.')) {
      for (const userId in groupedBasketItems.value) {
        await basketStore.clearUserBasket(userId);
      }
      await fetchAllBasketItems(); // Refresh the data
    }
  };
  </script>
  
  