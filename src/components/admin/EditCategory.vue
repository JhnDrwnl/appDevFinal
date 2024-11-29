<!-- components/admin/EditCategory.vue -->
<template>
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Edit Product</h1>
        <button
          @click="$emit('cancel')"
          class="text-sm text-[#0095FF] hover:text-[#0077CC]"
        >
          Back to Products
        </button>
      </div>
  
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- General Information -->
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <h2 class="text-lg font-medium text-gray-900 mb-4">General</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  v-model="product.name"
                  type="text"
                  class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <div class="mt-1 border border-gray-300 rounded-lg">
                  <div class="border-b border-gray-300 p-2">
                    <div class="flex items-center space-x-4">
                      <button
                        v-for="format in ['bold', 'italic', 'underline', 'list']"
                        :key="format"
                        class="p-1 hover:bg-gray-100 rounded"
                      >
                        <component :is="formatIcons[format]" class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <textarea
                    v-model="product.description"
                    rows="4"
                    class="block w-full p-4 focus:outline-none focus:ring-2 focus:ring-[#0095FF] rounded-b-lg"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Media -->
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Media</h2>
            <div class="grid grid-cols-4 gap-4 mb-4">
              <div
                v-for="image in product.images"
                :key="image"
                class="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
              >
                <img :src="image" class="w-full h-full object-cover" />
                <button
                  @click="removeImage(image)"
                  class="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
                >
                  <XIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
              @dragover.prevent
              @drop.prevent="handleDrop"
            >
              <div class="space-y-2">
                <div class="flex justify-center">
                  <UploadIcon class="w-10 h-10 text-gray-400" />
                </div>
                <p class="text-sm text-gray-500">
                  Drag 'n' drop some files here, or click to select files
                </p>
              </div>
            </div>
          </div>
  
          <!-- Pricing -->
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Pricing</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Base Price</label>
                <div class="mt-1 relative rounded-lg">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    $
                  </span>
                  <input
                    v-model="product.price"
                    type="number"
                    step="0.01"
                    class="block w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Discount Type</label>
                <div class="mt-1 flex items-center space-x-4">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      v-model="product.discountType"
                      value="none"
                      class="form-radio text-[#0095FF]"
                    />
                    <span class="ml-2">No Discount</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      v-model="product.discountType"
                      value="percentage"
                      class="form-radio text-[#0095FF]"
                    />
                    <span class="ml-2">Percentage %</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      v-model="product.discountType"
                      value="fixed"
                      class="form-radio text-[#0095FF]"
                    />
                    <span class="ml-2">Fixed Price</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Thumbnail -->
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Thumbnail</h2>
            <div class="aspect-video rounded-lg overflow-hidden mb-4">
              <img
                :src="product.thumbnail || '/placeholder.svg?height=200&width=300'"
                class="w-full h-full object-cover"
              />
            </div>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
              @dragover.prevent
              @drop.prevent="handleThumbnailDrop"
            >
              <div class="space-y-2">
                <div class="flex justify-center">
                  <ImageIcon class="w-10 h-10 text-gray-400" />
                </div>
                <p class="text-sm text-gray-500">
                  Drag 'n' drop some files here, or click to select files
                </p>
              </div>
            </div>
          </div>
  
          <!-- Product Details -->
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Product Details</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Categories</label>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span
                    v-for="category in product.categories"
                    :key="category"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100"
                  >
                    {{ category }}
                    <button
                      @click="removeCategory(category)"
                      class="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                </div>
                <select
                  v-model="newCategory"
                  @change="addCategory"
                  class="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
                >
                  <option value="">Add category</option>
                  <option
                    v-for="category in availableCategories"
                    :key="category"
                    :value="category"
                  >
                    {{ category }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Tags</label>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span
                    v-for="tag in product.tags"
                    :key="tag"
                    class="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100"
                  >
                    {{ tag }}
                    <button
                      @click="removeTag(tag)"
                      class="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                </div>
                <input
                  v-model="newTag"
                  @keyup.enter="addTag"
                  type="text"
                  class="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
                  placeholder="Add tags"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">In Stock</label>
                <select
                  v-model="product.inStock"
                  class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
                >
                  <option :value="true">Yes</option>
                  <option :value="false">No</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Action Buttons -->
      <div class="mt-6 flex justify-end space-x-3">
        <button
          @click="$emit('cancel')"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          @click="saveProduct"
          class="px-4 py-2 bg-[#0095FF] text-white rounded-lg hover:bg-[#0077CC]"
        >
          Save Changes
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useProductStore } from '@/store/modules/products'
  import { 
    Bold as BoldIcon, 
    Italic as ItalicIcon, 
    Underline as UnderlineIcon, 
    List as ListIcon,
    Upload as UploadIcon,
    Image as ImageIcon,
    X as XIcon
  } from 'lucide-vue-next'
  
  const props = defineProps({
    productId: {
      type: String,
      required: true
    }
  })
  
  const emit = defineEmits(['cancel', 'save'])
  
  const productStore = useProductStore()
  
  const formatIcons = {
    bold: BoldIcon,
    italic: ItalicIcon,
    underline: UnderlineIcon,
    list: ListIcon
  }
  
  const availableCategories = ['Books', 'Electronics', 'Fashion', 'Home & Garden']
  
  const product = ref({
    id: '',
    name: '',
    description: '',
    price: 0,
    categories: [],
    tags: [],
    discountType: 'none',
    inStock: true,
    date: '',
    images: [],
    thumbnail: ''
  })
  
  const newCategory = ref('')
  const newTag = ref('')
  
  onMounted(async () => {
    const loadedProduct = await productStore.getProductById(props.productId)
    if (loadedProduct) {
      product.value = { ...loadedProduct }
    } else {
      console.error('Product not found')
      // Handle error (e.g., show error message, redirect to list)
    }
  })
  
  const addCategory = () => {
    if (newCategory.value && !product.value.categories.includes(newCategory.value)) {
      product.value.categories.push(newCategory.value)
      newCategory.value = ''
    }
  }
  
  const removeCategory = (category) => {
    product.value.categories = product.value.categories.filter(c => c !== category)
  }
  
  const addTag = () => {
    if (newTag.value.trim() && !product.value.tags.includes(newTag.value.trim())) {
      product.value.tags.push(newTag.value.trim())
      newTag.value = ''
    }
  }
  
  const removeTag = (tag) => {
    product.value.tags = product.value.tags.filter(t => t !== tag)
  }
  
  const removeImage = (image) => {
    product.value.images = product.value.images.filter(img => img !== image)
  }
  
  const handleDrop = (event) => {
    // Implement file drop handling for product images
    console.log('File dropped for product images')
  }
  
  const handleThumbnailDrop = (event) => {
    // Implement thumbnail drop handling
    console.log('Thumbnail dropped')
  }
  
  const saveProduct = async () => {
    try {
      await productStore.updateProduct(product.value)
      emit('save', product.value)
    } catch (error) {
      console.error('Error updating product:', error)
      // Handle error (e.g., show error message to user)
    }
  }
  </script>