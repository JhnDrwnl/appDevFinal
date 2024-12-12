<!-- views/user/Address -->
<template>
  <div class="max-w-4xl mx-auto bg-white">
    <h2 class="text-3xl font-bold p-6 border-b border-gray-200">Your Shipping Address</h2>
    
    <div v-if="authStore.isLoading || !authStore.isInitialized" class="text-center py-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9934] mx-auto"></div>
      <p class="mt-2 text-gray-600">Loading...</p>
    </div>

    <div v-else-if="error" class="p-4 mb-4 bg-red-50 border border-red-200 rounded">
      <p class="text-red-700">{{ error }}</p>
    </div>

    <div v-else class="p-6">
      <button
        v-if="!showAddAddress && !showEditAddress && !error"
        @click="showAddAddress = true"
        class="mb-6 bg-[#FF9934] text-white font-bold py-2 px-4 rounded-full hover:bg-[#FF8000] transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF9934] focus:ring-opacity-50"
      >
        Add New Address
      </button>

      <AddAddress 
        v-if="showAddAddress" 
        @address-added="handleAddressAdded"
        @cancel="showAddAddress = false"
      />

      <EditAddress
        v-if="showEditAddress"
        :address="editingAddress"
        @address-updated="handleAddressUpdated"
        @cancel="showEditAddress = false"
      />

      <div v-if="isLoading && !showAddAddress && !showEditAddress" class="text-center py-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9934] mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading addresses...</p>
      </div>

      <div v-else-if="addresses.length === 0 && !showAddAddress && !showEditAddress && !error" class="text-center py-8">
        <MapPinOff class="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p class="text-xl font-semibold text-gray-700">No addresses found</p>
        <p class="text-gray-500 mt-2">Add a new address to get started!</p>
      </div>

      <TransitionGroup 
        v-if="!showAddAddress && !showEditAddress && !error && addresses.length > 0"
        name="list" 
        tag="ul" 
        class="space-y-6"
      >
        <li v-for="address in addresses" :key="address.id" class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-300 p-6">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-semibold text-gray-800">
              {{ address.fullName }}
              <span v-if="address.isDefault" class="ml-2 text-sm font-medium text-green-600">(Default)</span>
            </h3>
            <div class="flex space-x-2">
              <button
                @click="setDefaultAddress(address)"
                class="text-[#FF9934] hover:text-[#e88a2f] focus:outline-none"
                :disabled="address.isDefault"
                aria-label="Set as default address"
              >
                <StarIcon :class="['h-5 w-5', address.isDefault ? 'text-yellow-500' : 'text-gray-400']" />
              </button>
              <button
                @click="editAddress(address)"
                class="text-[#FF9934] hover:text-[#e88a2f] focus:outline-none"
                aria-label="Edit address"
              >
                <PencilSquareIcon class="h-5 w-5" />
              </button>
              <button
                @click="deleteAddress(address.docId)"
                class="text-red-500 hover:text-red-700 focus:outline-none"
                aria-label="Delete address"
              >
                <Trash2 class="h-5 w-5" />
              </button>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-gray-600">{{ address.addressLine1 }}</p>
              <p class="text-gray-600" v-if="address.addressLine2">{{ address.addressLine2 }}</p>
            </div>
            <div>
              <p class="text-gray-600">Phone: {{ address.phone }}</p>
              <p class="text-gray-600" v-if="address.otherDetails">{{ address.otherDetails }}</p>
            </div>
          </div>
        </li>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAddressStore } from '@/store/modules/address';
import { useAuthStore } from '@/store/modules/auth';
import { MapPinOff, Trash2 } from 'lucide-vue-next';
import { PencilSquareIcon, StarIcon } from '@heroicons/vue/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/vue/24/solid';
import AddAddress from '@/components/user/AddAddress.vue';
import EditAddress from '@/components/user/EditAddress.vue';

const router = useRouter();
const route = useRoute();
const addressStore = useAddressStore();
const authStore = useAuthStore();

const addresses = ref([]);
const isLoading = ref(true);
const showAddAddress = ref(false);
const showEditAddress = ref(false);
const editingAddress = ref(null);
const error = ref('');

onMounted(async () => {
  if (!authStore.isInitialized) {
    await authStore.initializeAuth();
  }
  checkAuthAndFetchAddresses();
});

watch(() => authStore.user, checkAuthAndFetchAddresses);

async function checkAuthAndFetchAddresses() {
  if (authStore.isInitialized) {
    if (authStore.user) {
      await fetchAddresses();
    } else {
      error.value = 'Please log in to view your addresses.';
      isLoading.value = false;
    }
  }
}

const fetchAddresses = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    const result = await addressStore.fetchUserAddresses();
    if (result.success) {
      addresses.value = result.addresses;
    } else {
      error.value = result.error || 'Failed to fetch addresses';
    }
  } catch (err) {
    console.error('Error fetching addresses:', err);
    error.value = 'An error occurred while fetching addresses. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const deleteAddress = async (addressId) => {
  if (!confirm('Are you sure you want to delete this address?')) return;
  
  try {
    const result = await addressStore.deleteAddress(addressId);
    if (result.success) {
      addresses.value = addresses.value.filter(addr => addr.docId !== addressId);
    } else {
      alert('Failed to delete address: ' + result.error);
    }
  } catch (err) {
    console.error('Error deleting address:', err);
    alert('An error occurred while deleting the address');
  }
};

const editAddress = (address) => {
  editingAddress.value = { ...address };
  showEditAddress.value = true;
};

const handleAddressAdded = async () => {
  showAddAddress.value = false;
  await fetchAddresses();
  if (route.query.redirect === 'delivery') {
    router.push({ name: 'Delivery' });
  }
};

const handleAddressUpdated = async (updatedAddress) => {
  showEditAddress.value = false;
  const index = addresses.value.findIndex(addr => addr.docId === updatedAddress.docId);
  if (index !== -1) {
    addresses.value[index] = updatedAddress;
  }
  await fetchAddresses();
};

const setDefaultAddress = async (address) => {
  try {
    const result = await addressStore.setDefaultAddress(address.docId);
    if (result.success) {
      addresses.value = addresses.value.map(addr => ({
        ...addr,
        isDefault: addr.docId === address.docId
      }));
    } else {
      alert('Failed to set default address: ' + result.error);
    }
  } catch (err) {
    console.error('Error setting default address:', err);
    alert('An error occurred while setting the default address');
  }
};
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

