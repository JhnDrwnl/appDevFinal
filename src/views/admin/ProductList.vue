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
              class="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
            />
            <span class="absolute left-3 top-2.5 text-gray-400">
              <SearchIcon class="w-5 h-5" />
            </span>
          </div>
          <button
            @click="showAddProduct"
            class="bg-[#0095FF] text-white px-4 py-2 rounded-lg hover:bg-[#0077CC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0095FF]"
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
                  <th @click="sort('date')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    Date
                    <SortIcon v-if="sortColumn === 'date'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="inline-block w-4 h-4 ml-1" />
                  </th>
                  <th @click="sort('stock')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    Status
                    <SortIcon v-if="sortColumn === 'stock'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="inline-block w-4 h-4 ml-1" />
                  </th>
                  <th @click="sort('price')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    Price
                    <SortIcon v-if="sortColumn === 'price'" :class="{ 'transform rotate-180': sortDirection === 'desc' }" class="inline-block w-4 h-4 ml-1" />
                  </th>
                  <th class="px-6 py-3 w-px"></th>
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
                        <div class="text-sm text-gray-500">{{ product.category }}</div>
                      </div>
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
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="relative">
                      <button @click="toggleActions(product.id, $event)" class="text-gray-400 hover:text-gray-500">
                        <MoreVerticalIcon class="h-5 w-5" />
                      </button>
                      <div v-if="activeProductId === product.id" 
                           class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-50" 
                           role="menu" 
                           aria-orientation="vertical"
                           :style="dropdownStyle"
                           :data-product-id="product.id">
                        <div class="py-1" role="none">
                          <button
                            @click="showProductDetails(product.id)"
                            class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full"
                          >
                            <EyeIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                            View
                          </button>
                          <button
                            @click="showEditProduct(product.id)"
                            class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full"
                          >
                            <PencilIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                            Edit
                          </button>
                          <button
                            @click="confirmDeleteProduct(product.id)"
                            class="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full"
                          >
                            <TrashIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                            Delete
                          </button>
                        </div>
                      </div>
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
                class="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
              >
                Delete
              </button>
              <button
                @click="cancelDelete"
                class="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
  import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
  import { useProductStore } from '@/store/modules/products'
  import { storeToRefs } from 'pinia'
  import { 
    Search as SearchIcon,
    MoreVertical as MoreVerticalIcon,
    Pencil as PencilIcon,
    Trash as TrashIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Eye as EyeIcon,
    ArrowUpDown as SortIcon
  } from 'lucide-vue-next'
  import AddProduct from '@/components/admin/AddProduct.vue'
  import EditProduct from '@/components/admin/EditProduct.vue'
  import ViewProduct from '@/components/admin/ViewProduct.vue'
  import Alert from '@/components/common/Alert.vue'
  
  const productStore = useProductStore()
  const { products } = storeToRefs(productStore)
  
  const currentView = ref('list')
  const searchQuery = ref('')
  const rowsPerPage = ref(10)
  const currentPage = ref(1)
  const activeProductId = ref(null)
  const editProductId = ref(null)
  const selectedProduct = ref(null)
  const showDeleteModal = ref(false)
  const productToDeleteId = ref(null)
  const sortColumn = ref('name')
  const sortDirection = ref('asc')
  const dropdownStyle = ref({})
  
  // Alert related refs
  const showAlert = ref(false)
  const alertType = ref('success')
  const alertMessage = ref('')
  const alertTimer = ref(null)
  
  const filteredProducts = computed(() => {
    return products.value.filter(product =>
      product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })
  
  const sortedProducts = computed(() => {
    return [...filteredProducts.value].sort((a, b) => {
      let comparison = 0
      
      if (sortColumn.value === 'stock') {
        comparison = (a.stockQuantity || 0) - (b.stockQuantity || 0)
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
    await productStore.fetchProducts()
    document.addEventListener('click', handleClickOutside)
  })
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
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
      // Instead of manually adding the product to the list,
      // we'll re-fetch all products to ensure consistency
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
  
  const toggleActions = (productId, event) => {
    if (activeProductId.value === productId) {
      activeProductId.value = null
      dropdownStyle.value = {}
    } else {
      activeProductId.value = productId
      nextTick(() => {
        const button = event.target.closest('button')
        const buttonRect = button.getBoundingClientRect()
        const tableRect = button.closest('.overflow-x-auto').getBoundingClientRect()
        
        dropdownStyle.value = {
          position: 'fixed',
          top: `${buttonRect.bottom}px`,
          right: `${window.innerWidth - tableRect.right}px`,
          zIndex: '50',
        }
      })
    }
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
  
  const handleClickOutside = (event) => {
    if (activeProductId.value) {
      const dropdown = document.querySelector(`[data-product-id="${activeProductId.value}"]`)
      if (dropdown && !dropdown.contains(event.target) && !event.target.closest('button')) {
        activeProductId.value = null
        dropdownStyle.value = {}
      }
    }
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
  
  .origin-top-right {
    transform-origin: top right;
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