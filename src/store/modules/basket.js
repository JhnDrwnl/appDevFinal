// store/modules/basket.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/services/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { useAuthStore } from './auth'
import { v4 as uuidv4 } from 'uuid'
import { useProductStore } from './products'
import { useProductPriceRuleStore } from './productPriceRules'
import { usePriceRuleStore } from './priceRules'
import { useCategoryStore } from './categories'

export const useBasketStore = defineStore('basket', () => {
  const authStore = useAuthStore()
  const productStore = useProductStore()
  const productPriceRuleStore = useProductPriceRuleStore()
  const priceRuleStore = usePriceRuleStore()
  const categoryStore = useCategoryStore()

  const basketItems = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const guestId = ref(localStorage.getItem('guestId') || uuidv4())

  // Save guestId to localStorage
  if (!localStorage.getItem('guestId')) {
    localStorage.setItem('guestId', guestId.value)
  }

  const basketCount = computed(() => {
    return basketItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  const basketTotal = computed(() => {
    return basketItems.value.reduce((total, item) => total + item.finalPrice * item.quantity, 0).toFixed(2)
  })

  const getAppliedRules = (product) => {
    if (!product) return []

    const productRules = productPriceRuleStore.productPriceRules
      .filter(rule => rule.productId === product.id)
      .map(rule => {
        const priceRule = priceRuleStore.priceRules.find(pr => pr.id === rule.priceRuleId)
        return {
          id: rule.id,
          name: priceRule ? priceRule.name : 'Unknown Rule',
          value: priceRule ? priceRule.value : 0,
          type: priceRule ? priceRule.type : 'fixed',
          isProductRule: true
        }
      })

    const categoryRules = product.categoryIds.flatMap(categoryId => {
      const category = categoryStore.getCategoryById(categoryId)
      if (category && category.priceRule) {
        return [{
          id: category.priceRule.id,
          name: `${category.name} - ${category.priceRule.priceRuleName}`,
          value: category.priceRule.priceRuleValue,
          type: category.priceRule.priceRuleType,
          isProductRule: false
        }]
      }
      return []
    })

    return [...productRules, ...categoryRules]
  }

  const calculateFinalPrice = (product) => {
    let finalPrice = product.price
    const appliedRules = getAppliedRules(product)

    appliedRules.forEach(rule => {
      if (rule.type === 'percentage') {
        finalPrice *= (1 - rule.value / 100)
      } else {
        finalPrice -= rule.value
      }
    })

    return Math.max(finalPrice, 0) // Ensure the price doesn't go below 0
  }

  async function addToBasket(product, quantity = 1) {
    isLoading.value = true
    error.value = null

    try {
      const userId = authStore.user?.uid || `guest_${guestId.value}`
      const existingItemIndex = basketItems.value.findIndex(item => item.productId === product.id)

      if (existingItemIndex !== -1) {
        // Item already exists, update its quantity
        const updatedItem = { ...basketItems.value[existingItemIndex] }
        updatedItem.quantity += quantity
        await updateBasketItem(updatedItem)
        basketItems.value[existingItemIndex] = updatedItem
      } else {
        // Item doesn't exist, add a new one
        const finalPrice = calculateFinalPrice(product)
        const newItem = {
          productId: product.id,
          name: product.name,
          price: product.price,
          finalPrice: finalPrice,
          quantity: quantity,
          thumbnailURL: product.thumbnailURL,
          userId: userId
        }
        await addBasketItem(newItem)
      }
    } catch (err) {
      console.error('Error adding to basket:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  async function addBasketItem(item) {
    try {
      const docRef = await addDoc(collection(db, 'baskets'), {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      basketItems.value.push({ id: docRef.id, ...item })
    } catch (err) {
      console.error('Error adding basket item to Firestore:', err)
      throw err
    }
  }

  async function updateBasketItem(item) {
    try {
      const itemRef = doc(db, 'baskets', item.id)
      await updateDoc(itemRef, {
        ...item,
        updatedAt: serverTimestamp()
      })
    } catch (err) {
      console.error('Error updating basket item in Firestore:', err)
      throw err
    }
  }

  async function removeFromBasket(itemId) {
    isLoading.value = true
    error.value = null

    try {
      await deleteDoc(doc(db, 'baskets', itemId))
      basketItems.value = basketItems.value.filter(item => item.id !== itemId)
    } catch (err) {
      console.error('Error removing from basket:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  async function fetchBasketItems() {
    isLoading.value = true
    error.value = null

    try {
      const userId = authStore.user?.uid || `guest_${guestId.value}`
      const q = query(collection(db, 'baskets'), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      
      basketItems.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      console.error('Error fetching basket items:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  async function clearBasket() {
    isLoading.value = true
    error.value = null

    try {
      const userId = authStore.user?.uid || `guest_${guestId.value}`
      const q = query(collection(db, 'baskets'), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      basketItems.value = []
    } catch (err) {
      console.error('Error clearing basket:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  async function convertGuestToUser(userId) {
    isLoading.value = true
    error.value = null

    try {
      const guestBasketId = `guest_${guestId.value}`
      const q = query(collection(db, 'baskets'), where('userId', '==', guestBasketId))
      const querySnapshot = await getDocs(q)
      
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { userId: userId })
      )
      await Promise.all(updatePromises)

      // Update local basket items
      basketItems.value = basketItems.value.map(item => ({
        ...item,
        userId: userId
      }))

      // Clear guest ID from localStorage
      localStorage.removeItem('guestId')
    } catch (err) {
      console.error('Error converting guest basket to user:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  async function updateItemQuantity(itemId, newQuantity) {
    isLoading.value = true
    error.value = null

    try {
      const item = basketItems.value.find(item => item.id === itemId)
      if (!item) throw new Error('Item not found in basket')

      item.quantity = newQuantity
      await updateBasketItem(item)

      // Update local state
      const index = basketItems.value.findIndex(i => i.id === itemId)
      if (index !== -1) {
        basketItems.value[index] = item
      }
    } catch (err) {
      console.error('Error updating item quantity:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  async function clearUserBasket(userId) {
    isLoading.value = true
    error.value = null

    try {
      const q = query(collection(db, 'baskets'), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      basketItems.value = basketItems.value.filter(item => item.userId !== userId)
    } catch (err) {
      console.error('Error clearing user basket:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  return {
    basketItems,
    isLoading,
    error,
    basketCount,
    basketTotal,
    addToBasket,
    removeFromBasket,
    fetchBasketItems,
    clearBasket,
    convertGuestToUser,
    updateItemQuantity,
    clearUserBasket
  }
})