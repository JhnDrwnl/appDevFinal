import { defineStore } from 'pinia'
import { db } from '@/services/firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore'
import { useAuthStore } from './auth'

export const useAddressStore = defineStore('address', {
  state: () => ({
    addresses: [],
    currentAddress: null,
    isLoading: false,
    error: null
  }),

  getters: {
    getUserAddresses: (state) => state.addresses,
    getCurrentAddress: (state) => state.currentAddress,
    getDefaultAddress: (state) => state.addresses.find(addr => addr.isDefault)
  },

  actions: {
    async createAddress(addressData) {
      this.isLoading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        if (!authStore.user) {
          throw new Error('User is not authenticated')
        }
        const userId = authStore.user.uid

        const uniqueId = `${addressData.fullName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`
        
        const newAddress = {
          id: uniqueId,
          userId,
          ...addressData,
          isDefault: this.addresses.length === 0, // Set as default if it's the first address
          createdAt: new Date().toISOString()
        }

        const docRef = await addDoc(collection(db, 'shippingAddresses'), newAddress)
        newAddress.docId = docRef.id
        this.addresses.push(newAddress)

        // If this is the first address, set it as default
        if (this.addresses.length === 1) {
          await this.setDefaultAddress(newAddress.docId)
        }

        return { success: true, message: 'Address created successfully', address: newAddress }
      } catch (error) {
        console.error('Error creating address:', error)
        this.error = error.message
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async fetchUserAddresses() {
      this.isLoading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        if (!authStore.user) {
          throw new Error('User is not authenticated')
        }
        const userId = authStore.user.uid

        const q = query(collection(db, 'shippingAddresses'), where('userId', '==', userId))
        const querySnapshot = await getDocs(q)
        
        this.addresses = querySnapshot.docs.map(doc => ({
          docId: doc.id,
          ...doc.data()
        }))

        // Sort addresses so that the default address appears first
        this.addresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))

        return { success: true, addresses: this.addresses }
      } catch (error) {
        console.error('Error fetching addresses:', error)
        this.error = error.message
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async fetchAllAddresses() {
      this.isLoading = true
      this.error = null
      try {
        const querySnapshot = await getDocs(collection(db, 'shippingAddresses'))
        
        const allAddresses = querySnapshot.docs.map(doc => ({
          docId: doc.id,
          ...doc.data()
        }))

        return { success: true, addresses: allAddresses }
      } catch (error) {
        console.error('Error fetching all addresses:', error)
        this.error = error.message
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async updateAddress(addressId, updatedData) {
      this.isLoading = true
      this.error = null
      try {
        const addressRef = doc(db, 'shippingAddresses', addressId)
        await updateDoc(addressRef, updatedData)

        const index = this.addresses.findIndex(addr => addr.docId === addressId)
        if (index !== -1) {
          this.addresses[index] = { ...this.addresses[index], ...updatedData }
        }

        // Re-sort addresses if the default status changed
        if ('isDefault' in updatedData) {
          this.addresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
        }

        return { success: true, message: 'Address updated successfully' }
      } catch (error) {
        console.error('Error updating address:', error)
        this.error = error.message
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async deleteAddress(addressId) {
      this.isLoading = true
      this.error = null
      try {
        await deleteDoc(doc(db, 'shippingAddresses', addressId))
        this.addresses = this.addresses.filter(addr => addr.docId !== addressId)

        // If the deleted address was the default, set a new default if there are remaining addresses
        if (this.addresses.length > 0 && !this.addresses.some(addr => addr.isDefault)) {
          await this.setDefaultAddress(this.addresses[0].docId)
        }

        return { success: true, message: 'Address deleted successfully' }
      } catch (error) {
        console.error('Error deleting address:', error)
        this.error = error.message
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async setDefaultAddress(addressId) {
      this.isLoading = true
      this.error = null
      try {
        const batch = writeBatch(db)

        // Set the new default address
        const newDefaultRef = doc(db, 'shippingAddresses', addressId)
        batch.update(newDefaultRef, { isDefault: true })

        // Remove default status from all other addresses
        this.addresses.forEach(addr => {
          if (addr.docId !== addressId && addr.isDefault) {
            const addressRef = doc(db, 'shippingAddresses', addr.docId)
            batch.update(addressRef, { isDefault: false })
          }
        })

        await batch.commit()

        // Update local state
        this.addresses = this.addresses.map(addr => ({
          ...addr,
          isDefault: addr.docId === addressId
        }))

        // Re-sort addresses
        this.addresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))

        return { success: true, message: 'Default address set successfully' }
      } catch (error) {
        console.error('Error setting default address:', error)
        this.error = error.message
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    setCurrentAddress(address) {
      this.currentAddress = address
    },

    clearAddresses() {
      this.addresses = []
      this.currentAddress = null
    }
  }
})