<!-- views/admin/ProductList.vue -->
<template>
  <div class="w-full">
    <Alert 
      v-if="showAlert" 
      :type="alertType" 
      :dismissible="true" 
      @update:modelValue="showAlert = $event"
    >
      {{ alertMessage }}
    </Alert>

    <div v-if="currentView === 'list'">
      <div class="flex items-center justify-between mb-6">
        <div class="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search Product"
            v-model="searchQuery"
            class="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
          />
          <span class="absolute left-3 top-2.5 text-gray-400">
            <SearchIcon class="w-5 h-5" />
          </span>
        </div>
        <button
          @click="showAddProduct"
          class="bg-[#FF9934] text-white px-4 py-2 rounded-full hover:bg-[#E88820] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934]"
        >
          Add Product
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto relative">
          <table class="w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th @click="sort('name')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                  Products
                  <SortIcon v-if="sortColumn === 'name'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="inline-block w-4 h-4 ml-1" />
                </th>
                <th @click="sort('categories')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                  Categories
                  <SortIcon v-if="sortColumn === 'categories'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="inline-block w-4 h-4 ml-1" />
                </th>
                <th @click="sort('date')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                  Date
                  <SortIcon v-if="sortColumn === 'date'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="inline-block w-4 h-4 ml-1" />
                </th>
                <th @click="sort('stock')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                  Status
                  <SortIcon v-if="sortColumn === 'stock'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="inline-block w-4 h-4 ml-1" />
                </th>
                <th @click="sort('price')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                  Original Price
                  <SortIcon v-if="sortColumn === 'price'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="inline-block w-4 h-4 ml-1" />
                </th>
                <th @click="sort('finalPrice')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                  Final Price
                  <SortIcon v-if="sortColumn === 'finalPrice'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="inline-block w-4 h-4 ml-1" />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Rules
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in paginatedProducts" :key="product.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img class="h-10 w-10 rounded-lg object-cover" :src="product.thumbnailURL || '/placeholder.svg?height=40&width=40'" :alt="product.name" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">
                    {{ product.categories.join(', ') }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(product.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                      product.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ product.stockQuantity > 0 ? `In Stock (${product.stockQuantity})` : 'Out of Stock' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₱{{ product.price.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₱{{ calculateFinalPrice(product).toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div v-if="getAppliedRules(product).length > 0">
                    <div v-for="rule in getAppliedRules(product)" :key="rule.id">
                      {{ rule.isProductRule ? 'Product' : 'Category' }}: {{ rule.name }} ({{ formatRuleValue(rule) }})
                    </div>
                  </div>
                  <div v-else>N/A</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex space-x-4">
                    <button
                      @click="showProductDetails(product.id)"
                      class="text-blue-600 hover:text-blue-800 focus:outline-none"
                      title="View"
                    >
                      <EyeIcon class="h-5 w-5" />
                    </button>
                    <button
                      @click="showEditProduct(product.id)"
                      class="text-green-600 hover:text-green-800 focus:outline-none"
                      title="Edit"
                    >
                      <PencilSquareIcon class="h-5 w-5" />
                    </button>
                    <button
                      @click="confirmDeleteProduct(product.id)"
                      class="text-red-600 hover:text-red-800 focus:outline-none"
                      title="Delete"
                    >
                      <TrashIcon class="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex items-center justify-between mt-6">
        <div class="text-sm text-gray-500">
          Rows per page: 
          <select v-model="rowsPerPage" class="ml-2 border-gray-300 rounded-md">
            <option>5</option>
            <option>10</option>
            <option>25</option>
          </select>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeftIcon class="h-5 w-5" />
          </button>
          <span class="text-sm text-gray-500">
            {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRightIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <AddProduct 
      v-else-if="currentView === 'add'" 
      @cancel="showList" 
      @saved="handleProductSaved" 
    />

    <EditProduct 
      v-else-if="currentView === 'edit'" 
      :productId="editProductId" 
      @cancel="showList" 
      @save="handleUpdateProduct" 
    />

    <ViewProduct
      v-else-if="currentView === 'view'"
      :product="selectedProduct"
      @back="showList"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Confirm Deletion</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
          </div>
          <div class="items-center px-4 py-3">
            <button
              @click="deleteProduct"
              class="px-4 py-2 bg-[#FF9934] text-white text-base font-medium rounded-full w-full shadow-sm hover:bg-[#E88820] focus:outline-none focus:ring-2 focus:ring-[#FF9934] mb-2"
            >
              Delete
            </button>
            <button
              @click="cancelDelete"
              class="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-full w-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useProductStore } from '@/store/modules/products'
import { useProductPriceRuleStore } from '@/store/modules/productPriceRules'
import { usePriceRuleStore } from '@/store/modules/priceRules'
import { useCategoryStore } from '@/store/modules/categories'
import { storeToRefs } from 'pinia'
import { 
  MagnifyingGlassIcon as SearchIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  ArrowsUpDownIcon as SortIcon
} from '@heroicons/vue/24/outline'
import AddProduct from '@/components/admin/AddProduct.vue'
import EditProduct from '@/components/admin/EditProduct.vue'
import ViewProduct from '@/components/admin/ViewProduct.vue'
import Alert from '@/components/common/Alert.vue'

const productStore = useProductStore()
const productPriceRuleStore = useProductPriceRuleStore()
const priceRuleStore = usePriceRuleStore()
const categoryStore = useCategoryStore()
const { products } = storeToRefs(productStore)

const currentView = ref('list')
const searchQuery = ref('')
const rowsPerPage = ref(10)
const currentPage = ref(1)
const editProductId = ref(null)
const selectedProduct = ref(null)
const showDeleteModal = ref(false)
const productToDeleteId = ref(null)
const sortColumn = ref('name')
const sortDirection = ref('asc')

// Alert related refs
const showAlert = ref(false)
const alertType = ref('success')
const alertMessage = ref('')
const alertTimer = ref(null)

const filteredProducts = computed(() => {
  return products.value.filter(product =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    product.categories.some(category => category.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

const sortedProducts = computed(() => {
  return [...filteredProducts.value].sort((a, b) => {
    let comparison = 0
    
    if (sortColumn.value === 'stock') {
      comparison = (a.stockQuantity || 0) - (b.stockQuantity || 0)
    } else if (sortColumn.value === 'categories') {
      comparison = a.categories.join(', ').localeCompare(b.categories.join(', '))
    } else if (sortColumn.value === 'price') {
      comparison = a.price - b.price
    } else if (sortColumn.value === 'finalPrice') {
      comparison = calculateFinalPrice(a) - calculateFinalPrice(b)
    } else {
      if (a[sortColumn.value] < b[sortColumn.value]) comparison = -1
      if (a[sortColumn.value] > b[sortColumn.value]) comparison = 1
    }
    
    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

const totalPages = computed(() => Math.ceil(sortedProducts.value.length / rowsPerPage.value))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return sortedProducts.value.slice(start, end)
})

onMounted(async () => {
  try {
    await Promise.all([
      productStore.fetchProducts(),
      productPriceRuleStore.fetchProductPriceRules(),
      priceRuleStore.fetchPriceRules(),
      categoryStore.fetchCategories()
    ])
  } catch (error) {
    showAlertMessage(`Error fetching data: ${error.message}`, 'error')
  }
})

onUnmounted(() => {
  clearAlertTimer()
})

watch(rowsPerPage, () => {
  currentPage.value = 1
})

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

const showAddProduct = () => {
  currentView.value = 'add'
}

const showList = () => {
  currentView.value = 'list'
  selectedProduct.value = null
  editProductId.value = null
}

const showEditProduct = (productId) => {
  editProductId.value = productId
  currentView.value = 'edit'
}

const showAlertMessage = (message, type = 'success') => {
  showAlert.value = true
  alertType.value = type
  alertMessage.value = message
  clearAlertTimer()
  alertTimer.value = setTimeout(() => {
    showAlert.value = false
  }, 3000) // Hide alert after 3 seconds
}

const clearAlertTimer = () => {
  if (alertTimer.value) {
    clearTimeout(alertTimer.value)
    alertTimer.value = null
  }
}

const handleProductSaved = async (result) => {
  if (result.success && result.product) {
    await productStore.fetchProducts()
    currentPage.value = 1
    showAlertMessage('Product added successfully')
    showList()
  } else {
    console.error('Failed to add product:', result.error)
    showAlertMessage(`Failed to add product: ${result.error}`, 'error')
  }
}

const handleUpdateProduct = async (productId, updatedData) => {
  const result = await productStore.updateProduct(productId, updatedData)
  if (result.success) {
    showAlertMessage('Product updated successfully')
  } else {
    showAlertMessage('Failed to update product. Please try again.', 'error')
  }
  showList()
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const showProductDetails = (productId) => {
  selectedProduct.value = products.value.find(p => p.id === productId)
  currentView.value = 'view'
}

const confirmDeleteProduct = (productId) => {
  productToDeleteId.value = productId
  showDeleteModal.value = true
}

const deleteProduct = async () => {
  if (productToDeleteId.value) {
    const result = await productStore.deleteProduct(productToDeleteId.value)
    if (result.success) {
      showAlertMessage('Product deleted successfully')
    } else {
      showAlertMessage('Failed to delete product. Please try again.', 'error')
    }
    showDeleteModal.value = false
    productToDeleteId.value = null
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  productToDeleteId.value = null
}

const sort = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

const getAppliedRules = (product) => {
  const productRules = productPriceRuleStore.productPriceRules
    .filter(rule => rule.productId === product.id)
    .map(rule => {
      const priceRule = priceRuleStore.priceRules.find(pr => pr.id === rule.priceRuleId)
      return {
        id: rule.id,
        name: priceRule ? priceRule.name : 'Unknown Rule',
        value: priceRule ? priceRule.value : 0,
        type: priceRule ? priceRule.type : 'fixed',
        isProductRule: true
      }
    })

  const categoryRules = product.categoryIds.flatMap(categoryId => {
    const category = categoryStore.getCategoryById(categoryId)
    if (category && category.priceRule) {
      return [{
        id: category.priceRule.id,
        name: `${category.name} - ${category.priceRule.priceRuleName}`,
        value: category.priceRule.priceRuleValue,
        type: category.priceRule.priceRuleType,
        isProductRule: false
      }]
    }
    return []
  })

  return [...productRules, ...categoryRules]
}

const calculateFinalPrice = (product) => {
  let finalPrice = product.price
  const appliedRules = getAppliedRules(product)

  appliedRules.forEach(rule => {
    if (rule.type === 'percentage') {
      finalPrice *= (1 - rule.value / 100)
    } else {
      finalPrice -= rule.value
    }
  })

  return Math.max(finalPrice, 0) // Ensure the price doesn't go below 0
}

const formatRuleValue = (rule) => {
  return rule.type === 'percentage'
    ? `${rule.value}%`
    : `₱${rule.value.toFixed(2)}`
}
</script>

<style scoped>
.overflow-x-auto {
  overflow-x: auto;
  position: relative;
}

table {
  position: relative;
  z-index: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

