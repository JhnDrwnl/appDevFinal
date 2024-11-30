// store/modules/categories.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/services/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, increment } from 'firebase/firestore'

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'))
      categories.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        productCount: doc.data().productCount || 0,
        parentIds: doc.data().parentIds || []
      }))
    } catch (err) {
      console.error('Error fetching categories:', err)
      error.value = 'Failed to fetch categories'
    } finally {
      loading.value = false
    }
  }

  const addCategory = async (category) => {
    loading.value = true
    error.value = null
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...category,
        productCount: 0,
        parentIds: category.parentIds || []
      })
      const newCategory = { id: docRef.id, ...category, productCount: 0 }
      categories.value.push(newCategory)
      return { success: true, category: newCategory }
    } catch (err) {
      console.error('Error adding category:', err)
      error.value = 'Failed to add category'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateCategory = async (id, updatedCategory) => {
    loading.value = true
    error.value = null
    try {
      const categoryRef = doc(db, 'categories', id)
      await updateDoc(categoryRef, updatedCategory)
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = { ...categories.value[index], ...updatedCategory }
      }
      return { success: true }
    } catch (err) {
      console.error('Error updating category:', err)
      error.value = 'Failed to update category'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (id) => {
    loading.value = true
    error.value = null
    try {
      await deleteDoc(doc(db, 'categories', id))
      categories.value = categories.value.filter(c => c.id !== id)
      // Remove the deleted category from parentIds of other categories
      for (const category of categories.value) {
        if (category.parentIds && category.parentIds.includes(id)) {
          const updatedParentIds = category.parentIds.filter(parentId => parentId !== id)
          await updateCategory(category.id, { parentIds: updatedParentIds })
        }
      }
      return { success: true }
    } catch (err) {
      console.error('Error deleting category:', err)
      error.value = 'Failed to delete category'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const incrementProductCount = async (categoryId) => {
    try {
      const categoryRef = doc(db, 'categories', categoryId);
      await updateDoc(categoryRef, {
        productCount: increment(1)
      });
      const updatedCategory = categories.value.find(c => c.id === categoryId);
      if (updatedCategory) {
        updatedCategory.productCount = (updatedCategory.productCount || 0) + 1;
      }
    } catch (error) {
      console.error('Error incrementing product count:', error);
    }
  }

  const decrementProductCount = async (categoryId) => {
    try {
      const categoryRef = doc(db, 'categories', categoryId);
      await updateDoc(categoryRef, {
        productCount: increment(-1)
      });
      const updatedCategory = categories.value.find(c => c.id === categoryId);
      if (updatedCategory && updatedCategory.productCount > 0) {
        updatedCategory.productCount--;
      }
    } catch (error) {
      console.error('Error decrementing product count:', error);
    }
  }

  const getCategoryById = computed(() => (id) => {
    return categories.value.find(c => c.id === id)
  })

  const getRootCategories = computed(() => {
    return categories.value.filter(c => !c.parentIds || c.parentIds.length === 0)
  })

  const getChildCategories = computed(() => (parentId) => {
    return categories.value.filter(c => c.parentIds && c.parentIds.includes(parentId))
  })

  const clearError = () => {
    error.value = null
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    incrementProductCount,
    decrementProductCount,
    getCategoryById,
    getRootCategories,
    getChildCategories,
    clearError
  }
})



