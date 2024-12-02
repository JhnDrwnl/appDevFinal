<!-- components/admin/AddCategoryPriceRule.vue -->
<template>
  <div class="w-full">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="relative w-full">
        <label for="categorySearch" class="block text-sm font-medium text-gray-700 mb-1">Search Category</label>
        <div class="relative">
          <input
            type="text"
            id="categorySearch"
            v-model="categorySearch"
            @input="debouncedSearchCategories"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934] focus:border-[#FF9934]"
            placeholder="Start typing to search categories"
            :disabled="!!editingRule"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          <div v-if="loading" class="absolute right-3 top-2.5 text-gray-400">
            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
        <div v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</div>
        <div v-if="searchResults.length > 0" class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm left-0 right-0">
          <div
            v-for="category in searchResults"
            :key="category.id"
            @click="selectCategory(category)"
            class="cursor-pointer select-none relative py-2 px-4 hover:bg-gray-100"
          >
            <div class="font-medium">{{ category.name }}</div>
            <div v-if="category.parents && category.parents.length > 0" class="text-sm text-gray-500">
              Parent: {{ formatParents(category.parents) }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedCategory" class="bg-gray-50 p-4 rounded-lg relative">
        <h3 class="text-lg font-semibold mb-2 text-gray-800">Selected Category</h3>
        <p class="text-gray-600">{{ selectedCategory.name }}</p>
        <p v-if="selectedCategory.parents && selectedCategory.parents.length > 0" class="text-sm text-gray-500">
          Parent: {{ formatParents(selectedCategory.parents) }}
        </p>
        <button
          v-if="!editingRule"
          @click="cancelSelectedCategory"
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <div>
        <label for="priceRule" class="block text-sm font-medium text-gray-700 mb-1">Price Rule</label>
        <select
          id="priceRule"
          v-model="selectedPriceRule"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934] focus:border-[#FF9934]"
        >
          <option value="" disabled selected>Please select a price rule</option>
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
          {{ editingRule ? 'Update' : 'Add' }} Category Price Rule
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCategoryPriceRuleStore } from '@/store/modules/categoryPriceRules'
import { usePriceRuleStore } from '@/store/modules/priceRules'
import debounce from 'lodash/debounce'

const props = defineProps({
  editingRule: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'cancel'])

const categoryPriceRuleStore = useCategoryPriceRuleStore()
const priceRuleStore = usePriceRuleStore()

const categorySearch = ref('')
const searchResults = ref([])
const selectedCategory = ref(null)
const selectedPriceRule = ref(null)
const loading = ref(false)
const error = ref(null)

const priceRules = computed(() => {
  const now = new Date()
  return priceRuleStore.priceRules.filter(rule => 
    priceRuleStore.isRuleActive(rule) || (rule.startDate > now)
  )
})

const canSubmit = computed(() => selectedCategory.value && selectedPriceRule.value)

watch(() => props.editingRule, (newValue) => {
  if (newValue) {
    selectedCategory.value = { id: newValue.categoryId, name: newValue.categoryName }
    selectedPriceRule.value = priceRules.value.find(rule => rule.id === newValue.priceRuleId)
    categorySearch.value = newValue.categoryName
  }
}, { immediate: true })

const searchCategories = async () => {
  if (categorySearch.value.length > 0) {
    loading.value = true
    error.value = null
    try {
      const results = await categoryPriceRuleStore.searchCategories(categorySearch.value)
      searchResults.value = results
      if (results.length === 0) {
        error.value = 'No categories found'
      }
    } catch (err) {
      error.value = 'Error searching categories. Please try again.'
      console.error(err)
    } finally {
      loading.value = false
    }
  } else {
    searchResults.value = []
    error.value = null
  }
}

const debouncedSearchCategories = debounce(searchCategories, 300)

const selectCategory = (category) => {
  selectedCategory.value = category
  categorySearch.value = category.name
  searchResults.value = []
}

const cancelSelectedCategory = () => {
  selectedCategory.value = null
  categorySearch.value = ''
}

const handleSubmit = async () => {
  if (canSubmit.value) {
    const categoryPriceRule = {
      categoryId: selectedCategory.value.id,
      categoryName: selectedCategory.value.name,
      priceRuleId: selectedPriceRule.value.id,
      priceRuleName: selectedPriceRule.value.name,
      priceRuleValue: selectedPriceRule.value.value,
      priceRuleType: selectedPriceRule.value.type
    }
    
    if (props.editingRule) {
      categoryPriceRule.id = props.editingRule.id
    }
    
    emit('save', categoryPriceRule)
  }
}

const formatParents = (parents) => {
  return parents.map(parent => parent.name).join(' > ')
}
</script>

<style scoped>
.rounded-full {
  border-radius: 9999px;
}
</style>