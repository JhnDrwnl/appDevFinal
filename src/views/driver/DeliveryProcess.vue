<!-- views/driver/DeliveryProcess.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Delivery Process</h2>
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div v-for="(step, index) in steps" :key="index" class="flex flex-col items-center flex-1">
            <div 
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold',
                currentStep >= index ? 'bg-[#FF9934]' : 'bg-gray-300'
              ]"
            >
              {{ index + 1 }}
            </div>
            <span class="text-xs mt-2 text-center" :class="currentStep >= index ? 'text-[#FF9934]' : 'text-gray-500'">
              {{ step }}
            </span>
          </div>
        </div>
        <div class="relative h-2 bg-gray-200 rounded-full">
          <div 
            class="absolute top-0 left-0 h-full bg-[#FF9934] rounded-full transition-all duration-500 ease-in-out"
            :style="{ width: `${(currentStep / (steps.length - 1)) * 100}%` }"
          ></div>
        </div>
      </div>
      
      <div v-if="!showCancelForm" class="mb-8">
        <h3 class="text-lg font-semibold mb-4">{{ steps[currentStep] }}</h3>
        <p class="mb-4">{{ getStepDescription() }}</p>
        <button 
          v-if="currentStep < 3" 
          @click="proceedToNextStep" 
          :disabled="isLoading"
          class="w-full bg-[#FF9934] text-white px-4 py-2 rounded-full hover:bg-[#FF8000] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Processing...' : getButtonText() }}
        </button>
        <div v-if="currentStep === 3">
          <div class="mb-4">
            <label for="proofImage" class="block text-sm font-medium text-gray-700 mb-2">Upload Proof of Delivery</label>
            <input 
              type="file" 
              id="proofImage" 
              @change="handleImageUpload" 
              accept="image/*" 
              class="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-[#FF9934] file:text-white
                hover:file:bg-[#FF8000]
              "
            />
          </div>
          <button 
            @click="completeDelivery" 
            :disabled="!proofImage" 
            class="w-full bg-[#FF9934] text-white px-4 py-2 rounded-full hover:bg-[#FF8000] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Delivery
          </button>
        </div>
      </div>

      <div v-else class="mb-8">
        <h3 class="text-lg font-semibold mb-4">Cancel Delivery</h3>
        <form @submit.prevent="submitCancellation">
          <div class="mb-4">
            <label for="cancellationReason" class="block text-sm font-medium text-gray-700 mb-2">Reason for Cancellation</label>
            <textarea
              id="cancellationReason"
              v-model="cancellationReason"
              rows="3"
              class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              required
            ></textarea>
          </div>
          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="showCancelForm = false"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition duration-300"
            >
              Back
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300"
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </div>
  
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline">{{ error }}</span>
      </div>

      <div v-if="!showCancelForm" class="flex justify-between">
        <button @click="$router.go(-1)" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition duration-300">
          Back to Details
        </button>
        <button @click="showCancelForm = true" class="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition duration-300">
          Cancel Delivery
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReservationStore } from '@/store/modules/reservation'
import { useActiveDeliveryStore } from '@/store/modules/activeDelivery'
import { storage } from '@/services/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const reservationStore = useReservationStore()
const activeDeliveryStore = useActiveDeliveryStore()

const steps = ['Pending', 'Preparing', 'On the Way', 'Delivered']
const currentStep = ref(0)
const proofImage = ref<File | null>(null)
const error = ref('')
const showCancelForm = ref(false)
const cancellationReason = ref('')
const isLoading = ref(false) // Added isLoading ref

onMounted(async () => {
  if (props.id) {
    const result = await reservationStore.fetchReservationById(props.id)
    if (result.success) {
      const status = result.reservation.status
      const statusIndex = steps.findIndex(step => step.toLowerCase() === status.toLowerCase())
      currentStep.value = statusIndex !== -1 ? statusIndex : 0
    } else {
      console.error('Failed to fetch reservation:', result.error)
      currentStep.value = 0
      error.value = result.error || 'Failed to fetch reservation'
    }
  } else {
    console.error('No delivery ID provided')
    currentStep.value = 0
    error.value = 'No delivery ID provided'
  }
})

const updateDeliveryStatus = async (status: string, imageUrl?: string, reason?: string) => {
  if (props.id) {
    try {
      const updateData: any = { status }
      if (imageUrl) {
        updateData.proofImageUrl = imageUrl
      }
      if (reason) {
        updateData.cancellationReason = reason
      }
      const result = await reservationStore.updateReservation(props.id, updateData)
      if (result.success) {
        currentStep.value = steps.indexOf(status.charAt(0).toUpperCase() + status.slice(1))
        error.value = '' // Clear any previous errors
      } else {
        error.value = result.error || 'Failed to update delivery status'
      }
    } catch (err) {
      console.error('Error updating delivery status:', err)
      error.value = 'An unexpected error occurred. Please try again.'
    }
  } else {
    error.value = 'No delivery ID provided'
  }
}

const startDelivery = async () => {
  await updateDeliveryStatus('preparing')
}

const orderPrepared = async () => {
  isLoading.value = true
  try {
    await updateDeliveryStatus('on the way')
  } finally {
    isLoading.value = false
  }
}

const arrivedAtDestination = async () => {
  currentStep.value = 3
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    proofImage.value = target.files[0]
  }
}

const completeDelivery = async () => {
  if (proofImage.value && props.id) {
    try {
      const imageRef = storageRef(storage, `delivery-proofs/${props.id}/${proofImage.value.name}`)
      await uploadBytes(imageRef, proofImage.value)
      const downloadURL = await getDownloadURL(imageRef)
      await updateDeliveryStatus('delivered', downloadURL)
      activeDeliveryStore.setHighlightedDeliveryId(null)
      router.push('/driver/active-deliveries')
    } catch (err) {
      console.error('Error uploading image:', err)
      error.value = 'Failed to upload proof image. Please try again.'
    }
  }
}

const submitCancellation = async () => {
  if (cancellationReason.value.trim() === '') {
    error.value = 'Please provide a reason for cancellation.'
    return
  }
  
  try {
    await updateDeliveryStatus('cancelled', undefined, cancellationReason.value)
    activeDeliveryStore.setHighlightedDeliveryId(null)
    router.push('/driver/active-deliveries')
  } catch (err) {
    console.error('Error cancelling delivery:', err)
    error.value = 'Failed to cancel delivery. Please try again.'
  }
}

const getStepDescription = () => {
  switch (currentStep.value) {
    case 0:
      return 'Are you ready to start this delivery?'
    case 1:
      return 'The order is being prepared. Please wait for confirmation.'
    case 2:
      return 'You\'re on your way! Safe travels.'
    case 3:
      return 'Please confirm the delivery has been completed.'
    default:
      return ''
  }
}

const getButtonText = () => {
  switch (currentStep.value) {
    case 0:
      return 'Start Delivery'
    case 1:
      return 'Order Prepared'
    case 2:
      return 'Arrived at Destination'
    default:
      return 'Proceed'
  }
}

const proceedToNextStep = async () => {
  if (isLoading.value) return

  isLoading.value = true
  try {
    switch (currentStep.value) {
      case 0:
        await startDelivery()
        break
      case 1:
        await orderPrepared()
        break
      case 2:
        await arrivedAtDestination()
        break
    }
  } finally {
    isLoading.value = false
  }
}
</script>

