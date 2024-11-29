
<!-- views/admin/EditPriceRule.vue -->
 <template>
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-gray-900">Edit Price Rule</h2>
        <button
          @click="$emit('cancel')"
          class="text-sm text-[#0095FF] hover:text-[#0077CC]"
        >
          Back to Price Rules
        </button>
      </div>
  
      <form @submit.prevent="savePriceRule" class="space-y-6">
        <div>
          <label for="ruleName" class="block text-sm font-medium text-gray-700">Rule Name</label>
          <input
            id="ruleName"
            v-model="editedRule.name"
            type="text"
            required
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
          />
        </div>
  
        <div>
          <label for="ruleType" class="block text-sm font-medium text-gray-700">Rule Type</label>
          <select
            id="ruleType"
            v-model="editedRule.type"
            required
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
          >
            <option value="percentage">Percentage Discount</option>
            <option value="fixed">Fixed Amount Discount</option>
          </select>
        </div>
  
        <div>
          <label for="ruleValue" class="block text-sm font-medium text-gray-700">
            {{ editedRule.type === 'percentage' ? 'Discount Percentage' : 'Discount Amount' }}
          </label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">
                {{ editedRule.type === 'percentage' ? '%' : '$' }}
              </span>
            </div>
            <input
              id="ruleValue"
              v-model.number="editedRule.value"
              type="number"
              required
              min="0"
              :max="editedRule.type === 'percentage' ? 100 : undefined"
              step="0.01"
              class="block w-full pl-7 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
            />
          </div>
        </div>
  
        <div>
          <label for="ruleStatus" class="block text-sm font-medium text-gray-700">Status</label>
          <div class="mt-2">
            <label class="inline-flex items-center">
              <input
                id="ruleStatus"
                v-model="editedRule.active"
                type="checkbox"
                class="form-checkbox h-5 w-5 text-[#0095FF]"
              />
              <span class="ml-2 text-gray-700">Active</span>
            </label>
          </div>
        </div>
  
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="$emit('cancel')"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-[#0095FF] text-white rounded-lg hover:bg-[#0077CC]"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const props = defineProps({
    priceRule: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['cancel', 'save'])
  
  const editedRule = ref({ ...props.priceRule })
  
  const savePriceRule = () => {
    emit('save', { ...editedRule.value })
  }
  </script>