// store/modules/reservation.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, auth } from '@/services/firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp, 
  getDoc, 
  writeBatch, 
  orderBy 
} from 'firebase/firestore'
import { useAuthStore } from './auth'
import { useProductStore } from './products'

export const useReservationStore = defineStore('reservation', () => {
  const reservations = ref([])
  const currentReservation = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const createReservation = async (reservationData) => {
    isLoading.value = true
    error.value = null
    try {
      const authStore = useAuthStore()
      if (!authStore.user) {
        throw new Error('User is not authenticated')
      }
      const userId = authStore.user.uid

      const newReservation = {
        userId,
        ...reservationData,
        items: reservationData.items.map(item => ({
          ...item,
          price: item.price,
          finalPrice: item.finalPrice
        })),
        createdAt: serverTimestamp(),
        status: 'pending'
      }

      const docRef = await addDoc(collection(db, 'reservations'), newReservation)
      newReservation.id = docRef.id
      reservations.value.push(newReservation)

      return { success: true, message: 'Reservation created successfully', reservation: newReservation }
    } catch (error) {
      console.error('Error creating reservation:', error)
      error.value = error.message
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserReservations = async () => {
    isLoading.value = true
    error.value = null
    try {
      const authStore = useAuthStore()
      if (!authStore.user) {
        throw new Error('User is not authenticated')
      }
      const userId = authStore.user.uid

      const q = query(collection(db, 'reservations'), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      
      reservations.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return { success: true, reservations: reservations.value }
    } catch (error) {
      console.error('Error fetching reservations:', error)
      error.value = error.message
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const fetchAllReservations = async () => {
    isLoading.value = true
    error.value = null
    try {
      const querySnapshot = await getDocs(collection(db, 'reservations'))
      
      reservations.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return { success: true, reservations: reservations.value }
    } catch (error) {
      console.error('Error fetching all reservations:', error)
      error.value = error.message
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const updateReservation = async (reservationId, updatedData) => {
    isLoading.value = true
    error.value = null
    try {
      const reservationRef = doc(db, 'reservations', reservationId)
      await updateDoc(reservationRef, {
        ...updatedData,
        updatedAt: serverTimestamp()
      })

      const index = reservations.value.findIndex(res => res.id === reservationId)
      if (index !== -1) {
        reservations.value[index] = { ...reservations.value[index], ...updatedData }
      }

      return { success: true, message: 'Reservation updated successfully' }
    } catch (error) {
      console.error('Error updating reservation:', error)
      error.value = error.message
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const deleteReservation = async (reservationId) => {
    isLoading.value = true
    error.value = null
    try {
      await deleteDoc(doc(db, 'reservations', reservationId))
      reservations.value = reservations.value.filter(res => res.id !== reservationId)

      return { success: true, message: 'Reservation deleted successfully' }
    } catch (error) {
      console.error('Error deleting reservation:', error)
      error.value = error.message
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const setCurrentReservation = (reservation) => {
    currentReservation.value = reservation
  }

  const clearReservations = () => {
    reservations.value = []
    currentReservation.value = null
  }

  const fetchReservationById = async (reservationId) => {
    isLoading.value = true
    error.value = null
    try {
      if (!reservationId) {
        throw new Error('Reservation ID is required')
      }
      const docRef = doc(db, 'reservations', reservationId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const reservationData = { id: docSnap.id, ...docSnap.data() }
        return { success: true, reservation: reservationData }
      } else {
        error.value = 'Reservation not found'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('Error fetching reservation:', err)
      error.value = err.message
      return { success: false, error: err.value }
    } finally {
      isLoading.value = false
    }
  }

  const notifyDrivers = async (reservationId) => {
    isLoading.value = true
    error.value = null
    try {
      const authStore = useAuthStore()
      if (!authStore.user) {
        throw new Error('User is not authenticated')
      }

      console.log('Current user ID:', authStore.user.uid)

      const userDoc = await getDoc(doc(db, 'users', authStore.user.uid))
      if (!userDoc.exists()) {
        throw new Error('User document not found')
      }

      const userRole = userDoc.data().role
      console.log('User role:', userRole)

      if (userRole !== 'admin' && userRole !== 'cashier') {
        throw new Error('Only admins and cashiers can notify drivers')
      }

      const reservationRef = doc(db, 'reservations', reservationId)
      const reservationDoc = await getDoc(reservationRef)
      const reservationData = reservationDoc.data()

      if (!reservationData) {
        throw new Error('Reservation not found')
      }

      console.log('Updating reservation:', reservationId)
      const batch = writeBatch(db)

      batch.update(reservationRef, {
        status: 'active',
        notifiedDrivers: true,
        notifiedAt: serverTimestamp()
      })

      const driversQuery = query(collection(db, 'users'), where('role', '==', 'driver'))
      const driversSnapshot = await getDocs(driversQuery)

      console.log('Number of drivers found:', driversSnapshot.size)

      driversSnapshot.forEach((driverDoc) => {
        const notificationRef = doc(collection(db, 'notifications'))
        batch.set(notificationRef, {
          userId: driverDoc.id,
          type: 'driver',
          message: `New delivery available: ${reservationId}`,
          read: false,
          createdAt: serverTimestamp()
        })
      })

      const productStore = useProductStore()

      for (const item of reservationData.items) {
        const product = await productStore.fetchProduct(item.productId)
        if (product) {
          const newStockQuantity = Math.max(product.stockQuantity - item.quantity, 0)
          await productStore.updateProduct(item.productId, { stockQuantity: newStockQuantity })
          console.log(`Updated stock for product ${item.productId}: ${product.stockQuantity} -> ${newStockQuantity}`)
        } else {
          console.warn(`Product not found: ${item.productId}`)
        }
      }

      console.log('Committing batch write')
      await batch.commit()
      console.log('Batch write successful')

      await productStore.fetchProducts()

      const index = reservations.value.findIndex(res => res.id === reservationId)
      if (index !== -1) {
        reservations.value[index] = { 
          ...reservations.value[index], 
          status: 'active', 
          notifiedDrivers: true,
          notifiedAt: new Date()
        }
      }

      return { success: true, message: 'Drivers notified successfully' }
    } catch (error) {
      console.error('Error notifying drivers:', error)
      error.value = error.message
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const fetchCompletedDeliveries = async () => {
    isLoading.value = true
    error.value = null
    try {
      const q = query(
        collection(db, 'reservations'),
        where('status', '==', 'delivered'),
        orderBy('updatedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const completedDeliveries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return { success: true, completedDeliveries }
    } catch (error) {
      console.error('Error fetching completed deliveries:', error)
      error.value = error.message
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const addPickupReservationToPOS = async (reservationId) => {
    isLoading.value = true
    error.value = null
    try {
      const authStore = useAuthStore()
      if (!authStore.user) {
        throw new Error('User is not authenticated')
      }

      const userDoc = await getDoc(doc(db, 'users', authStore.user.uid))
      if (!userDoc.exists()) {
        throw new Error('User document not found')
      }

      const userRole = userDoc.data().role
      if (userRole !== 'admin' && userRole !== 'cashier') {
        throw new Error('Only admins and cashiers can add reservations to POS')
      }

      const reservationRef = doc(db, 'reservations', reservationId)
      const reservationDoc = await getDoc(reservationRef)
      const reservationData = reservationDoc.data()

      if (!reservationData) {
        throw new Error('Reservation not found')
      }

      if (reservationData.addedToPOS) {
        throw new Error('This reservation has already been added to POS')
      }

      // Create a new POS item document
      const posItemData = {
        reservationId,
        items: reservationData.items,
        totalAmount: reservationData.totalAmount,
        createdAt: serverTimestamp(),
        createdBy: authStore.user.uid,
        status: 'pending'
      }

      const posItemRef = await addDoc(collection(db, 'posItems'), posItemData)

      // Update the reservation document
      await updateDoc(reservationRef, {
        addedToPOS: true,
        posItemId: posItemRef.id
      })

      // Update local state
      const index = reservations.value.findIndex(res => res.id === reservationId)
      if (index !== -1) {
        reservations.value[index] = { 
          ...reservations.value[index], 
          addedToPOS: true,
          posItemId: posItemRef.id
        }
      }

      return { success: true, message: 'Pickup reservation added to POS successfully', posItemId: posItemRef.id }
    } catch (error) {
      console.error('Error adding pickup reservation to POS:', error)
      error.value = error.message
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const removePickupReservationFromPOS = async (reservationId) => {
    isLoading.value = true
    error.value = null
    try {
      const reservationRef = doc(db, 'reservations', reservationId)
      const reservationDoc = await getDoc(reservationRef)
      const reservationData = reservationDoc.data()

      if (!reservationData) {
        throw new Error('Reservation not found')
      }

      if (!reservationData.addedToPOS) {
        throw new Error('This reservation is not in POS')
      }

      // Delete the POS item document
      if (reservationData.posItemId) {
        await deleteDoc(doc(db, 'posItems', reservationData.posItemId))
      }

      // Update the reservation document
      await updateDoc(reservationRef, {
        addedToPOS: false,
        posItemId: null
      })

      // Update local state
      const index = reservations.value.findIndex(res => res.id === reservationId)
      if (index !== -1) {
        reservations.value[index] = { 
          ...reservations.value[index], 
          addedToPOS: false,
          posItemId: null
        }
      }

      return { success: true, message: 'Pickup reservation removed from POS successfully' }
    } catch (error) {
      console.error('Error removing pickup reservation from POS:', error)
      error.value = error.message
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const fetchPOSItems = async () => {
    isLoading.value = true
    error.value = null
    try {
      const querySnapshot = await getDocs(collection(db, 'posItems'))
      
      const posItems = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      return { success: true, posItems }
    } catch (error) {
      console.error('Error fetching POS items:', error)
      error.value = error.message
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const removeItemFromPOS = async (posItemId, itemId) => {
    isLoading.value = true
    error.value = null
    try {
      const posItemRef = doc(db, 'posItems', posItemId)
      const posItemDoc = await getDoc(posItemRef)
      
      if (!posItemDoc.exists()) {
        throw new Error('POS item not found')
      }

      const posItemData = posItemDoc.data()
      const updatedItems = posItemData.items.filter(item => item.id !== itemId)

      if (updatedItems.length === 0) {
        // If no items left, remove the entire POS item
        await deleteDoc(posItemRef)
        
        // Update the reservation
        const reservationRef = doc(db, 'reservations', posItemData.reservationId)
        await updateDoc(reservationRef, { 
          addedToPOS: false,
          posItemId: null
        })
      } else {
        // Update the POS item with the remaining items
        await updateDoc(posItemRef, { items: updatedItems })
      }

      return { success: true, message: 'Item removed from POS successfully' }
    } catch (err) {
      console.error('Error removing item from POS:', err)
      error.value = err.message
      return { success: false, error: err.value }
    } finally {
      isLoading.value = false
    }
  }

  const finalizeSale = async (posItems) => {
    isLoading.value = true
    error.value = null
    try {
      const batch = writeBatch(db)
    
      for (const posItem of posItems) {
        const posItemRef = doc(db, 'posItems', posItem.id)
        batch.delete(posItemRef)

        const reservationRef = doc(db, 'reservations', posItem.reservationId)
        batch.update(reservationRef, { 
          addedToPOS: false,
          status: 'completed'
        })
      }

      await batch.commit()

      // Update local state
      reservations.value = reservations.value.map(res => {
        if (posItems.some(item => item.reservationId === res.id)) {
          return { ...res, addedToPOS: false, status: 'completed' }
        }
        return res
      })

    } catch (err) {
      console.error('Error finalizing sale:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    reservations,
    currentReservation,
    isLoading,
    error,
    createReservation,
    fetchUserReservations,
    fetchAllReservations,
    updateReservation,
    deleteReservation,
    setCurrentReservation,
    clearReservations,
    fetchReservationById,
    notifyDrivers,
    fetchCompletedDeliveries,
    addPickupReservationToPOS,
    removePickupReservationFromPOS,
    fetchPOSItems,
    removeItemFromPOS,
    finalizeSale
  }
})

