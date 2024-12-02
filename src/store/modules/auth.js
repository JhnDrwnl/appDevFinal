// store/modules/auth.js
// store/modules/auth.js
import { defineStore } from 'pinia'
import { 
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  sendEmailVerification,
  applyActionCode,
  isSignInWithEmailLink,
  signInWithEmailLink,
  reauthenticateWithCredential,
  EmailAuthProvider,
  verifyBeforeUpdateEmail,
  updateProfile
} from '@/services/firebase'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, storage } from '@/services/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    userRole: null,
    error: null,
    isLoading: false,
    isInitialized: false,
    rememberMe: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.userRole === 'admin',
    isEmailVerified: (state) => state.user?.emailVerified ?? false,
    userExists: (state) => !!state.user && !!state.userRole,
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

    async register(email, password, username) {
      try {
        this.isLoading = true
        this.error = null
        
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        
        // Create user document in Firestore with createdAt field
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          username: username || `user${user.uid.substring(0, 8)}`,
          role: 'user',
          createdAt: serverTimestamp()
        })
        
        // Send email verification
        await sendEmailVerification(user)
        
        // Logout the user after registration
        await this.logout()
        
        return { 
          success: true, 
          message: 'Registration successful. Please check your email to verify your account before logging in.' 
        }
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
        } else {
          this.userRole = 'user'
          await this.setUserRole(uid, 'user')
        }
        this.user = { ...this.user, role: this.userRole }
        console.log('User role set:', this.userRole) // Add this line
      } catch (error) {
        console.error('Error fetching user role:', error)
        this.userRole = 'user'
        this.user = { ...this.user, role: 'user' }
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

    async updateUserEmail(newEmail, currentPassword) {
      try {
        this.isLoading = true
        this.error = null

        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          currentPassword
        )
        await reauthenticateWithCredential(auth.currentUser, credential)

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

    async changeEmailWithVerification(newEmail, currentPassword) {
      try {
        this.isLoading = true;
        this.error = null;

        // Re-authenticate the user
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);

        // Use verifyBeforeUpdateEmail instead of updateEmail
        await verifyBeforeUpdateEmail(auth.currentUser, newEmail);

        // Update email in Firestore
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, { email: newEmail });

        // Update local user state
        this.user = { ...this.user, email: newEmail };

        return { 
          success: true, 
          message: 'A verification email has been sent to your new address. Please check your inbox and verify your new email to complete the change. Firestore has been updated with the new email.' 
        };
      } catch (error) {
        console.error('Change email error:', error);
        this.error = this.getErrorMessage(error.code);
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async changePassword(currentPassword, newPassword) {
      try {
        this.isLoading = true;
        this.error = null;

        // Check if the new password is the same as the current password
        if (currentPassword === newPassword) {
          return { 
            success: false, 
            error: 'New password must be different from the current password.' 
          };
        }

        // Re-authenticate the user
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          currentPassword
        );
        
        try {
          await reauthenticateWithCredential(auth.currentUser, credential);
        } catch (reauthError) {
          console.error('Reauthentication error:', reauthError);
          return { 
            success: false, 
            error: 'Current password is incorrect. Please try again.' 
          };
        }

        // Update the password
        await updatePassword(auth.currentUser, newPassword);

        return { 
          success: true, 
          message: 'Password has been successfully updated.' 
        };
      } catch (error) {
        console.error('Change password error:', error);
        this.error = this.getErrorMessage(error.code);
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async updateProfilePicture(file) {
      this.isLoading = true
      try {
        console.log('Starting profile picture update process')

        // 1. Upload to Firebase Storage
        const fileRef = ref(storage, `profile_pictures/${this.user.uid}`)
        console.log('Uploading file to Firebase Storage')
        await uploadBytes(fileRef, file)
        console.log('File uploaded successfully')

        // 2. Get download URL
        console.log('Getting download URL')
        const photoURL = await getDownloadURL(fileRef)
        console.log('Download URL obtained:', photoURL)

        // 3. Update Auth profile
        console.log('Updating Auth profile')
        await updateProfile(auth.currentUser, { photoURL })
        console.log('Auth profile updated successfully')

        // 4. Update Firestore
        console.log('Updating Firestore document')
        const userDocRef = doc(db, 'users', this.user.uid)
        await setDoc(userDocRef, { photoURL }, { merge: true })
        console.log('Firestore document updated successfully')

        // 5. Update local user state
        this.user = { ...this.user, photoURL }
        console.log('Local user state updated')

        this.isLoading = false
        console.log('Profile picture update process completed successfully')
        return {
          success: true,
          message: 'Profile picture updated successfully',
          photoURL
        }
      } catch (error) {
        console.error('Error in updateProfilePicture:', error)
        this.isLoading = false
        return {
          success: false,
          error: error.message
        }
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