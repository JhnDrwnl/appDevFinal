<!-- components/admin/RemovalRequestForm.vue -->
<template>
    <div class="w-full bg-white p-8">
      <h2 class="text-2xl font-bold mb-8">Removal Request Approval</h2>
      <div v-if="isLoading" class="text-center py-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF9934] mx-auto"></div>
      </div>
      <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p class="font-bold">Error</p>
        <p>{{ error }}</p>
      </div>
      <div v-else-if="request">
        <div class="mb-4">
          <p><strong>POS Item ID:</strong> {{ request.posItemId }}</p>
          <p><strong>Item ID:</strong> {{ request.itemId }}</p>
          <p><strong>Reason:</strong> {{ request.reason }}</p>
          <p><strong>Created At:</strong> {{ formatDate(request.createdAt) }}</p>
        </div>
        <div class="flex justify-end space-x-4">
          <button
            @click="rejectRequest"
            class="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Reject
          </button>
          <button
            @click="approveRequest"
            class="px-4 py-2 bg-[#FF9934] text-white rounded-full hover:bg-[#FF8000] focus:outline-none focus:ring-2 focus:ring-[#FF9934] focus:ring-opacity-50"
          >
            Approve
          </button>
        </div>
      </div>
      <div v-else class="text-center py-4">
        <p>Request not found</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useRemovalRequestStore } from '@/store/modules/removalRequests'
  import { useReservationStore } from '@/store/modules/reservation'
  import { storeToRefs } from 'pinia'
  
  const route = useRoute()
  const router = useRouter()
  const removalRequestStore = useRemovalRequestStore()
  const reservationStore = useReservationStore()
  
  const { removalRequests, isLoading, error } = storeToRefs(removalRequestStore)
  
  const request = computed(() => {
    return removalRequests.value.find(req => req.id === route.params.id)
  })
  
  onMounted(async () => {
    await removalRequestStore.fetchRemovalRequests()
  })
  
  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date.seconds * 1000).toLocaleString()
  }
  
  const approveRequest = async () => {
    try {
      isLoading.value = true
      const result = await reservationStore.removeItemFromPOS(request.value.posItemId, request.value.itemId)
      if (result.success) {
        await removalRequestStore.deleteRemovalRequest(request.value.id)
        router.push({ name: 'AdminDashboard' })
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }
  
  const rejectRequest = async () => {
    try {
      isLoading.value = true
      await removalRequestStore.deleteRemovalRequest(request.value.id)
      router.push({ name: 'AdminDashboard' })
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }
  </script>
  
  
  
  