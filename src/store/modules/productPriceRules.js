// store/modules/productPriceRules.js
import { defineStore } from 'pinia'
import { db } from '@/services/firebase'
import { collection, getDocs, setDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'

export const useProductPriceRuleStore = defineStore('productPriceRules', {
  state: () => ({
    productPriceRules: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchProductPriceRules() {
      this.loading = true
      try {
        const querySnapshot = await getDocs(collection(db, 'productPriceRules'))
        this.productPriceRules = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async addProductPriceRule(productPriceRule) {
      try {
        // Create a composite key using productName and priceRuleName
        const compositeId = `${productPriceRule.productName}_${productPriceRule.priceRuleName}`.replace(/\s+/g, '_').toLowerCase()
        
        // Use setDoc with merge option to either add a new document or update an existing one
        await setDoc(doc(db, 'productPriceRules', compositeId), productPriceRule, { merge: true })
        
        // Update the local state
        const existingIndex = this.productPriceRules.findIndex(rule => rule.id === compositeId)
        if (existingIndex !== -1) {
          this.productPriceRules[existingIndex] = { id: compositeId, ...productPriceRule }
        } else {
          this.productPriceRules.push({ id: compositeId, ...productPriceRule })
        }
        
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async updateProductPriceRule(id, updatedProductPriceRule) {
      try {
        await updateDoc(doc(db, 'productPriceRules', id), updatedProductPriceRule)
        const index = this.productPriceRules.findIndex(rule => rule.id === id)
        if (index !== -1) {
          this.productPriceRules[index] = { id, ...updatedProductPriceRule }
        }
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async deleteProductPriceRule(id) {
      try {
        await deleteDoc(doc(db, 'productPriceRules', id))
        this.productPriceRules = this.productPriceRules.filter(rule => rule.id !== id)
        return { success: true }
      } catch (error) {
        this.error = error.message
        return { success: false, error: error.message }
      }
    },

    async searchProducts(searchQuery) {
      this.loading = true
      this.error = null
      try {
        const productsRef = collection(db, 'products')
        const querySnapshot = await getDocs(productsRef)
        
        const searchLower = searchQuery.toLowerCase()
        let matchedProducts = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(product => product.name.toLowerCase().includes(searchLower))
          .sort((a, b) => {
            const aIndex = a.name.toLowerCase().indexOf(searchLower)
            const bIndex = b.name.toLowerCase().indexOf(searchLower)
            if (aIndex === bIndex) {
              return a.name.localeCompare(b.name)
            }
            return aIndex - bIndex
          })
          .slice(0, 5)

        return matchedProducts
      } catch (error) {
        console.error('Error searching products:', error)
        this.error = error.message
        return []
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    }
  }
})




