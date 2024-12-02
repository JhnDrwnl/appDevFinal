// store/modules/categories.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/services/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, increment, runTransaction } from 'firebase/firestore'
import { useCategoryPriceRuleStore } from './categoryPriceRules'

export const useCategoryStore = defineStore('categories', () => {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)
  const categoryPriceRuleStore = useCategoryPriceRuleStore()

  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'))
      categories.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        productCount: doc.data().productCount || 0,
        parentIds: doc.data().parentIds || [],
        priceRule: doc.data().priceRule || null
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
        parentIds: category.parentIds || [],
        priceRule: null
      })
      const newCategory = { id: docRef.id, ...category, productCount: 0, priceRule: null }
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
        const oldCategory = categories.value[index]
        categories.value[index] = { ...oldCategory, ...updatedCategory }
        
        if (updatedCategory.name && updatedCategory.name !== oldCategory.name) {
          await categoryPriceRuleStore.updateCategoryNameInPriceRules(id, updatedCategory.name)
          
          if (oldCategory.priceRule) {
            const updatedPriceRule = {
              ...oldCategory.priceRule,
              categoryName: updatedCategory.name
            }
            await categoryPriceRuleStore.updateCategoryPriceRule(oldCategory.priceRule.id, updatedPriceRule)
          }
        }
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
      const categoryToDelete = categories.value.find(c => c.id === id)
      if (!categoryToDelete) {
        throw new Error('Category not found')
      }

      await deleteDoc(doc(db, 'categories', id))
      categories.value = categories.value.filter(c => c.id !== id)

      for (const category of categories.value) {
        let updateNeeded = false
        let updatedCategory = { ...category }

        if (category.parentIds && category.parentIds.includes(id)) {
          updatedCategory.parentIds = category.parentIds.filter(parentId => parentId !== id)
          updateNeeded = true
        }

        if (updateNeeded) {
          await updateCategory(category.id, updatedCategory)
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
      const categoryRef = doc(db, 'categories', categoryId)
      await updateDoc(categoryRef, {
        productCount: increment(1)
      })
      const updatedCategory = categories.value.find(c => c.id === categoryId)
      if (updatedCategory) {
        updatedCategory.productCount = (updatedCategory.productCount || 0) + 1
      }
    } catch (error) {
      console.error('Error incrementing product count:', error)
    }
  }

  const decrementProductCount = async (categoryId) => {
    try {
      const categoryRef = doc(db, 'categories', categoryId)
      await updateDoc(categoryRef, {
        productCount: increment(-1)
      })
      const updatedCategory = categories.value.find(c => c.id === categoryId)
      if (updatedCategory && updatedCategory.productCount > 0) {
        updatedCategory.productCount--
      }
    } catch (error) {
      console.error('Error decrementing product count:', error)
    }
  }

  const updateCategoryPriceRule = async (categoryId, priceRuleData) => {
    loading.value = true
    error.value = null
    try {
      const categoryToUpdate = categories.value.find(c => c.id === categoryId)
      if (!categoryToUpdate) {
        throw new Error('Category not found')
      }

      const priceRule = priceRuleData ? {
        id: priceRuleData.id,
        priceRuleId: priceRuleData.priceRuleId,
        priceRuleName: priceRuleData.priceRuleName,
        priceRuleValue: priceRuleData.priceRuleValue,
        priceRuleType: priceRuleData.priceRuleType
      } : null

      await updateDoc(doc(db, 'categories', categoryId), {
        priceRule: priceRule
      })

      categoryToUpdate.priceRule = priceRule

      await updateSubcategoriesPriceRule(categoryId, priceRule)

      return { success: true }
    } catch (err) {
      console.error('Error updating category price rule:', err)
      error.value = 'Failed to update category price rule'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateSubcategoriesPriceRule = async (parentId, priceRuleData) => {
    const subcategories = categories.value.filter(c => c.parentIds && c.parentIds.includes(parentId))
    for (const subcategory of subcategories) {
      await updateDoc(doc(db, 'categories', subcategory.id), {
        priceRule: priceRuleData
      })
      subcategory.priceRule = priceRuleData
      await updateSubcategoriesPriceRule(subcategory.id, priceRuleData)
    }
  }

  const removeCategoryPriceRule = async (categoryId) => {
    loading.value = true
    error.value = null
    try {
      await runTransaction(db, async (transaction) => {
        const categoryRef = doc(db, 'categories', categoryId)
        const categoryDoc = await transaction.get(categoryRef)

        if (!categoryDoc.exists()) {
          throw new Error('Category not found')
        }

        const categoryData = categoryDoc.data()
        if (!categoryData.priceRule) {
          throw new Error('No price rule to remove')
        }

        const priceRuleId = categoryData.priceRule.id

        // Remove price rule from category
        transaction.update(categoryRef, { priceRule: null })

        // Remove price rule from categoryPriceRules collection
        const priceRuleRef = doc(db, 'categoryPriceRules', priceRuleId)
        transaction.delete(priceRuleRef)

        // Update local state
        const categoryToUpdate = categories.value.find(c => c.id === categoryId)
        if (categoryToUpdate) {
          categoryToUpdate.priceRule = null
        }
        categoryPriceRuleStore.categoryPriceRules.value = categoryPriceRuleStore.categoryPriceRules.value.filter(rule => rule.id !== priceRuleId)
      })

      // Remove price rule from subcategories recursively
      await removeSubcategoriesPriceRule(categoryId)

      return { success: true }
    } catch (err) {
      console.error('Error removing category price rule:', err)
      error.value = err.message || 'Failed to remove category price rule'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const removeSubcategoriesPriceRule = async (parentId) => {
    const subcategories = categories.value.filter(c => c.parentIds && c.parentIds.includes(parentId))
    for (const subcategory of subcategories) {
      if (subcategory.priceRule) {
        await removeCategoryPriceRule(subcategory.id)
      }
      await removeSubcategoriesPriceRule(subcategory.id)
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
    updateCategoryPriceRule,
    removeCategoryPriceRule,
    removeSubcategoriesPriceRule,
    getCategoryById,
    getRootCategories,
    getChildCategories,
    clearError
  }
})

