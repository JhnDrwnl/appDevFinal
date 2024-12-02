<!-- components/admin/AddPriceRule.vue -->
<template>
    <div class="w-full">
      <h2 class="text-2xl font-semibold text-gray-900 mb-6">Add Price Rule</h2>
    
      <form @submit.prevent="savePriceRule" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="ruleName" class="block text-sm font-medium text-gray-700">Rule Name</label>
            <input
              id="ruleName"
              v-model="newRule.name"
              type="text"
              required
              @input="clearError"
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
              placeholder="Enter rule name"
            />
          </div>
    
          <div>
            <label for="ruleType" class="block text-sm font-medium text-gray-700">Rule Type</label>
            <select
              id="ruleType"
              v-model="newRule.type"
              required
              class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
            >
              <option value="percentage">Percentage Discount</option>
              <option value="fixed">Fixed Amount Discount</option>
            </select>
          </div>
        </div>
    
        <div class="w-full">
          <label for="ruleValue" class="block text-sm font-medium text-gray-700">
            {{ newRule.type === 'percentage' ? 'Discount Percentage' : 'Discount Amount' }}
          </label>
          <div class="mt-1 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500">{{ newRule.type === 'percentage' ? '%' : '₱' }}</span>
            </div>
            <input
              id="ruleValue"
              v-model.number="newRule.value"
              type="number"
              required
              min="0"
              :max="newRule.type === 'percentage' ? 100 : undefined"
              step="0.01"
              class="block w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
              :placeholder="newRule.type === 'percentage' ? 'Enter percentage' : '0.00'"
            />
          </div>
        </div>
    
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700">Start Date and Time</label>
            <div class="mt-1 relative">
              <input
                id="startDate"
                :value="formattedStartDateTime"
                type="text"
                readonly
                @click="toggleStartCalendar"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934] cursor-pointer"
              />
              <button
                type="button"
                @click="toggleStartCalendar"
                class="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <Calendar
              v-if="showStartCalendar"
              :selected-date="newRule.startDate"
              @select-date="selectStartDate"
              @close="showStartCalendar = false"
            />
          </div>
    
          <div>
            <label for="endDate" class="block text-sm font-medium text-gray-700">End Date and Time</label>
            <div class="mt-1 relative">
              <input
                id="endDate"
                :value="formattedEndDateTime"
                type="text"
                readonly
                @click="toggleEndCalendar"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934] cursor-pointer"
              />
              <button
                type="button"
                @click="toggleEndCalendar"
                class="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <Calendar
              v-if="showEndCalendar"
              :selected-date="newRule.endDate"
              @select-date="selectEndDate"
              @close="showEndCalendar = false"
            />
          </div>
        </div>
    
        <div class="flex justify-end space-x-3">
          <button
            @click="$emit('cancel')"
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-4 py-2 bg-[#FF9934] text-white rounded-full hover:bg-[#E88820] disabled:opacity-50 transition-colors duration-200"
          >
            {{ isLoading ? 'Saving...' : 'Save Price Rule' }}
          </button>
        </div>
      </form>
    
      <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
        {{ error }}
      </div>
    </div>
    </template>
    
    <script setup>
    import { ref, computed } from 'vue'
    import { usePriceRuleStore } from '@/store/modules/priceRules'
    import Calendar from '@/components/common/Calendar.vue'
    
    const emit = defineEmits(['cancel', 'save'])
    const priceRuleStore = usePriceRuleStore()
    
    const newRule = ref({
      name: '',
      type: 'percentage',
      value: 0,
      startDate: new Date(),
      endDate: new Date()
    })
    
    const showStartCalendar = ref(false)
    const showEndCalendar = ref(false)
    
    const isLoading = computed(() => priceRuleStore.loading)
    const error = computed(() => priceRuleStore.error)
    
    const formattedStartDateTime = computed(() => formatDateTime(newRule.value.startDate))
    const formattedEndDateTime = computed(() => formatDateTime(newRule.value.endDate))
    
    function formatDateTime(date) {
      return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
    
    function toggleStartCalendar() {
      showStartCalendar.value = !showStartCalendar.value
      showEndCalendar.value = false
    }
    
    function toggleEndCalendar() {
      showEndCalendar.value = !showEndCalendar.value
      showStartCalendar.value = false
    }
    
    function selectStartDate(date) {
      newRule.value.startDate = date
      showStartCalendar.value = false
    }
    
    function selectEndDate(date) {
      newRule.value.endDate = date
      showEndCalendar.value = false
    }
    
    function clearError() {
      priceRuleStore.clearError()
    }
    
    async function savePriceRule() {
      const result = await priceRuleStore.addPriceRule(newRule.value)
      if (result.success) {
        emit('save', result.priceRule)
        newRule.value = { 
          name: '', 
          type: 'percentage', 
          value: 0, 
          startDate: new Date(),
          endDate: new Date()
        }
      }
    }
    </script>
    
    <style scoped>
    .rounded-full {
      border-radius: 9999px;
    }
    </style>
    
    