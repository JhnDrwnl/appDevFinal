import { defineStore } from 'pinia'
import { db } from '@/services/firebase'
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore'
import { useAuthStore } from './auth'

export const usePickupOrderStore = defineStore('pickupOrder', {
  state: () => ({
    currentOrder: null,
    isLoading: false,
    error: null
  }),

  actions: {
    async addItemToOrder(reservationId, item) {
      this.isLoading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        if (!authStore.user) {
          throw new Error('User is not authenticated')
        }

        if (!this.currentOrder) {
          // Create a new order if it doesn't exist
          const newOrder = {
            reservationId,
            items: [item],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'pending',
            cashierId: authStore.user.uid
          }

          const docRef = await addDoc(collection(db, 'pickupOrders'), newOrder)
          this.currentOrder = { id: docRef.id, ...newOrder }
        } else {
          // Add item to existing order
          const orderRef = doc(db, 'pickupOrders', this.currentOrder.id)
          await updateDoc(orderRef, {
            items: [...this.currentOrder.items, item],
            updatedAt: serverTimestamp()
          })
          this.currentOrder.items.push(item)
        }

        return { success: true, message: 'Item added to order successfully' }
      } catch (error) {
        console.error('Error adding item to order:', error)
        this.error = error.message
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async updateOrderStatus(status) {
      if (!this.currentOrder) {
        throw new Error('No active order to update')
      }

      this.isLoading = true
      this.error = null
      try {
        const orderRef = doc(db, 'pickupOrders', this.currentOrder.id)
        await updateDoc(orderRef, {
          status,
          updatedAt: serverTimestamp()
        })

        this.currentOrder.status = status
        return { success: true, message: 'Order status updated successfully' }
      } catch (error) {
        console.error('Error updating order status:', error)
        this.error = error.message
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async fetchOrderByReservationId(reservationId) {
      this.isLoading = true
      this.error = null
      try {
        const querySnapshot = await getDocs(query(collection(db, 'pickupOrders'), where('reservationId', '==', reservationId)))
        
        if (!querySnapshot.empty) {
          const orderDoc = querySnapshot.docs[0]
          this.currentOrder = { id: orderDoc.id, ...orderDoc.data() }
          return { success: true, order: this.currentOrder }
        } else {
          this.currentOrder = null
          return { success: true, order: null }
        }
      } catch (error) {
        console.error('Error fetching order:', error)
        this.error = error.message
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    clearCurrentOrder() {
      this.currentOrder = null
    }
  }
})