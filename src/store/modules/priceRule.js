import { defineStore } from 'pinia'
import { db } from '@/services/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'

export const usePriceRuleStore = defineStore('priceRules', {
  state: () => ({
    priceRules: [],
    isLoading: false,
    error: null
  }),

  getters: {
    getPriceRuleById: (state) => (id) => state.priceRules.find(rule => rule.id === id)
  },

  actions: {
    async fetchPriceRules() {
      this.isLoading = true
      try {
        const priceRulesCollection = collection(db, 'priceRules')
        const priceRulesSnapshot = await getDocs(priceRulesCollection)
        this.priceRules = priceRulesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error fetching price rules:', error)
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async addPriceRule(priceRule) {
      try {
        const priceRulesCollection = collection(db, 'priceRules')
        const docRef = await addDoc(priceRulesCollection, priceRule)
        this.priceRules.push({ ...priceRule, id: docRef.id })
      } catch (error) {
        console.error('Error adding price rule:', error)
        throw error
      }
    },

    async updatePriceRule(updatedPriceRule) {
      try {
        const priceRuleRef = doc(db, 'priceRules', updatedPriceRule.id)
        await updateDoc(priceRuleRef, updatedPriceRule)
        const index = this.priceRules.findIndex(r => r.id === updatedPriceRule.id)
        if (index !== -1) {
          this.priceRules[index] = updatedPriceRule
        }
      } catch (error) {
        console.error('Error updating price rule:', error)
        throw error
      }
    },

    async deletePriceRule(id) {
      try {
        await deleteDoc(doc(db, 'priceRules', id))
        this.priceRules = this.priceRules.filter(r => r.id !== id)
      } catch (error) {
        console.error('Error deleting price rule:', error)
        throw error
      }
    }
  }
})