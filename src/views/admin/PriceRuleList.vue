<!-- views/admin/PriceList.vue -->
 <template>
    <div class="max-w-7xl mx-auto w-full">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div class="p-6 lg:p-8">
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-semibold text-gray-900">Price Rules</h1>
            <button
              @click="showAddPriceRule"
              class="bg-[#0095FF] text-white px-4 py-2 rounded-lg hover:bg-[#0077CC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0095FF]"
            >
              Add Price Rule
            </button>
          </div>
  
          <div v-if="currentView === 'list'">
            <div class="mb-4">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search price rules"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
              />
            </div>
  
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="rule in filteredPriceRules" :key="rule.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ rule.name }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{{ rule.type }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{{ formatValue(rule) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        :class="[
                          'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                          rule.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        ]"
                      >
                        {{ rule.active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        @click="editPriceRule(rule)"
                        class="text-[#0095FF] hover:text-[#0077CC] mr-2"
                      >
                        Edit
                      </button>
                      <button
                        @click="deletePriceRule(rule.id)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
  
          <AddPriceRule
            v-else-if="currentView === 'add'"
            @cancel="showList"
            @save="handleSavePriceRule"
          />
  
          <EditPriceRule
            v-else-if="currentView === 'edit'"
            :priceRule="selectedPriceRule"
            @cancel="showList"
            @save="handleUpdatePriceRule"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import AddPriceRule from '@/components/admin/AddPriceRule.vue'
  import EditPriceRule from '@/components/admin/EditPriceRule.vue'
  
  const currentView = ref('list')
  const searchQuery = ref('')
  const selectedPriceRule = ref(null)
  
  const priceRules = ref([
    { id: 1, name: 'Summer Sale', type: 'percentage', value: 20, active: true },
    { id: 2, name: 'Clearance', type: 'fixed', value: 5, active: true },
    { id: 3, name: 'VIP Discount', type: 'percentage', value: 15, active: false },
  ])
  
  const filteredPriceRules = computed(() => {
    return priceRules.value.filter(rule =>
      rule.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })
  
  const formatValue = (rule) => {
    if (rule.type === 'percentage') {
      return `${rule.value}%`
    } else if (rule.type === 'fixed') {
      return `$${rule.value.toFixed(2)}`
    }
    return rule.value
  }
  
  const showAddPriceRule = () => {
    currentView.value = 'add'
  }
  
  const showList = () => {
    currentView.value = 'list'
    selectedPriceRule.value = null
  }
  
  const editPriceRule = (rule) => {
    selectedPriceRule.value = { ...rule }
    currentView.value = 'edit'
  }
  
  const deletePriceRule = async (id) => {
    if (confirm('Are you sure you want to delete this price rule?')) {
      priceRules.value = priceRules.value.filter(rule => rule.id !== id)
    }
  }
  
  const handleSavePriceRule = (newRule) => {
    newRule.id = Math.max(...priceRules.value.map(rule => rule.id)) + 1
    priceRules.value.push(newRule)
    showList()
  }
  
  const handleUpdatePriceRule = (updatedRule) => {
    const index = priceRules.value.findIndex(rule => rule.id === updatedRule.id)
    if (index !== -1) {
      priceRules.value[index] = updatedRule
    }
    showList()
  }
  </script>