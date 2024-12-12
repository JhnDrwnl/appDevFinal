import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/services/firebase'
import { collection, addDoc, getDocs, doc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore'

export const useRemovalRequestStore = defineStore('removalRequests', () => {
  const removalRequests = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const createRemovalRequest = async (posItemId, itemId, reason) => {
    isLoading.value = true
    error.value = null
    try {
      const newRequest = {
        posItemId,
        itemId,
        reason,
        status: 'pending',
        createdAt: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'removalRequests'), newRequest)
      newRequest.id = docRef.id
      removalRequests.value.push(newRequest)
      return { success: true, message: 'Removal request created successfully' }
    } catch (err) {
      console.error('Error creating removal request:', err)
      error.value = err.message
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const fetchRemovalRequests = async () => {
    isLoading.value = true
    error.value = null
    try {
      const q = query(collection(db, 'removalRequests'), where('status', '==', 'pending'))
      const querySnapshot = await getDocs(q)
      removalRequests.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return { success: true, removalRequests: removalRequests.value }
    } catch (err) {
      console.error('Error fetching removal requests:', err)
      error.value = err.message
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const deleteRemovalRequest = async (requestId) => {
    isLoading.value = true
    error.value = null
    try {
      await deleteDoc(doc(db, 'removalRequests', requestId))
      removalRequests.value = removalRequests.value.filter(req => req.id !== requestId)
      return { success: true, message: 'Removal request deleted successfully' }
    } catch (err) {
      console.error('Error deleting removal request:', err)
      error.value = err.message
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    removalRequests,
    isLoading,
    error,
    createRemovalRequest,
    fetchRemovalRequests,
    deleteRemovalRequest
  }
})

