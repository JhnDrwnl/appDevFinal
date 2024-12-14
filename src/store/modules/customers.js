// store/modules/customers.js
import { defineStore } from 'pinia'
import { db, auth } from '@/services/firebase'
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
      this.isLoading = true;
      this.error = null;
      try {
        const userQuery = query(
          collection(db, 'users'),
          where('role', '==', 'user'),
          orderBy('createdAt', 'desc')
        );
        const userQuerySnapshot = await getDocs(userQuery);
        this.customers = userQuerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastVisit: doc.data().lastVisit ? doc.data().lastVisit.toDate() : null,
          createdAt: doc.data().createdAt.toDate(),
          isGuest: false,
          role: 'user'
        }));
      } catch (error) {
        console.error('Error fetching customers:', error);
        this.error = error.message;
      } finally {
        this.isLoading = false;
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
      this.isLoading = true;
      this.error = null;
      try {
        const customerRef = doc(db, 'users', customerId);
        await updateDoc(customerRef, { isEnabled });
        
        // Update Firebase Auth user
        const user = await auth.getUser(customerId);
        await auth.updateUser(customerId, { disabled: !isEnabled });

        const index = this.customers.findIndex(c => c.id === customerId);
        if (index !== -1) {
          this.customers[index] = { ...this.customers[index], isEnabled };
        }
        return { success: true };
      } catch (error) {
        console.error('Error updating customer status:', error);
        this.error = error.message;
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async updateLastVisit(customerId) {
      const lastVisit = new Date()
      return this.updateCustomer(customerId, { lastVisit })
    }
  }
})

