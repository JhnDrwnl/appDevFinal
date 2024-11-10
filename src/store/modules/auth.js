// src/store/modules/auth.js
import { defineStore } from 'pinia'
import { auth, db } from '@/services/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    error: null
  }),
  actions: {
    async login(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
        const userData = userDoc.data()
        this.user = { ...userCredential.user, role: userData?.role || 'user' }
        
        if (this.user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/user')
        }
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
    async register(email, password) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email,
          role: 'user'
        })
        this.user = { ...userCredential.user, role: 'user' }
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
    async logout() {
      try {
        await signOut(auth)
        this.user = null
        router.push('/')
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
    async forgotPassword(email) {
      try {
        await sendPasswordResetEmail(auth, email)
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    currentUser: (state) => state.user
  }
})