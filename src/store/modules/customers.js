import { defineStore } from 'pinia'
import { db } from '@/services/firebase'
import { collection, query, getDocs, doc, getDoc, updateDoc, where, orderBy } from 'firebase/firestore'

export const useCustomerStore = defineStore('customers', {
  state: () => ({
    customers: [],
    isLoading: false,
    error: null
  }),

  getters: {
    getCustomerById: (state) => (id) => state.customers.find(customer => customer.id === id)
  },

  actions: {
    async fetchCustomers() {
      this.isLoading = true
      this.error = null
      try {
        const q = query(
          collection(db, 'users'),
          where('role', '==', 'user'),
          orderBy('createdAt', 'desc')
        )
        const querySnapshot = await getDocs(q)
        this.customers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastVisit: doc.data().lastVisit ? doc.data().lastVisit.toDate() : null,
          createdAt: doc.data().createdAt.toDate()
        }))
      } catch (error) {
        console.error('Error fetching customers:', error)
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async fetchCustomer(id) {
      this.isLoading = true
      this.error = null
      try {
        const docRef = doc(db, 'users', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          return {
            id: docSnap.id,
            ...data,
            lastVisit: data.lastVisit ? data.lastVisit.toDate() : null,
            createdAt: data.createdAt.toDate()
          }
        } else {
          throw new Error('Customer not found')
        }
      } catch (error) {
        console.error('Error fetching customer:', error)
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateCustomer(customerId, updateData) {
      this.isLoading = true
      this.error = null
      try {
        const customerRef = doc(db, 'users', customerId)
        await updateDoc(customerRef, updateData)
        const index = this.customers.findIndex(c => c.id === customerId)
        if (index !== -1) {
          this.customers[index] = { ...this.customers[index], ...updateData }
        }
        return { success: true }
      } catch (error) {
        console.error('Error updating customer:', error)
        this.error = error.message
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async toggleCustomerStatus(customerId, isEnabled) {
      return this.updateCustomer(customerId, { isEnabled })
    },

    async updateLastVisit(customerId) {
      const lastVisit = new Date()
      return this.updateCustomer(customerId, { lastVisit })
    }
  }
})