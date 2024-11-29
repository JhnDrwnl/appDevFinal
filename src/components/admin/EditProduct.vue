<!-- components/admin/EditProducts.vue -->
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
              v-for="image in product.images"
              :key="image"
              class="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
            >
              <img :src="image" class="w-full h-full object-cover" alt="Product image" />
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
              <input
                type="file"
                multiple
                accept="image/*"
                class="hidden"
                ref="fileInput"
                @change="handleFileSelect"
              />
              <button
                @click="$refs.fileInput.click()"
                class="mt-2 px-4 py-2 text-sm text-[#0095FF] hover:text-[#0077CC]"
              >
                Select Files
              </button>
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
                  v-model.number="product.price"
                  type="number"
                  step="0.01"
                  min="0"
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
            <div v-if="product.discountType !== 'none'">
              <label class="block text-sm font-medium text-gray-700">
                {{ product.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount' }}
              </label>
              <div class="mt-1 relative rounded-lg">
                <span v-if="product.discountType === 'fixed'" class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  ₱
                </span>
                <input
                  v-model.number="product.discountValue"
                  type="number"
                  :step="product.discountType === 'percentage' ? '1' : '0.01'"
                  :min="0"
                  :max="product.discountType === 'percentage' ? 100 : undefined"
                  :class="[
                    'block w-full py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]',
                    product.discountType === 'fixed' ? 'pl-7' : 'px-4'
                  ]"
                />
                <span v-if="product.discountType === 'percentage'" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                  %
                </span>
              </div>
            </div>
            <!-- Stock Section -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Stock Quantity</label>
              <div class="mt-1">
                <input
                  v-model.number="product.stockQuantity"
                  type="number"
                  min="0"
                  class="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
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
          <div class="aspect-square rounded-lg overflow-hidden mb-4">
            <img
              :src="thumbnailPreview || product.thumbnail || '/placeholder.svg?height=300&width=300'"
              class="w-full h-full object-cover"
              alt="Product thumbnail"
            />
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
                <ImageIcon class="w-10 h-10 text-gray-400" />
              </div>
              <p class="text-sm text-gray-500">
                Drag 'n' drop thumbnail here, or click to select
              </p>
            </div>
          </div>
        </div>

        <!-- Product Details -->
        <div class="bg-white p-6 rounded-lg border border-gray-200">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Product Details</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Category</label>
              <select
                v-model="product.category"
                class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
              >
                <option v-for="category in availableCategories" :key="category" :value="category">
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
              <div class="mt-2 flex">
                <input
                  v-model="newTag"
                  @keyup.enter="addTag"
                  type="text"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
                  placeholder="Add a tag"
                />
                <button
                  @click="addTag"
                  class="ml-2 px-4 py-2 bg-[#0095FF] text-white rounded-lg hover:bg-[#0077CC]"
                >
                  Add
                </button>
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
        class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        @click="saveProduct"
        :disabled="isSaving"
        class="px-4 py-2 bg-[#0095FF] text-white rounded-lg hover:bg-[#0077CC] disabled:opacity-50"
      >
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, reactive } from 'vue'
import { useProductStore } from '@/store/modules/products'
import { storeToRefs } from 'pinia'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  Underline as UnderlineIcon, 
  List as ListIcon,
  Upload as UploadIcon,
  Image as ImageIcon,
  X as XIcon
} from 'lucide-vue-next'
import { storage } from '@/services/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const props = defineProps({
  productId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['cancel', 'save'])

const productStore = useProductStore()
const { products } = storeToRefs(productStore)

const activeFormats = reactive({
  bold: false,
  italic: false,
  underline: false,
  bulletList: false
})

const editor = useEditor({
  extensions: [
    Document,
    Paragraph,
    Text,
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
    }),
    StarterKit.configure({
      bulletList: false,
      bold: false,
      italic: false,
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

const availableCategories = ['Books', 'Electronics', 'Fashion', 'Home & Garden']

const product = ref({
  name: '',
  description: '',
  price: 0,
  discountType: 'none',
  discountValue: 0,
  thumbnail: '',
  images: [],
  category: '',
  stockQuantity: 0,
  tags: []
})

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

const newTag = ref('')
const thumbnailFile = ref(null)
const thumbnailPreview = ref(null)
const isSaving = ref(false)

// Load current product data
onMounted(async () => {
  const currentProduct = products.value.find(p => p.id === props.productId)
  if (currentProduct) {
    product.value = {
      ...currentProduct,
      price: parseFloat(currentProduct.price),
      discountValue: currentProduct.discountValue || 0,
      images: currentProduct.imageURLs || [],
      thumbnail: currentProduct.thumbnailURL || '',
      tags: currentProduct.tags || [],
      stockQuantity: currentProduct.stockQuantity || 0
    }
    
    if (editor.value && currentProduct.description) {
      editor.value.commands.setContent(currentProduct.description)
      updateActiveFormats()
    }
  }
})

// Clean up editor
onBeforeUnmount(() => {
  editor.value?.destroy()
})

// Image handling methods
const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files)
  await handleFiles(files)
}

const handleDrop = async (event) => {
  const files = Array.from(event.dataTransfer.files)
  await handleFiles(files)
}

const handleFiles = async (files) => {
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      try {
        const imageRef = storageRef(storage, `products/${props.productId}/${file.name}`)
        await uploadBytes(imageRef, file)
        const imageURL = await getDownloadURL(imageRef)
        product.value.images.push(imageURL)
      } catch (error) {
        console.error('Error uploading image:', error)
      }
    }
  }
}

const handleThumbnailSelect = async (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    thumbnailFile.value = file
    thumbnailPreview.value = URL.createObjectURL(file)
  }
}

const handleThumbnailDrop = async (event) => {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    thumbnailFile.value = file
    thumbnailPreview.value = URL.createObjectURL(file)
  }
}

const removeImage = (imageUrl) => {
  product.value.images = product.value.images.filter(url => url !== imageUrl)
}

// Tag management
const addTag = () => {
  if (newTag.value && !product.value.tags.includes(newTag.value)) {
    product.value.tags.push(newTag.value)
    newTag.value = ''
  }
}

const removeTag = (tag) => {
  product.value.tags = product.value.tags.filter(t => t !== tag)
}

// Save product
const saveProduct = async () => {
  try {
    isSaving.value = true
    const updatedData = {
      ...product.value,
      description: editor.value?.getHTML() || '',
      price: parseFloat(product.value.price),
      imageURLs: product.value.images,
      stockQuantity: parseInt(product.value.stockQuantity) || 0
    }

    if (thumbnailFile.value) {
      const thumbnailRef = storageRef(storage, `product_thumbnails/${props.productId}`)
      await uploadBytes(thumbnailRef, thumbnailFile.value)
      updatedData.thumbnailURL = await getDownloadURL(thumbnailRef)
    }

    await productStore.updateProduct(props.productId, updatedData)
    emit('save', props.productId, updatedData)
  } catch (error) {
    console.error('Error saving product:', error)
  } finally {
    isSaving.value = false
  }
}
</script>

<style>
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
</style>