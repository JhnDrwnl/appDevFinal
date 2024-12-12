<!-- views/cashier/PointOfSale.vue -->
<template>
  <div class="w-full">
    <h2 class="text-2xl font-bold mb-4">Point of Sale</h2>
    <div v-if="isLoading" class="text-center py-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9934] mx-auto"></div>
    </div>
    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
      <p class="font-bold">Error</p>
      <p>{{ error }}</p>
      <button 
        @click="retryFetch" 
        class="mt-2 px-4 py-2 bg-[#FF9934] text-white rounded-md hover:bg-[#FF8000] focus:outline-none focus:ring-2 focus:ring-[#FF9934] focus:ring-opacity-50"
      >
        Retry
      </button>
    </div>
    <div v-else-if="removeError" class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
      <p class="font-bold">Warning</p>
      <p>{{ removeError }}</p>
    </div>
    <div v-else-if="posItems.length === 0" class="text-center py-8">
      <p class="text-xl font-semibold text-gray-700">No items in POS</p>
      <p class="text-gray-500 mt-2">Add items from approved reservations to process payments.</p>
    </div>
    <div v-else class="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 class="text-xl font-semibold mb-4">Items in POS</h3>
      <div class="space-y-4">
        <div v-for="posItem in posItems" :key="posItem.id" class="flex items-center space-x-4 border-b border-gray-200 pb-4">
          <div v-for="item in posItem.items" :key="item.id" class="flex items-center space-x-4 w-full">
            <img :src="item.thumbnailURL || '/placeholder.svg?height=80&width=80'" :alt="item.name" class="w-20 h-20 object-cover rounded-md">
            <div class="flex-grow">
              <h4 class="text-lg font-medium">{{ item.name }}</h4>
              <p class="text-gray-600">Quantity: {{ item.quantity }}</p>
              <div>
                <span class="text-sm text-gray-900 font-medium">₱{{ formatPrice(item.finalPrice) }}</span>
                <span v-if="item.price !== item.finalPrice" class="text-xs text-gray-500 line-through ml-2">
                  ₱{{ formatPrice(item.price) }}
                </span>
              </div>
              <div v-if="getDiscount(item)" class="text-xs text-green-600">
                You save: ₱{{ formatPrice(getDiscount(item)) }}
              </div>
            </div>
            <div class="text-right flex flex-col items-end">
              <p class="text-lg font-semibold">₱{{ formatPrice(item.finalPrice * item.quantity) }}</p>
              <button
                @click="removeItem(posItem.id, item.id)"
                class="mt-2 px-3 py-1 bg-[#FF9934] text-white text-sm rounded-md hover:bg-[#FF8000] focus:outline-none focus:ring-2 focus:ring-[#FF9934] focus:ring-opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-6 text-right text-xl font-bold">
        Total: ₱{{ formatPrice(totalAmount) }}
      </div>
      <div class="mt-4 space-y-4">
        <div class="flex items-center justify-end space-x-4">
          <label for="amountGiven" class="font-medium">Amount Given:</label>
          <input
            id="amountGiven"
            v-model="amountGiven"
            type="number"
            step="0.01"
            min="0"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9934] focus:border-transparent"
            @input="calculateChange"
          >
        </div>
        <div class="flex items-center justify-end space-x-4">
          <span class="font-medium">Change:</span>
          <span class="text-xl font-bold" :class="{ 'text-red-500': change < 0 }">
            ₱{{ formatPrice(change) }}
          </span>
        </div>
        <div class="flex justify-end space-x-4 mt-4">
          <button
            @click="processPayment"
            :disabled="!canProcessPayment"
            class="px-6 py-2 bg-[#FF9934] text-white rounded-md hover:bg-[#FF8000] focus:outline-none focus:ring-2 focus:ring-[#FF9934] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Process Payment
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modern Receipt Modal -->
    <div v-if="receipt" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4">
      <div class="bg-white shadow-lg rounded-lg max-w-2xl w-full mx-auto overflow-hidden">
        <div class="bg-[#FF9934] p-4 text-white text-center">
          <h2 class="text-2xl font-bold">Payment Receipt</h2>
        </div>
        <div class="p-6 bg-white border-b border-gray-200">
          <div class="flex justify-center mb-4">
            <CheckCircle class="text-green-500 h-16 w-16" />
          </div>
          <p class="text-gray-700 text-center mb-4">
            Payment processed successfully. Thank you for your purchase!
          </p>
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Transaction Details</h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center py-2 border-b border-dashed border-gray-300">
                <span class="text-gray-600">Transaction ID:</span>
                <span class="font-mono text-gray-800">{{ receipt.transactionId }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-dashed border-gray-300">
                <span class="text-gray-600">Date and Time:</span>
                <span class="text-gray-800">{{ receipt.date }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-dashed border-gray-300">
                <span class="text-gray-600">Total Amount:</span>
                <span class="text-gray-800 font-semibold">₱{{ formatPrice(receipt.totalAmount) }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-dashed border-gray-300">
                <span class="text-gray-600">Amount Given:</span>
                <span class="text-gray-800">₱{{ formatPrice(receipt.amountGiven) }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-dashed border-gray-300">
                <span class="text-gray-600">Change:</span>
                <span class="text-gray-800">₱{{ formatPrice(receipt.change) }}</span>
              </div>
            </div>
            <div class="mt-4">
              <h3 class="text-md font-semibold text-gray-800 mb-2">Items Purchased:</h3>
              <ul class="space-y-2">
                <li v-for="item in receipt.items" :key="item.id" class="flex justify-between items-center">
                  <span class="text-gray-600">{{ item.name }} (x{{ item.quantity }})</span>
                  <span class="text-gray-800">₱{{ formatPrice(item.finalPrice * item.quantity) }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="p-6 bg-gray-50">
          <button
            @click="closeReceipt"
            class="w-full px-6 py-3 bg-[#FF9934] text-white rounded-full hover:bg-[#FF8000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934] transition duration-150 ease-in-out flex items-center justify-center"
          >
            <XCircle class="h-5 w-5 mr-2" />
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReservationStore } from '@/store/modules/reservation'
import { useAuthStore } from '@/store/modules/auth'
import { useRemovalRequestStore } from '@/store/modules/removalRequests'
import { useProductStore } from '@/store/modules/products'
import { storeToRefs } from 'pinia'
import { db, auth } from '@/services/firebase'
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { CheckCircle, XCircle } from 'lucide-vue-next'

const router = useRouter()
const reservationStore = useReservationStore()
const authStore = useAuthStore()
const removalRequestStore = useRemovalRequestStore()
const productStore = useProductStore()
const { isLoading, error } = storeToRefs(reservationStore)

const posItems = ref([])
const removeError = ref(null)
const amountGiven = ref(0)
const change = ref(0)
const receipt = ref(null)

const totalAmount = computed(() => {
  return posItems.value.reduce((total, posItem) => {
    return total + posItem.items.reduce((itemTotal, item) => {
      return itemTotal + item.finalPrice * item.quantity
    }, 0)
  }, 0)
})

const canProcessPayment = computed(() => {
  return amountGiven.value >= totalAmount.value && posItems.value.length > 0
})

onMounted(async () => {
  await fetchPOSItems()
})

const fetchPOSItems = async () => {
  try {
    const result = await reservationStore.fetchPOSItems()
    if (result.success) {
      posItems.value = result.posItems
    } else {
      error.value = result.error
    }
  } catch (err) {
    console.error('Error fetching POS items:', err)
    error.value = 'Error fetching POS items: ' + err.message
  }
}

const removeItem = async (posItemId, itemId) => {
  try {
    const reason = prompt('Please provide a reason for removing this item:')
    if (reason) {
      const result = await removalRequestStore.createRemovalRequest(posItemId, itemId, reason)
      if (result.success) {
        alert('Removal request sent successfully. Waiting for admin approval.')
      } else {
        throw new Error(result.error)
      }
    }
  } catch (err) {
    console.error('Error creating removal request:', err)
    removeError.value = 'Error creating removal request: ' + err.message
  }
}

const retryFetch = async () => {
  error.value = null
  await fetchPOSItems()
}

const formatPrice = (price) => {
  return (parseFloat(price) || 0).toFixed(2)
}

const getDiscount = (item) => {
  if (item.price && item.finalPrice && item.price !== item.finalPrice) {
    return (item.price - item.finalPrice) * item.quantity
  }
  return 0
}

const calculateChange = () => {
  change.value = amountGiven.value - totalAmount.value
}

const getUserRole = async () => {
  const user = auth.currentUser
  if (!user) {
    console.error('User not authenticated')
    throw new Error('User not authenticated')
  }

  const userDoc = await getDoc(doc(db, 'users', user.uid))
  if (!userDoc.exists()) {
    console.error('User document not found')
    throw new Error('User document not found')
  }

  const role = userDoc.data().role
  console.log('Fetched user role:', role)
  return role
}

const processPayment = async () => {
  if (!canProcessPayment.value) {
    alert('Cannot process payment. Please ensure the amount given is sufficient.')
    return
  }

  try {
    const userRole = await getUserRole()
    if (userRole !== 'admin' && userRole !== 'cashier') {
      throw new Error('Unauthorized access')
    }

    const batch = writeBatch(db)

    // Create a new sale document
    const saleData = {
      items: posItems.value.flatMap(posItem => posItem.items),
      totalAmount: totalAmount.value,
      amountGiven: parseFloat(amountGiven.value),
      change: change.value,
      timestamp: serverTimestamp()
    }

    // Update stock quantities
    for (const item of saleData.items) {
      const productRef = doc(db, 'products', item.productId)
      const productDoc = await getDoc(productRef)
      if (productDoc.exists()) {
        const currentStock = productDoc.data().stockQuantity
        const newStock = Math.max(currentStock - item.quantity, 0)
        batch.update(productRef, { stockQuantity: newStock })
      }
    }

    // Add the sale document
    const saleRef = doc(collection(db, 'sales'))
    batch.set(saleRef, saleData)

    // Commit the batch
    await batch.commit()

    // Generate and display the receipt
    receipt.value = generateReceipt(saleData, saleRef.id)

    // Clear POS items after successful payment
    await clearPosItems()

    // Refresh product store
    await productStore.fetchProducts()

    // Reset the form
    amountGiven.value = 0
    change.value = 0
    await fetchPOSItems()
  } catch (error) {
    console.error('Error processing payment:', error)
    alert('Error processing payment: ' + error.message)
  }
}

const generateReceipt = (saleData, transactionId) => {
  return {
    date: new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    transactionId,
    items: saleData.items,
    totalAmount: saleData.totalAmount,
    amountGiven: saleData.amountGiven,
    change: saleData.change
  }
}

const closeReceipt = () => {
  receipt.value = null
}

const clearPosItems = async () => {
  try {
    const userRole = await getUserRole()
    if (userRole !== 'admin' && userRole !== 'cashier') {
      throw new Error('Unauthorized access')
    }

    const batch = writeBatch(db)
    
    for (const posItem of posItems.value) {
      const posItemRef = doc(db, 'posItems', posItem.id)
      batch.delete(posItemRef)

      const reservationRef = doc(db, 'reservations', posItem.reservationId)
      batch.update(reservationRef, { 
        addedToPOS: false,
        status: 'completed'
      })
    }

    await batch.commit()
    posItems.value = []
  } catch (error) {
    console.error('Error clearing POS items:', error)
    throw error
  }
}
</script>

