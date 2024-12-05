<!-- components/admin/EditProduct.vue -->
<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Edit Product</h1>
      <button
        @click="$emit('cancel')"
        class="text-sm text-[#FF9934] hover:text-[#E08824] rounded-full px-4 py-2 transition-colors duration-200"
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
                class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
                placeholder="Product name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <div class="mt-1 border border-gray-300 rounded-lg">
                <div class="border-b border-gray-300 p-2">
                  <div class="flex items-center space-x-4">
                    <button
                      v-for="(item, index) in editorButtons"
                      :key="index"
                      @click.prevent="toggleFormat(item)"
                      :class="[
                        'p-1.5 rounded transition-colors',
                        { 'bg-gray-200': activeFormats[item.name] }
                      ]"
                      :title="item.name"
                    >
                      <component :is="item.icon" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <editor-content 
                  :editor="editor" 
                  class="prose max-w-none p-4 min-h-[120px] focus:outline-none description-editor"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Media -->
        <div class="bg-white p-6 rounded-lg border border-gray-200">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Media</h2>
          <div class="grid grid-cols-4 gap-4 mb-4">
            <div
              v-for="(image, index) in product.images"
              :key="index"
              class="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
            >
              <img :src="image.url" class="w-full h-full object-cover" alt="Product image" />
              <button
                @click="removeImage(index)"
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
            @click="$refs.fileInput.click()"
          >
            <input
              type="file"
              ref="fileInput"
              class="hidden"
              @change="handleFileSelect"
              accept="image/*"
              multiple
            />
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
                  ₱
                </span>
                <input
                  v-model="product.price"
                  type="number"
                  step="0.01"
                  min="0"
                  class="block w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
                  placeholder="0.00"
                />
              </div>
            </div>
            <!-- Stock Section -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Stock Quantity</label>
              <div class="mt-1">
                <input
                  v-model="product.stockQuantity"
                  type="number"
                  min="0"
                  class="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
                  placeholder="Enter stock quantity"
                />
              </div>
              <p class="mt-1 text-sm" :class="stockStatus.color">
                {{ stockStatus.text }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-6">
        <!-- Thumbnail -->
        <div class="bg-white p-6 rounded-lg border border-gray-200">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Thumbnail</h2>
          <div class="relative aspect-video rounded-lg overflow-hidden mb-4">
            <div v-if="!thumbnailPreview && !product.thumbnail" class="w-full h-full bg-gray-100 flex items-center justify-center">
              <ImageIcon class="w-12 h-12 text-gray-400" />
            </div>
            <img
              v-else
              :src="thumbnailPreview || product.thumbnail"
              class="w-full h-full object-cover"
              alt="Product thumbnail"
            />
            <button
              v-if="thumbnailPreview || product.thumbnail"
              @click="removeThumbnail"
              class="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
            >
              <XIcon class="w-4 h-4" />
            </button>
          </div>
          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
            @dragover.prevent
            @drop.prevent="handleThumbnailDrop"
            @click="$refs.thumbnailInput.click()"
          >
            <input
              type="file"
              ref="thumbnailInput"
              class="hidden"
              @change="handleThumbnailSelect"
              accept="image/*"
            />
            <div class="space-y-2">
              <div class="flex justify-center">
                <UploadIcon class="w-10 h-10 text-gray-400" />
              </div>
              <p class="text-sm text-gray-500">
                Drag 'n' drop a file here, or click to select a file
              </p>
            </div>
          </div>
        </div>

        <!-- Product Details -->
        <div class="bg-white p-6 rounded-lg border border-gray-200">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Product Details</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div class="bg-white border border-gray-300 rounded-lg p-4">
                <div class="mb-3 p-2 bg-gray-50 border border-gray-200 rounded-md">
                  <span class="text-sm text-gray-500">Selected Categories:</span>
                  <span class="ml-2 font-medium">{{ selectedCategoryNames }}</span>
                </div>
                <div v-if="categoryStore.loading" class="text-center py-4">
                  Loading categories...
                </div>
                <div v-else-if="categoryStore.error" class="text-center py-4 text-red-600">
                  {{ categoryStore.error }}
                </div>
                <div v-else class="tree-container font-mono max-h-60 overflow-y-auto">
                  <div v-if="categoryStore.categories.length === 0" class="text-center py-4 text-gray-500">
                    No categories available
                  </div>
                  <TreeNode
                    v-for="category in rootCategories"
                    :key="category.id"
                    :node="category"
                    :level="0"
                    :selected-ids="product.categoryIds"
                    :disabled-id="null"
                    :view-only="false"
                    @select-parent="toggleCategory"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mt-6 flex justify-end space-x-3">
      <button
        @click="$emit('cancel')"
        class="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors duration-200"
      >
        Cancel
      </button>
      <button
        @click="saveProduct"
        :disabled="isSaving"
        class="px-4 py-2 bg-[#FF9934] text-white rounded-full hover:bg-[#E08824] disabled:opacity-50 transition-colors duration-200"
      >
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>

    <!-- Error message display -->
    <p v-if="error" class="mt-4 text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, reactive } from 'vue'
import { useProductStore } from '@/store/modules/products'
import { useCategoryStore } from '@/store/modules/categories'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import TreeNode from './TreeNode.vue'
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
const categoryStore = useCategoryStore()

const product = ref({
  name: '',
  description: '',
  price: '',
  stockQuantity: '', 
  date: new Date().toISOString().split('T')[0],
  categoryIds: [],
  images: [],
  thumbnail: null
})

const thumbnailFile = ref(null)
const thumbnailPreview = ref(null)
const isSaving = ref(false)
const error = ref(null)

const activeFormats = reactive({
  bold: false,
  italic: false,
  underline: false,
  bulletList: false
})

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      bold: false,
      italic: false,
      bulletList: false,
      listItem: false,
      history: true,
      dropcursor: true,
      gapcursor: true,
      hardBreak: true
    }),
    Bold.configure({
      HTMLAttributes: {
        class: 'font-bold'
      }
    }),
    Italic.configure({
      HTMLAttributes: {
        class: 'italic'
      }
    }),
    Underline.configure({
      HTMLAttributes: {
        class: 'underline'
      }
    }),
    BulletList.configure({
      HTMLAttributes: {
        class: 'list-disc pl-4'
      },
      keepMarks: true,
      keepAttributes: true
    }),
    ListItem.configure({
      HTMLAttributes: {
        class: 'list-item'
      }
    })
  ],
  content: '',
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose focus:outline-none max-w-none',
    }
  },
  onUpdate: ({ editor }) => {
    if (product.value) {
      product.value.description = editor.getHTML()
    }
    updateActiveFormats()
  },
  onSelectionUpdate: () => {
    updateActiveFormats()
  }
})

const updateActiveFormats = () => {
  if (editor.value) {
    activeFormats.bold = editor.value.isActive('bold')
    activeFormats.italic = editor.value.isActive('italic')
    activeFormats.underline = editor.value.isActive('underline')
    activeFormats.bulletList = editor.value.isActive('bulletList')
  }
}

const editorButtons = [
  {
    name: 'bold',
    icon: BoldIcon,
  },
  {
    name: 'italic',
    icon: ItalicIcon,
  },
  {
    name: 'underline',
    icon: UnderlineIcon,
  },
  {
    name: 'bulletList',
    icon: ListIcon,
  }
]

const toggleFormat = (item) => {
  if (editor.value) {
    editor.value.chain().focus()
    
    if (item.name === 'bulletList') {
      editor.value.chain().toggleBulletList().run()
    } else {
      switch (item.name) {
        case 'bold':
          editor.value.chain().toggleBold().run()
          break
        case 'italic':
          editor.value.chain().toggleItalic().run()
          break
        case 'underline':
          editor.value.chain().toggleUnderline().run()
          break
      }
    }
    updateActiveFormats()
  }
}

const stockStatus = computed(() => {
  const quantity = parseInt(product.value.stockQuantity)
  if (isNaN(quantity) || quantity <= 0) {
    return {
      text: 'Out of Stock',
      color: 'text-red-500'
    }
  }
  return {
    text: 'In Stock',
    color: 'text-green-500'
  }
})

const handleDrop = (event) => {
  event.preventDefault()
  const files = event.dataTransfer.files
  handleFiles(files)
}

const handleFileSelect = (event) => {
  const files = event.target.files
  handleFiles(files)
}

const handleFiles = (files) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        product.value.images.push({
          url: e.target.result,
          isNew: true
        })
      }
      reader.readAsDataURL(file)
    }
  }
}

const removeImage = (index) => {
  product.value.images.splice(index, 1)
}

const handleThumbnailSelect = (event) => {
  const file = event.target.files[0]
  handleThumbnailFile(file)
}

const handleThumbnailDrop = (event) => {
  event.preventDefault()
  const file = event.dataTransfer.files[0]
  handleThumbnailFile(file)
}

const handleThumbnailFile = (file) => {
  if (file && file.type.startsWith('image/')) {
    thumbnailFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      thumbnailPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    console.error('Invalid file type. Please select an image.')
    error.value = 'Invalid file type. Please select an image.'
  }
}

const removeThumbnail = () => {
  thumbnailFile.value = null
  thumbnailPreview.value = null
  product.value.thumbnail = null
}

const rootCategories = computed(() => categoryStore.getRootCategories)

const selectedCategoryNames = computed(() => {
  if (product.value.categoryIds.length === 0) return 'None (Top-level category)'
  return product.value.categoryIds
    .map(id => categoryStore.categories.find(c => c.id === id)?.name)
    .filter(Boolean)
    .join(', ')
})

const toggleCategory = (categoryId) => {
  const index = product.value.categoryIds.indexOf(categoryId)
  if (index === -1) {
    product.value.categoryIds.push(categoryId)
  } else {
    product.value.categoryIds.splice(index, 1)
  }
}

onMounted(async () => {
  await categoryStore.fetchCategories()
  const fetchedProduct = await productStore.fetchProduct(props.productId)
  if (fetchedProduct) {
    product.value = {
      ...fetchedProduct,
      images: fetchedProduct.imageURLs.map(url => ({ url, isNew: false })),
      thumbnail: fetchedProduct.thumbnailURL
    }
    if (editor.value && fetchedProduct.description) {
      editor.value.commands.setContent(fetchedProduct.description)
      updateActiveFormats()
    }
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

const saveProduct = async () => {
  isSaving.value = true
  error.value = null

  try {
    const updatedProduct = {
      ...product.value,
      name: product.value.name || '',
      description: editor.value?.getHTML() || '',
      price: parseFloat(product.value.price) || 0,
      stockQuantity: parseInt(product.value.stockQuantity) || 0,
      categoryIds: product.value.categoryIds.length > 0 ? product.value.categoryIds : ['None'],
      thumbnailFile: thumbnailFile.value,
      imageFiles: product.value.images.filter(img => img.isNew).map(img => {
        // Convert data URL to Blob
        const byteString = atob(img.url.split(',')[1]);
        const mimeString = img.url.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
      })
    }

    const result = await productStore.updateProduct(props.productId, updatedProduct)
    
    if (result.success) {
      emit('save', props.productId, updatedProduct)
    } else {
      throw new Error(result.error || 'Failed to update product')
    }

  } catch (err) {
    console.error('Error updating product:', err)
    error.value = err.message || 'Failed to update product. Please try again.'
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.description-editor ul {
  list-style-type: disc !important;
  padding-left: 1.5rem !important;
  margin: 0.5rem 0 !important;
}

.description-editor ul li {
  margin: 0.25rem 0;
}

.description-editor ul li p {
  margin: 0;
}

.ProseMirror {
  outline: none;
  min-height: 120px;
}

.ProseMirror p {
  margin: 0.5em 0;
}

.ProseMirror ul {
  list-style-type: disc !important;
}

.ProseMirror ul[data-type="bulletList"] {
  padding-left: 1.5rem !important;
  margin: 0.5rem 0 !important;
}

.ProseMirror li {
  margin: 0.25rem 0;
}

.ProseMirror li p {
  margin: 0;
  display: inline;
}

.ProseMirror li .font-bold {
  font-weight: bold !important;
}

.ProseMirror li .italic {
  font-style: italic !important;
}

.ProseMirror li .underline {
  text-decoration: underline !important;
}

.ProseMirror ul > li::marker {
  color: #374151;
}

.prose {
  max-width: none;
}

.prose ul > li::marker {
  color: #374151;
}

.tree-container {
  user-select: none;
}
</style>