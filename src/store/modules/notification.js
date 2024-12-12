// store/modules/notification.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/services/firebase'
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { useAuthStore } from './auth'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  const fetchNotifications = () => {
    const authStore = useAuthStore()
    if (!authStore.user) return

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', authStore.user.uid)
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      notifications.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    })

    return unsubscribe
  }

  const markAsRead = async (notificationId) => {
    const notificationRef = doc(db, 'notifications', notificationId)
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    })
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      notifications.value[index] = { ...notifications.value[index], read: true }
    }
  }

  const markAllAsRead = async () => {
    const authStore = useAuthStore()
    if (!authStore.user) return

    const batch = writeBatch(db)
    const unreadNotifications = notifications.value.filter(n => !n.read)

    unreadNotifications.forEach(notification => {
      const notificationRef = doc(db, 'notifications', notification.id)
      batch.update(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      })
    })

    await batch.commit()
    notifications.value = notifications.value.map(n => ({ ...n, read: true }))
  }

  const addNotification = (notification) => {
    notifications.value.push(notification)
  }

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification
  }
})



