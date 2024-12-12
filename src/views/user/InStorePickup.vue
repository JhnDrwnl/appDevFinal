<!-- views/user/InStore.vue -->
<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">In-store Pickup Reservation</h2>
    <form @submit.prevent="submitReservation" class="space-y-6">
      <div>
        <label for="pickupDate" class="block text-sm font-medium text-gray-700">Pickup Date and Time</label>
        <div class="relative mt-1">
          <input
            id="pickupDate"
            v-model="formattedPickupDateTime"
            type="text"
            readonly
            required
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#FF9934] focus:border-[#FF9934] text-base py-2 pr-10"
          >
          <button
            type="button"
            @click="toggleCalendar"
            class="absolute inset-y-0 right-0 px-3 flex items-center text-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <Calendar
          v-if="showCalendar"
          :selectedDate="pickupDateTime"
          @select-date="updatePickupDateTime"
          @close="showCalendar = false"
        />
      </div>

      <div>
        <label for="notes" class="block text-sm font-medium text-gray-700">Additional Notes</label>
        <textarea
          id="notes"
          v-model="notes"
          rows="3"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#FF9934] focus:border-[#FF9934] sm:text-sm"
          placeholder="Any special instructions or notes"
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
          class="px-6 py-2 border border-transparent rounded-full shadow-sm text-white bg-[#FF9934] hover:bg-[#FF8000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934]"
        >
          Continue to Confirmation
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBasketStore } from '@/store/modules/basket'
import Calendar from '@/components/common/Calendar.vue'

const router = useRouter()
const basketStore = useBasketStore()

const pickupDateTime = ref(new Date())
const notes = ref('')
const showCalendar = ref(false)

const formattedPickupDateTime = computed(() => {
  const date = pickupDateTime.value
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
})

const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value
}

const updatePickupDateTime = (date) => {
  pickupDateTime.value = date
  showCalendar.value = false
}

const submitReservation = () => {
  const reservationData = {
    type: 'pickup',
    items: basketStore.basketItems,
    totalAmount: basketStore.basketTotal,
    pickupDateTime: pickupDateTime.value,
    notes: notes.value
  }

  localStorage.setItem('reservationData', JSON.stringify(reservationData))
  router.push({ name: 'ReservationConfirmation' })
}

defineEmits(['back'])
</script>

