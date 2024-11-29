import { defineStore } from 'pinia'
import { db } from '@/services/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'

export const useCategoryStore = defineStore('categories', {
  state: () => ({
    categories: [],
    isLoading: false,
    error: null
  }),

  getters: {
    getCategoryById: (state) => (id) => state.categories.find(category => category.id === id),
    getCategoryTree: (state) => {
      const buildTree = (items, parentId = null) => {
        return items
          .filter(item => item.parentId === parentId)
          .map(item => ({
            ...item,
            children: buildTree(items, item.id)
          }))
      }
      return buildTree(state.categories)
    }
  },

  actions: {
    async fetchCategories() {
      this.isLoading = true
      try {
        const categoriesCollection = collection(db, 'categories')
        const categoriesSnapshot = await getDocs(categoriesCollection)
        this.categories = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error fetching categories:', error)
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async addCategory(category) {
      try {
        const categoriesCollection = collection(db, 'categories')
        const docRef = await addDoc(categoriesCollection, category)
        this.categories.push({ ...category, id: docRef.id })
      } catch (error) {
        console.error('Error adding category:', error)
        throw error
      }
    },

    async updateCategory(updatedCategory) {
      try {
        const categoryRef = doc(db, 'categories', updatedCategory.id)
        await updateDoc(categoryRef, updatedCategory)
        const index = this.categories.findIndex(c => c.id === updatedCategory.id)
        if (index !== -1) {
          this.categories[index] = updatedCategory
        }
      } catch (error) {
        console.error('Error updating category:', error)
        throw error
      }
    },

    async deleteCategory(id) {
      try {
        await deleteDoc(doc(db, 'categories', id))
        this.categories = this.categories.filter(c => c.id !== id)
      } catch (error) {
        console.error('Error deleting category:', error)
        throw error
      }
    }
  }
})