// store/modules/activeDelivery.js

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useActiveDeliveryStore = defineStore('activeDelivery', () => {
  const highlightedDeliveryId = ref(null)

  const setHighlightedDeliveryId = (id) => {
    highlightedDeliveryId.value = id
  }

  return {
    highlightedDeliveryId,
    setHighlightedDeliveryId
  }
})

