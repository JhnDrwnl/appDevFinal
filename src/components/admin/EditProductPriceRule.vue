<!-- components/admin/AddProductPriceRule.vue -->
<template>
    <div class="w-full">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Edit Product Price Rule</h2>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="productName" class="block text-sm font-medium text-gray-700 mb-1">Product</label>
          <input
            type="text"
            id="productName"
            v-model="productName"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934] focus:border-[#FF9934]"
            disabled
          />
        </div>
  
        <div>
          <label for="priceRule" class="block text-sm font-medium text-gray-700 mb-1">Price Rule</label>
          <select
            id="priceRule"
            v-model="selectedPriceRule"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934] focus:border-[#FF9934]"
          >
            <option value="" disabled>Select a price rule</option>
            <option v-for="rule in priceRules" :key="rule.id" :value="rule">
              {{ rule.name }} ({{ rule.type === 'percentage' ? rule.value + '%' : '₱' + rule.value.toFixed(2) }})
            </option>
          </select>
        </div>
  
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-2 text-gray-800">Original Price</h3>
          <p class="text-gray-600">₱{{ originalPrice.toFixed(2) }}</p>
        </div>
  
        <div v-if="selectedPriceRule" class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-2 text-gray-800">Discounted Price</h3>
          <p class="text-gray-600">₱{{ calculateDiscountedPrice().toFixed(2) }}</p>
        </div>
  
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="emit('cancel')"
            class="px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934]"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!canSubmit"
            class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#FF9934] hover:bg-[#E88820] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934] disabled:opacity-50"
          >
            Update Product Price Rule
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { defineProps, defineEmits } from 'vue'
  import { useProductPriceRuleStore } from '@/store/modules/productPriceRules'
  import { usePriceRuleStore } from '@/store/modules/priceRules'
  
  const props = defineProps({
    productPriceRule: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['save', 'cancel'])
  
  const productPriceRuleStore = useProductPriceRuleStore()
  const priceRuleStore = usePriceRuleStore()
  
  const productName = ref('')
  const originalPrice = ref(0)
  const selectedPriceRule = ref(null)
  
  const priceRules = computed(() => {
    const now = new Date()
    return priceRuleStore.priceRules.filter(rule => 
      priceRuleStore.isRuleActive(rule) || (rule.startDate > now)
    )
  })
  
  const canSubmit = computed(() => selectedPriceRule.value && selectedPriceRule.value.id !== props.productPriceRule.priceRuleId)
  
  onMounted(() => {
    productName.value = props.productPriceRule.productName
    originalPrice.value = props.productPriceRule.originalPrice
    selectedPriceRule.value = priceRules.value.find(rule => rule.id === props.productPriceRule.priceRuleId) || null
  })
  
  const calculateDiscountedPrice = () => {
    if (!selectedPriceRule.value) return originalPrice.value
  
    if (selectedPriceRule.value.type === 'percentage') {
      return originalPrice.value * (1 - selectedPriceRule.value.value / 100)
    } else {
      return Math.max(0, originalPrice.value - selectedPriceRule.value.value)
    }
  }
  
  const handleSubmit = () => {
    if (canSubmit.value) {
      const updatedProductPriceRule = {
        ...props.productPriceRule,
        priceRuleId: selectedPriceRule.value.id,
        priceRuleName: selectedPriceRule.value.name,
        discountedPrice: calculateDiscountedPrice()
      }
      
      productPriceRuleStore.updateProductPriceRule(props.productPriceRule.id, updatedProductPriceRule)
      emit('save', updatedProductPriceRule)
    }
  }
  </script>
  
  
  
  