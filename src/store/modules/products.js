// store/modules/products.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db, storage } from '@/services/firebase'
import { 
  collection, 
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage'

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    isLoading: false,
    error: null,
    currentProduct: null
  }),

  actions: {
    async fetchProducts() {
      this.isLoading = true
      this.error = null
      try {
        const q = query(
          collection(db, 'products'),
          orderBy('createdAt', 'desc')
        )
        const querySnapshot = await getDocs(q)
        
        this.products = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            price: parseFloat(data.price || 0),
            discountValue: parseFloat(data.discountValue || 0),
            stockQuantity: parseInt(data.stockQuantity || 0),
            tags: data.tags || [],
            imageURLs: data.imageURLs || [],
            thumbnailURL: data.thumbnailURL || null,
            createdAt: data.createdAt?.toDate() || new Date(),
          }
        })
      } catch (err) {
        console.error('Error fetching products:', err)
        this.error = err.message
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async fetchProduct(productId) {
      this.isLoading = true
      this.error = null
      try {
        const docRef = doc(db, 'products', productId)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          this.currentProduct = {
            id: docSnap.id,
            ...data,
            price: parseFloat(data.price || 0),
            discountValue: parseFloat(data.discountValue || 0),
            stockQuantity: parseInt(data.stockQuantity || 0),
            tags: data.tags || [],
            imageURLs: data.imageURLs || [],
            thumbnailURL: data.thumbnailURL || null,
            createdAt: data.createdAt?.toDate() || new Date(),
          }
          return this.currentProduct
        } else {
          throw new Error('Product not found')
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        this.error = err.message
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async uploadImage(file, productId, isThumbnail = false) {
      try {
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        const path = `products/${fileName}`
        
        const fileRef = storageRef(storage, path)
        await uploadBytes(fileRef, file)
        const downloadURL = await getDownloadURL(fileRef)
        
        return { 
          success: true, 
          url: downloadURL, 
          path,
          fileName 
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        return { 
          success: false, 
          error: error.message 
        }
      }
    },

    async addProduct(productData) {
      this.isLoading = true
      this.error = null
      let uploadedFiles = []

      try {
        // Validate required fields
        if (!productData.name || !productData.price) {
          throw new Error('Name and price are required')
        }

        // Upload thumbnail
        let thumbnailURL = null
        let thumbnailPath = null
        if (productData.thumbnailFile) {
          const result = await this.uploadImage(productData.thumbnailFile, null, true)
          if (!result.success) throw new Error(result.error)
          thumbnailURL = result.url
          thumbnailPath = result.path
          uploadedFiles.push(result.path)
        } else {
          throw new Error('Thumbnail is required')
        }

        // Create product document in Firestore first to get the productId
        const docRef = await addDoc(collection(db, 'products'), {
          name: productData.name,
          description: productData.description,
          price: parseFloat(productData.price),
          category: productData.category || '',
          tags: productData.tags || [],
          discountType: productData.discountType,
          discountValue: parseFloat(productData.discountValue) || 0,
          stockQuantity: parseInt(productData.stockQuantity) || 0,
          date: productData.date,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          thumbnailURL: thumbnailURL,
          thumbnailPath: thumbnailPath
        })

        const productId = docRef.id

        // Upload additional images
        const imageURLs = []
        const imagePaths = []
        if (productData.imageFiles?.length > 0) {
          for (const file of productData.imageFiles) {
            const result = await this.uploadImage(file, productId)
            if (!result.success) throw new Error(result.error)
            imageURLs.push(result.url)
            imagePaths.push(result.path)
            uploadedFiles.push(result.path)
          }
        }

        // Update the product document with image URLs and paths
        await updateDoc(docRef, {
          imageURLs: imageURLs,
          imagePaths: imagePaths
        })

        // Create the new product object
        const newProduct = {
          id: productId,
          ...productData,
          stockQuantity: parseInt(productData.stockQuantity) || 0,
          price: parseFloat(productData.price),
          discountValue: parseFloat(productData.discountValue) || 0,
          imageURLs: imageURLs,
          thumbnailURL: thumbnailURL,
          imagePaths,
          thumbnailPath,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        // Update local state
        this.products = [newProduct, ...this.products]

        return { success: true, product: newProduct }
      } catch (error) {
        console.error('Error adding product:', error)
        
        // Cleanup any uploaded files if there was an error
        if (uploadedFiles.length > 0) {
          for (const path of uploadedFiles) {
            try {
              const fileRef = storageRef(storage, path)
              await deleteObject(fileRef)
            } catch (deleteError) {
              console.error('Error cleaning up file:', deleteError)
            }
          }
        }

        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async updateProduct(productId, updatedData) {
      this.isLoading = true
      this.error = null
      let uploadedFiles = []
      let oldImagePaths = []

      try {
        // Get current product data
        const productRef = doc(db, 'products', productId)
        const productSnap = await getDoc(productRef)
        if (!productSnap.exists()) {
          throw new Error('Product not found')
        }
        const currentData = productSnap.data()
        oldImagePaths = [...(currentData.imagePaths || []), currentData.thumbnailPath].filter(Boolean)

        const firestoreData = {
          name: updatedData.name,
          description: updatedData.description,
          price: parseFloat(updatedData.price) || 0,
          category: updatedData.category,
          tags: updatedData.tags || [],
          discountType: updatedData.discountType,
          discountValue: parseFloat(updatedData.discountValue) || 0,
          stockQuantity: parseInt(updatedData.stockQuantity) || 0,
          date: updatedData.date,
          updatedAt: serverTimestamp()
        }

        let imageURLs = []
        let imagePaths = []
        let thumbnailURL = updatedData.thumbnailURL
        let thumbnailPath = currentData.thumbnailPath

        // Handle thumbnail update or removal
        if (updatedData.thumbnailFile) {
          const result = await this.uploadImage(updatedData.thumbnailFile, productId, true)
          if (!result.success) throw new Error(result.error)
          
          thumbnailURL = result.url
          thumbnailPath = result.path
          uploadedFiles.push(result.path)
        } else if (updatedData.thumbnailURL === null) {
          // Thumbnail was removed
          thumbnailURL = null
          if (currentData.thumbnailPath) {
            try {
              const oldFileRef = storageRef(storage, currentData.thumbnailPath)
              await deleteObject(oldFileRef)
            } catch (error) {
              console.error('Error deleting old thumbnail:', error)
            }
          }
          thumbnailPath = null
        }

        // Handle image updates
        for (const image of updatedData.images) {
          if (image.startsWith('data:')) {
            // This is a new image, upload it
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
            const path = `products/${fileName}`
            const fileRef = storageRef(storage, path)
            await uploadBytes(fileRef, await (await fetch(image)).blob())
            const downloadURL = await getDownloadURL(fileRef)
            imageURLs.push(downloadURL)
            imagePaths.push(path)
            uploadedFiles.push(path)
          } else {
            // This is an existing image
            const existingImagePath = currentData.imagePaths?.find(path => path.includes(image.split('?')[0]))
            if (existingImagePath) {
              imageURLs.push(image)
              imagePaths.push(existingImagePath)
            }
          }
        }

        // Delete removed images
        for (const oldPath of oldImagePaths) {
          if (!imagePaths.includes(oldPath) && oldPath !== thumbnailPath) {
            try {
              const oldFileRef = storageRef(storage, oldPath)
              await deleteObject(oldFileRef)
            } catch (error) {
              console.error(`Error deleting old image at path ${oldPath}:`, error)
            }
          }
        }

        // Update document with all changes
        firestoreData.imageURLs = imageURLs
        firestoreData.imagePaths = imagePaths
        firestoreData.thumbnailURL = thumbnailURL
        firestoreData.thumbnailPath = thumbnailPath

        await updateDoc(productRef, firestoreData)

        // Update local state
        const index = this.products.findIndex(p => p.id === productId)
        if (index !== -1) {
          this.products[index] = {
            ...this.products[index],
            ...firestoreData,
            id: productId,
            updatedAt: new Date()
          }
        }

        return { success: true, id: productId }
      } catch (error) {
        console.error('Error updating product:', error)
        
        // Cleanup newly uploaded files if there was an error
        if (uploadedFiles.length > 0) {
          for (const path of uploadedFiles) {
            try {
              const fileRef = storageRef(storage, path)
              await deleteObject(fileRef)
            } catch (deleteError) {
              console.error('Error cleaning up file:', deleteError)
            }
          }
        }

        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    async deleteProduct(productId) {
      this.isLoading = true
      this.error = null

      try {
        // Get product data first
        const productRef = doc(db, 'products', productId)
        const productSnap = await getDoc(productRef)
        
        if (!productSnap.exists()) {
          throw new Error('Product not found')
        }

        const productData = productSnap.data()

        // Delete all associated images from storage
        const imagesToDelete = [...(productData.imagePaths || []), productData.thumbnailPath].filter(Boolean)
        for (const path of imagesToDelete) {
          try {
            const fileRef = storageRef(storage, path)
            await deleteObject(fileRef)
          } catch (error) {
            console.error(`Error deleting file at path ${path}:`, error)
            // Continue with deletion even if some files fail to delete
          }
        }

        // Delete the product document
        await deleteDoc(productRef)

        // Update local state
        this.products = this.products.filter(p => p.id !== productId)
        if (this.currentProduct?.id === productId) {
          this.currentProduct = null
        }

        return { success: true }
      } catch (error) {
        console.error('Error deleting product:', error)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.isLoading = false
      }
    },

    clearError() {
      this.error = null
    },

    resetState() {
      this.products = []
      this.isLoading = false
      this.error = null
      this.currentProduct = null
    }
  },

  getters: {
    getProductById: (state) => (productId) => {
      return state.products.find(product => product.id === productId)
    },
    
    getProductsByCategory: (state) => (category) => {
      return state.products.filter(product => product.category === category)
    },

    getInStockProducts: (state) => {
      return state.products.filter(product => product.stockQuantity > 0)
    },

    getOutOfStockProducts: (state) => {
      return state.products.filter(product => product.stockQuantity <= 0)
    },

    getProductsWithDiscount: (state) => {
      return state.products.filter(product => 
        product.discountType !== 'none' && product.discountValue > 0
      )
    }
  }
})