// store/modules/employees.js
import { defineStore } from 'pinia'
import { db } from '@/services/firebase'
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { useAuthStore } from './auth'

export const useEmployeeStore = defineStore('employees', {
  state: () => ({
    employees: [],
    isLoading: false,
    error: null
  }),

  getters: {
    filteredEmployees: (state) => state.employees.filter(employee => 
      ['admin', 'stock manager', 'cashier', 'driver'].includes(employee.role)
    )
  },

  actions: {
    async fetchEmployees() {
      this.isLoading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('You must be logged in to view employees')
        }

        const employeesCollection = collection(db, 'users')
        const q = query(
          employeesCollection,
          where('role', 'in', ['admin', 'stock manager', 'cashier', 'driver'])
        )
        const employeesSnapshot = await getDocs(q)
        this.employees = employeesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error fetching employees:', error)
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async searchEmployees(searchQuery) {
      this.isLoading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('You must be logged in to search employees')
        }

        const employeesCollection = collection(db, 'users')
        const q = query(
          employeesCollection,
          where('role', 'in', ['admin', 'stock manager', 'cashier', 'driver'])
        )
        const querySnapshot = await getDocs(q)
        
        const searchLower = searchQuery.toLowerCase()
        this.employees = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(employee => 
            employee.email?.toLowerCase().includes(searchLower) ||
            employee.username?.toLowerCase().includes(searchLower) ||
            employee.role?.toLowerCase().includes(searchLower)
          )
      } catch (error) {
        console.error('Error searching employees:', error)
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async updateEmployeeRole(userId, newRole) {
      this.isLoading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated || !authStore.isAdmin) {
          throw new Error('You must be logged in as an admin to update employee roles')
        }

        const employeeRef = doc(db, 'users', userId)
        await updateDoc(employeeRef, {
          role: newRole
        })

        // Update the local state
        const index = this.employees.findIndex(e => e.id === userId)
        if (index !== -1) {
          this.employees[index] = { ...this.employees[index], role: newRole }
        } else {
          // If the employee wasn't in the local state, fetch their data and add them
          const updatedEmployeeDoc = await getDoc(employeeRef)
          if (updatedEmployeeDoc.exists()) {
            this.employees.push({
              id: userId,
              ...updatedEmployeeDoc.data()
            })
          }
        }

        return { success: true }
      } catch (error) {
        console.error('Error updating employee role:', error)
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteEmployee(employeeId) {
      this.isLoading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated || !authStore.isAdmin) {
          throw new Error('You must be logged in as an admin to delete employees')
        }

        // Delete the document from Firestore
        await deleteDoc(doc(db, 'users', employeeId))

        // Remove from local state
        this.employees = this.employees.filter(e => e.id !== employeeId)

        return { success: true }
      } catch (error) {
        console.error('Error deleting employee:', error)
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})

