// store/modules/categoryPriceRules.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/services/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, runTransaction, deleteField } from 'firebase/firestore'
import { useCategoryStore } from './categories'

export const useCategoryPriceRuleStore = defineStore('categoryPriceRules', () => {
  const categoryPriceRules = ref([])
  const loading = ref(false)
  const error = ref(null)
  const categoryStore = useCategoryStore()

  const fetchCategoryPriceRules = async () => {
    loading.value = true
    error.value = null
    try {
      const querySnapshot = await getDocs(collection(db, 'categoryPriceRules'))
      categoryPriceRules.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      console.error('Error fetching category price rules:', err)
      error.value = 'Failed to fetch category price rules'
    } finally {
      loading.value = false
    }
  }

  const addCategoryPriceRule = async (categoryPriceRule) => {
    loading.value = true
    error.value = null
    try {
      const priceRuleData = {
        categoryId: categoryPriceRule.categoryId,
        categoryName: categoryPriceRule.categoryName,
        priceRuleId: categoryPriceRule.priceRuleId,
        priceRuleName: categoryPriceRule.priceRuleName,
        priceRuleValue: categoryPriceRule.priceRuleValue,
        priceRuleType: categoryPriceRule.priceRuleType
      }

      const docRef = await addDoc(collection(db, 'categoryPriceRules'), priceRuleData)
      
      const newRule = { id: docRef.id, ...priceRuleData }
      categoryPriceRules.value.push(newRule)

      // Update the category with the new price rule
      await categoryStore.updateCategoryPriceRule(categoryPriceRule.categoryId, newRule)
      
      return { success: true, id: docRef.id }
    } catch (err) {
      console.error('Error adding category price rule:', err)
      error.value = 'Failed to add category price rule'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateCategoryPriceRule = async (id, updatedRule) => {
    loading.value = true
    error.value = null
    try {
      const priceRuleData = {
        categoryId: updatedRule.categoryId,
        categoryName: updatedRule.categoryName,
        priceRuleId: updatedRule.priceRuleId,
        priceRuleName: updatedRule.priceRuleName,
        priceRuleValue: updatedRule.priceRuleValue,
        priceRuleType: updatedRule.priceRuleType
      }

      const ruleRef = doc(db, 'categoryPriceRules', id)
      await updateDoc(ruleRef, priceRuleData)

      const index = categoryPriceRules.value.findIndex(rule => rule.id === id)
      if (index !== -1) {
        categoryPriceRules.value[index] = { id, ...priceRuleData }
      }

      // Update the category's price rule
      await categoryStore.updateCategoryPriceRule(updatedRule.categoryId, { id, ...priceRuleData })

      return { success: true }
    } catch (err) {
      console.error('Error updating category price rule:', err)
      error.value = 'Failed to update category price rule'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteCategoryPriceRule = async (id, categoryId) => {
    loading.value = true
    error.value = null
    try {
      if (!id || !categoryId) {
        throw new Error('Invalid id or categoryId')
      }

      await runTransaction(db, async (transaction) => {
        const priceRuleRef = doc(db, 'categoryPriceRules', id)
        const categoryRef = doc(db, 'categories', categoryId)

        const priceRuleDoc = await transaction.get(priceRuleRef)
        const categoryDoc = await transaction.get(categoryRef)

        if (!priceRuleDoc.exists()) {
          throw new Error('Price rule not found')
        }

        if (!categoryDoc.exists()) {
          throw new Error('Category not found')
        }

        // Delete the price rule
        transaction.delete(priceRuleRef)

        // Remove the price rule from the category
        transaction.update(categoryRef, { priceRule: deleteField() })

        // Remove price rules from all subcategories
        await categoryStore.removeSubcategoriesPriceRule(categoryId, transaction)
      })

      // Update local states
      categoryPriceRules.value = categoryPriceRules.value.filter(rule => rule.id !== id)
      
      const categoryToUpdate = categoryStore.categories.value?.find(c => c.id === categoryId)
      if (categoryToUpdate) {
        categoryToUpdate.priceRule = null
      }

      return { success: true }
    } catch (err) {
      console.error('Error deleting category price rule:', err)
      error.value = err.message || 'Failed to delete category price rule'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateCategoryNameInPriceRules = async (categoryId, newName) => {
    loading.value = true
    error.value = null
    try {
      const rulesToUpdate = categoryPriceRules.value.filter(rule => rule.categoryId === categoryId)
      
      for (const rule of rulesToUpdate) {
        const ruleRef = doc(db, 'categoryPriceRules', rule.id)
        await updateDoc(ruleRef, { categoryName: newName })
        rule.categoryName = newName
      }

      return { success: true }
    } catch (err) {
      console.error('Error updating category name in price rules:', err)
      error.value = 'Failed to update category name in price rules'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const searchCategories = async (searchQuery) => {
    loading.value = true
    error.value = null
    try {
      const categoriesRef = collection(db, 'categories')
      const querySnapshot = await getDocs(categoriesRef)
    
      const allCategories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
      const results = allCategories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.id.toLowerCase().includes(searchQuery.toLowerCase())
      )

      const categoryMap = new Map(allCategories.map(cat => [cat.id, cat]))

      results.forEach(category => {
        category.parents = []
        if (category.parentIds && category.parentIds.length > 0) {
          category.parents = category.parentIds
            .map(parentId => categoryMap.get(parentId))
            .filter(Boolean)
        }
      })

      const uniqueCategories = new Set(results)

      results.forEach(category => {
        category.parents.forEach(parent => {
          uniqueCategories.add(parent)
        })
      })

      return Array.from(uniqueCategories)
    } catch (err) {
      console.error('Error searching categories:', err)
      error.value = 'Failed to search categories'
      return []
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    categoryPriceRules,
    loading,
    error,
    fetchCategoryPriceRules,
    addCategoryPriceRule,
    updateCategoryPriceRule,
    deleteCategoryPriceRule,
    updateCategoryNameInPriceRules,
    searchCategories,
    clearError
  }
})

