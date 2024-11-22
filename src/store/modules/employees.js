// store/modules/employees.js
import { defineStore } from 'pinia'
import { db } from '@/services/firebase'
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { useAuthStore } from './auth'

export const useEmployeeStore = defineStore('employees', {
  state: () => ({
    employees: [],
    isLoading: false,
    error: null
  }),

  getters: {
    filteredEmployees: (state) => state.employees.filter(employee => 
      ['admin', 'manager', 'stock manager', 'cashier', 'driver'].includes(employee.role)
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
          where('role', 'in', ['admin', 'manager', 'stock manager', 'cashier', 'driver'])
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
          where('role', 'in', ['admin', 'manager', 'stock manager', 'cashier', 'driver'])
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

    async updateEmployee(updatedEmployee) {
      this.isLoading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('You must be logged in to update employees')
        }

        const employeeRef = doc(db, 'users', updatedEmployee.id)
        await updateDoc(employeeRef, {
          username: updatedEmployee.username,
          email: updatedEmployee.email,
          role: updatedEmployee.role,
          status: updatedEmployee.status
        })

        // Update the local state
        const index = this.employees.findIndex(e => e.id === updatedEmployee.id)
        if (index !== -1) {
          this.employees[index] = { ...this.employees[index], ...updatedEmployee }
        }

        return { success: true }
      } catch (error) {
        console.error('Error updating employee:', error)
        this.error = error.message
        throw error // Re-throw the error to be caught in the component
      } finally {
        this.isLoading = false
      }
    }
  }
})