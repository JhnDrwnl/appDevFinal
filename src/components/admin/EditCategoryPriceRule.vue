<!-- components/admin/EditCategoryPriceRule.vue -->
<template>
  <div class="w-full">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Edit Category Price Rule</h2>
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <input
          type="text"
          :value="categoryPriceRule.categoryName"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
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

      <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934]"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="!canSubmit"
          class="px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#FF9934] hover:bg-[#E88820] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934] disabled:opacity-50"
        >
          Update Category Price Rule
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCategoryPriceRuleStore } from '@/store/modules/categoryPriceRules'
import { usePriceRuleStore } from '@/store/modules/priceRules'

const props = defineProps({
  categoryPriceRule: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'cancel'])

const categoryPriceRuleStore = useCategoryPriceRuleStore()
const priceRuleStore = usePriceRuleStore()

const selectedPriceRule = ref(null)

const priceRules = computed(() => {
  const now = new Date()
  return priceRuleStore.priceRules.filter(rule => 
    priceRuleStore.isRuleActive(rule) || (rule.startDate > now)
  )
})

const canSubmit = computed(() => selectedPriceRule.value && selectedPriceRule.value.id !== props.categoryPriceRule.priceRuleId)

onMounted(() => {
  selectedPriceRule.value = priceRules.value.find(rule => rule.id === props.categoryPriceRule.priceRuleId) || null
})

const handleSubmit = async () => {
  if (canSubmit.value) {
    const updatedCategoryPriceRule = {
      ...props.categoryPriceRule,
      priceRuleId: selectedPriceRule.value.id,
      priceRuleName: selectedPriceRule.value.name,
      priceRuleValue: selectedPriceRule.value.value,
      priceRuleType: selectedPriceRule.value.type
    }
    
    const result = await categoryPriceRuleStore.updateCategoryPriceRule(props.categoryPriceRule.id, updatedCategoryPriceRule)
    if (result.success) {
      emit('save', updatedCategoryPriceRule)
    } else {
      console.error(result.error)
      // You might want to add error handling here, such as displaying an error message to the user
    }
  }
}
</script>

<style scoped>
.rounded-full {
  border-radius: 9999px;
}
</style>