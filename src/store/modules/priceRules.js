// store/modules/priceRules.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/services/firebase'
import { collection, getDocs, setDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'

export const usePriceRuleStore = defineStore('priceRules', () => {
  const priceRules = ref([])
  const loading = ref(false)
  const error = ref(null)

  const createUniqueId = (name, type) => {
    return `${name.toLowerCase().replace(/\s+/g, '-')}_${type}`
  }

  const fetchPriceRules = async () => {
    loading.value = true
    error.value = null
    try {
      const querySnapshot = await getDocs(collection(db, 'priceRules'))
      priceRules.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate()
      }))
    } catch (err) {
      console.error('Error fetching price rules:', err)
      error.value = 'Failed to fetch price rules'
    } finally {
      loading.value = false
    }
  }

  const addPriceRule = async (priceRule) => {
    loading.value = true
    error.value = null
    try {
      const uniqueId = createUniqueId(priceRule.name, priceRule.type)
      const priceRuleWithDates = {
        ...priceRule,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      await setDoc(doc(db, 'priceRules', uniqueId), priceRuleWithDates)
      const newPriceRule = { 
        id: uniqueId, 
        ...priceRuleWithDates
      }
      priceRules.value.push(newPriceRule)
      return { success: true, priceRule: newPriceRule }
    } catch (err) {
      console.error('Error adding price rule:', err)
      error.value = 'Failed to add price rule. It may already exist.'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updatePriceRule = async (id, updatedPriceRule) => {
    loading.value = true
    error.value = null
    try {
      const priceRuleRef = doc(db, 'priceRules', id)
      const updateData = {
        ...updatedPriceRule,
        updatedAt: new Date()
      }
      await updateDoc(priceRuleRef, updateData)
      const index = priceRules.value.findIndex(rule => rule.id === id)
      if (index !== -1) {
        priceRules.value[index] = { 
          ...priceRules.value[index], 
          ...updateData
        }
      }
      return { success: true }
    } catch (err) {
      console.error('Error updating price rule:', err)
      error.value = 'Failed to update price rule'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deletePriceRule = async (id) => {
    loading.value = true
    error.value = null
    try {
      await deleteDoc(doc(db, 'priceRules', id))
      priceRules.value = priceRules.value.filter(rule => rule.id !== id)
      return { success: true }
    } catch (err) {
      console.error('Error deleting price rule:', err)
      error.value = 'Failed to delete price rule'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const isRuleActive = (rule) => {
    const now = new Date()
    return rule.startDate <= now && (!rule.endDate || rule.endDate > now)
  }

  const activePriceRules = computed(() => {
    return priceRules.value.filter(isRuleActive)
  })

  const getPriceRuleById = computed(() => (id) => {
    return priceRules.value.find(rule => rule.id === id)
  })

  const clearError = () => {
    error.value = null
  }

  return {
    priceRules,
    activePriceRules,
    loading,
    error,
    fetchPriceRules,
    addPriceRule,
    updatePriceRule,
    deletePriceRule,
    getPriceRuleById,
    clearError,
    isRuleActive
  }
})

