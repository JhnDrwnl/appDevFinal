import { defineStore } from 'pinia'
import { 
  auth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  sendEmailVerification,
  applyActionCode,
  isSignInWithEmailLink,
  signInWithEmailLink
} from '@/services/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    userRole: null,
    error: null,
    isLoading: false,
    isInitialized: false,
    userExists: false,
    rememberMe: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.userRole === 'admin',
    isEmailVerified: (state) => state.user?.emailVerified ?? false,
  },

  actions: {
    async initializeAuth() {
      if (this.isInitialized) return

      this.rememberMe = localStorage.getItem('rememberMe') === 'true'
      await setPersistence(auth, this.rememberMe ? browserLocalPersistence : browserSessionPersistence)

      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            this.user = user
            await this.fetchUserRole(user.uid)
          } else {
            this.user = null
            this.userRole = null
            this.userExists = false
          }
          this.isLoading = false
          this.isInitialized = true
          unsubscribe()
          resolve()
        })
      })
    },

    async login(email, password, rememberMe = false) {
      try {
        this.isLoading = true
        this.error = null
        
        this.rememberMe = rememberMe
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        this.user = userCredential.user
        
        if (!this.user.emailVerified) {
          await this.logout()
          return { success: false, error: 'Please verify your email before logging in.' }
        }
        
        await this.fetchUserRole(this.user.uid)
        localStorage.setItem('rememberMe', rememberMe.toString())
        return { success: true }
      } catch (error) {
        console.error('Login error:', error)
        this.error = this.getErrorMessage(error.code)
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async register(email, password) {
      try {
        this.isLoading = true
        this.error = null
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        
        const temporaryUsername = `user${user.uid.substring(0, 8)}`
        await updateProfile(user, { displayName: temporaryUsername })
        
        await this.setUserRole(user.uid, 'user', temporaryUsername)
        
        // Send email verification
        await sendEmailVerification(user)
        
        // Logout the user immediately after registration
        await this.logout()
        
        return { success: true, message: 'Registration successful. Please check your email to verify your account before logging in.' }
      } catch (error) {
        console.error('Registration error:', error)
        this.error = this.getErrorMessage(error.code)
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        await signOut(auth)
        this.user = null
        this.userRole = null
        this.error = null
        this.userExists = false
        this.rememberMe = false
        localStorage.removeItem('rememberMe')
      } catch (error) {
        console.error('Logout error:', error)
        this.error = this.getErrorMessage(error.code)
      }
    },

    async fetchUserRole(uid) {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid))
        if (userDoc.exists()) {
          this.userRole = userDoc.data().role || 'user'
          this.userExists = true
        } else {
          this.userRole = 'user'
          this.userExists = false
          await this.setUserRole(uid, 'user')
        }
        this.user = { ...this.user, role: this.userRole }
      } catch (error) {
        console.error('Error fetching user role:', error)
        this.userRole = 'user'
        this.user = { ...this.user, role: 'user' }
        this.userExists = false
      }
    },

    async setUserRole(uid, role, username) {
      try {
        await setDoc(doc(db, 'users', uid), { 
          role, 
          username: username || `user${uid.substring(0, 8)}` 
        }, { merge: true })
        this.userRole = role
        this.user = { ...this.user, role: role, username: username }
        this.userExists = true
      } catch (error) {
        console.error('Error setting user role:', error)
        throw error
      }
    },

    async sendPasswordResetEmail(email) {
      try {
        this.isLoading = true
        this.error = null
        await sendPasswordResetEmail(auth, email)
        return { success: true, message: 'Password reset email sent. Please check your inbox.' }
      } catch (error) {
        console.error('Password reset email error:', error)
        this.error = this.getErrorMessage(error.code)
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async updateUserProfile(displayName) {
      try {
        this.isLoading = true
        this.error = null
        await updateProfile(auth.currentUser, { displayName })
        this.user = { ...this.user, displayName }
        return { success: true, message: 'Profile updated successfully.' }
      } catch (error) {
        console.error('Update profile error:', error)
        this.error = this.getErrorMessage(error.code)
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async updateUserEmail(newEmail) {
      try {
        this.isLoading = true
        this.error = null
        await updateEmail(auth.currentUser, newEmail)
        this.user = { ...this.user, email: newEmail }
        return { success: true, message: 'Email updated successfully.' }
      } catch (error) {
        console.error('Update email error:', error)
        this.error = this.getErrorMessage(error.code)
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async updateUserPassword(newPassword) {
      try {
        this.isLoading = true
        this.error = null
        await updatePassword(auth.currentUser, newPassword)
        return { success: true, message: 'Password updated successfully.' }
      } catch (error) {
        console.error('Update password error:', error)
        this.error = this.getErrorMessage(error.code)
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async verifyEmail(actionCode) {
      try {
        this.isLoading = true
        this.error = null
        await applyActionCode(auth, actionCode)
        
        if (auth.currentUser) {
          await auth.currentUser.reload()
          this.user = auth.currentUser
        }
        
        const email = auth.currentUser ? auth.currentUser.email : null
        
        return { success: true, message: 'Email verified successfully.', email }
      } catch (error) {
        console.error('Email verification error:', error)
        this.error = this.getErrorMessage(error.code)
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async loginWithVerifiedEmail(email) {
      try {
        this.isLoading = true
        this.error = null
        
        const userRecord = await this.getUserByEmail(email)
        if (userRecord && userRecord.emailVerified) {
          await this.silentLogin(email)
          return { success: true, message: 'Logged in successfully.' }
        } else {
          return { success: false, error: 'User not found or email not verified.' }
        }
      } catch (error) {
        console.error('Login with verified email error:', error)
        this.error = this.getErrorMessage(error.code)
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async getUserByEmail(email) {
      // This is a placeholder function. In a real-world scenario, you would
      // need to implement this on your backend, as Firebase doesn't provide
      // a direct way to get a user by email from the client-side.
      // For now, we'll assume the user exists and is verified.
      return { email, emailVerified: true }
    },

    async silentLogin(email) {
      // This is a placeholder function. In a real-world scenario, you would
      // need to implement this on your backend to generate a custom token
      // or use another method to silently log in the user.
      // For now, we'll simulate a successful login.
      this.user = { email, emailVerified: true }
      await this.fetchUserRole(this.user.uid)
    },

    async handleEmailLink(email) {
      try {
        this.isLoading = true
        this.error = null
        
        if (isSignInWithEmailLink(auth, window.location.href)) {
          await signInWithEmailLink(auth, email, window.location.href)
          this.user = auth.currentUser
          await this.fetchUserRole(this.user.uid)
          return { success: true, message: 'Email verified and signed in successfully.' }
        } else {
          throw new Error('Invalid email link')
        }
      } catch (error) {
        console.error('Email link handling error:', error)
        this.error = this.getErrorMessage(error.code)
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async resendVerificationEmail() {
      try {
        this.isLoading = true
        this.error = null
        if (this.user && !this.user.emailVerified) {
          await sendEmailVerification(this.user)
          return { success: true, message: 'Verification email sent. Please check your inbox.' }
        } else {
          throw new Error('User is not logged in or email is already verified')
        }
      } catch (error) {
        console.error('Resend verification email error:', error)
        this.error = this.getErrorMessage(error.code)
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    getErrorMessage(code) {
      const errorMessages = {
        'auth/invalid-credential': 'Invalid email or password',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'Invalid email or password',
        'auth/wrong-password': 'Invalid email or password',
        'auth/email-already-in-use': 'Email already in use',
        'auth/weak-password': 'Password is too weak',
        'auth/invalid-email': 'Invalid email address',
        'auth/operation-not-allowed': 'Operation not allowed',
        'auth/network-request-failed': 'Network error. Please check your connection',
        'auth/too-many-requests': 'Too many attempts. Please try again later',
        'auth/popup-closed-by-user': 'Authentication popup was closed',
        'auth/unauthorized-domain': 'This domain is not authorized',
        'auth/requires-recent-login': 'This operation requires recent authentication. Please log in again.',
        'auth/user-token-expired': 'Your session has expired. Please log in again.',
      }
      return errorMessages[code] || 'An unexpected error occurred'
    },
  }
})