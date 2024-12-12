<!-- views/user/Delivery.vue -->
<template>
    <div class="container mx-auto px-4 py-8 bg-white">
      <h2 class="text-3xl font-bold p-6 border-b border-gray-200">Delivery Reservation (Cash on Delivery)</h2>
      
      <div v-if="isLoading" class="text-center py-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9934] mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading addresses...</p>
      </div>
  
      <div v-else-if="addresses.length === 0" class="text-center py-8">
        <MapPinOff class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p class="text-xl font-semibold text-gray-700">No addresses found</p>
        <p class="text-gray-500 mt-2 mb-4">Add a new address to continue with your reservation.</p>
        <button
          @click="showAddAddress = true"
          class="px-6 py-2 bg-[#FF9934] text-white rounded-full hover:bg-[#FF8000] transition-colors duration-200"
        >
          Add New Address
        </button>
      </div>
  
      <div v-else-if="!showEditAddress && !showAddAddress && addresses.length > 0" class="p-6 space-y-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">Delivery Address</h3>
          <button
            @click="showAddAddress = true"
            class="px-4 py-2 bg-[#FF9934] text-white rounded-full hover:bg-[#FF8000] transition-colors duration-200 text-sm"
          >
            Add New Address
          </button>
        </div>
  
        <form @submit.prevent="submitReservation" class="space-y-6">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h4 class="text-lg font-semibold text-green-800 mb-2">Default Address (Used for Delivery)</h4>
            <div v-if="defaultAddress" class="text-green-700">
              <p>{{ defaultAddress.fullName }}</p>
              <p>{{ defaultAddress.addressLine1 }}</p>
              <p v-if="defaultAddress.addressLine2">{{ defaultAddress.addressLine2 }}</p>
              <p>Phone: {{ defaultAddress.phone }}</p>
              <p v-if="defaultAddress.otherDetails">{{ defaultAddress.otherDetails }}</p>
            </div>
            <p v-else class="text-red-600">No default address set. Please set a default address below.</p>
          </div>
  
          <TransitionGroup 
            name="list" 
            tag="ul" 
            class="space-y-4"
          >
            <li v-for="address in sortedAddresses" :key="address.id" class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-300 p-4">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="text-lg font-semibold text-gray-800">
                    {{ address.fullName }}
                    <span v-if="address.isDefault" class="ml-2 text-sm font-medium text-green-600">(Default)</span>
                  </h4>
                  <p class="text-gray-600">{{ address.addressLine1 }}</p>
                  <p class="text-gray-600" v-if="address.addressLine2">{{ address.addressLine2 }}</p>
                  <p class="text-gray-600">Phone: {{ address.phone }}</p>
                  <p class="text-gray-600" v-if="address.otherDetails">{{ address.otherDetails }}</p>
                </div>
                <div class="flex space-x-2">
                  <button
                    v-if="!address.isDefault"
                    @click.prevent="setDefaultAddress(address.docId)"
                    class="text-[#FF9934] hover:text-[#e88a2f] focus:outline-none"
                    aria-label="Set as default address"
                  >
                    <StarIcon class="h-5 w-5" />
                  </button>
                  <button
                    @click.prevent="editAddress(address)"
                    class="text-[#FF9934] hover:text-[#e88a2f] focus:outline-none"
                    aria-label="Edit address"
                  >
                    <PencilSquareIcon class="h-5 w-5" />
                  </button>
                  <button
                    @click.prevent="deleteAddress(address.docId)"
                    class="text-red-500 hover:text-red-700 focus:outline-none"
                    aria-label="Delete address"
                  >
                    <Trash2 class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          </TransitionGroup>
  
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700">Additional Notes</label>
            <textarea
              id="notes"
              v-model="notes"
              rows="3"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#FF9934] focus:border-[#FF9934] sm:text-sm"
              placeholder="Any special instructions or notes for delivery"
            ></textarea>
          </div>
  
          <div class="flex justify-between items-center">
            <button
              type="button"
              @click="$emit('back')"
              class="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934]"
            >
              Back
            </button>
            <button
              type="submit"
              :disabled="!defaultAddress"
              class="px-6 py-2 border border-transparent rounded-full shadow-sm text-white bg-[#FF9934] hover:bg-[#FF8000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Confirmation
            </button>
          </div>
        </form>
      </div>
  
      <div v-else-if="showEditAddress || showAddAddress" class="p-6 text-center">
        <p class="text-lg font-semibold text-gray-700">
          {{ showEditAddress ? 'Editing address...' : 'Adding new address...' }}
        </p>
      </div>
  
      <AddAddress 
        v-if="showAddAddress" 
        @address-added="handleAddressAdded"
        @cancel="showAddAddress = false"
      />
  
      <EditAddress
        v-if="showEditAddress"
        :address="editingAddress"
        @address-updated="handleAddressUpdated"
        @cancel="cancelEdit"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useBasketStore } from '@/store/modules/basket'
  import { useAddressStore } from '@/store/modules/address'
  import { MapPinOff, Trash2 } from 'lucide-vue-next'
  import { PencilSquareIcon, StarIcon } from '@heroicons/vue/24/outline'
  import AddAddress from '@/components/user/AddAddress.vue'
  import EditAddress from '@/components/user/EditAddress.vue'
  
  const router = useRouter()
  const basketStore = useBasketStore()
  const addressStore = useAddressStore()
  
  const addresses = ref([])
  const notes = ref('')
  const isLoading = ref(true)
  const showAddAddress = ref(false)
  const showEditAddress = ref(false)
  const editingAddress = ref(null)
  
  const defaultAddress = computed(() => addresses.value.find(addr => addr.isDefault))
  
  const sortedAddresses = computed(() => {
    return [...addresses.value].sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return 0;
    });
  });
  
  onMounted(async () => {
    await fetchAddresses()
  })
  
  const fetchAddresses = async () => {
    isLoading.value = true
    try {
      const result = await addressStore.fetchUserAddresses()
      if (result.success) {
        addresses.value = result.addresses
      } else {
        console.error('Failed to fetch addresses:', result.error)
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  const editAddress = (address) => {
    editingAddress.value = { ...address }
    showEditAddress.value = true
  }
  
  const cancelEdit = () => {
    showEditAddress.value = false
    editingAddress.value = null
  }
  
  const deleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    
    try {
      const result = await addressStore.deleteAddress(addressId)
      if (result.success) {
        await fetchAddresses()
      } else {
        alert('Failed to delete address: ' + result.error)
      }
    } catch (err) {
      console.error('Error deleting address:', err)
      alert('An error occurred while deleting the address')
    }
  }
  
  const handleAddressAdded = async (newAddress) => {
    showAddAddress.value = false
    await fetchAddresses()
  }
  
  const handleAddressUpdated = async (updatedAddress) => {
    showEditAddress.value = false
    editingAddress.value = null
    const index = addresses.value.findIndex(addr => addr.docId === updatedAddress.docId)
    if (index !== -1) {
      addresses.value[index] = updatedAddress
    }
    if (updatedAddress.isDefault) {
      addresses.value.forEach(addr => {
        if (addr.docId !== updatedAddress.docId) {
          addr.isDefault = false
        }
      })
    }
  }
  
  const setDefaultAddress = async (addressId) => {
    try {
      const result = await addressStore.setDefaultAddress(addressId)
      if (result.success) {
        addresses.value = addresses.value.map(addr => ({
          ...addr,
          isDefault: addr.docId === addressId
        }))
      } else {
        alert('Failed to set default address: ' + result.error)
      }
    } catch (err) {
      console.error('Error setting default address:', err)
      alert('An error occurred while setting the default address')
    }
  }
  
  const submitReservation = () => {
    if (!defaultAddress.value) {
      alert('Please set a default address for delivery')
      return
    }
  
    const reservationData = {
      type: 'delivery',
      items: basketStore.basketItems,
      totalAmount: basketStore.basketTotal,
      address: defaultAddress.value,
      notes: notes.value
    }
  
    localStorage.setItem('reservationData', JSON.stringify(reservationData))
    router.push({ name: 'ReservationConfirmation' })
  }
  
  defineEmits(['back'])
  </script>
  
  <style scoped>
  .list-enter-active,
  .list-leave-active {
    transition: all 0.5s ease;
  }
  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateX(-30px);
  }
  </style>
  
  
  
  