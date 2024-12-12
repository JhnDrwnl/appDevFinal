//stores/modules/products.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
import { useCategoryStore } from './categories'
import { useCategoryPriceRuleStore } from './categoryPriceRules'

export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const currentProduct = ref(null)

  const categoryStore = useCategoryStore()
  const categoryPriceRuleStore = useCategoryPriceRuleStore()

  async function fetchProducts() {
    isLoading.value = true
    error.value = null
    try {
      const q = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
    
      console.log('Fetching categories and price rules...')
      await Promise.all([
        categoryStore.fetchCategories(),
        categoryPriceRuleStore.fetchCategoryPriceRules()
      ])
      console.log('Categories:', categoryStore.categories)
      console.log('Category Price Rules:', categoryPriceRuleStore.categoryPriceRules)

      products.value = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const data = doc.data()
        const categoryNames = await Promise.all(data.categoryIds.map(async (categoryId) => {
          const category = categoryStore.getCategoryById(categoryId)
          return category ? category.name : 'Unknown'
        }))
        const productWithCategories = {
          id: doc.id,
          ...data,
          price: parseFloat(data.price || 0),
          stockQuantity: parseInt(data.stockQuantity || 0),
          categories: categoryNames,
          categoryIds: data.categoryIds || [],
          imageURLs: data.imageURLs || [],
          thumbnailURL: data.thumbnailURL || null,
          createdAt: data.createdAt?.toDate() || new Date(),
        }
        return applyPriceRules(productWithCategories)
      }))

      console.log('Final products array:', products.value)
    } catch (err) {
      console.error('Error fetching products:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function applyPriceRules(product) {
    let finalPrice = product.price
    let appliedRules = []

    if (!categoryPriceRuleStore.categoryPriceRules) {
      console.warn('Category price rules are not available')
      return {
        ...product,
        originalPrice: product.price,
        finalPrice: product.price,
        appliedPriceRules: []
      }
    }

    for (const categoryId of product.categoryIds) {
      const category = categoryStore.getCategoryById(categoryId)
      if (category?.priceRule) {
        const priceRule = categoryPriceRuleStore.categoryPriceRules.find(
          rule => rule.id === category.priceRule.id
        )
        if (priceRule) {
          if (priceRule.priceRuleType === 'percentage') {
            const discount = finalPrice * (priceRule.priceRuleValue / 100)
            finalPrice -= discount
          } else if (priceRule.priceRuleType === 'fixed') {
            finalPrice -= priceRule.priceRuleValue
          }
          appliedRules.push({
            categoryName: category.name,
            ruleName: priceRule.priceRuleName,
            ruleValue: priceRule.priceRuleValue,
            ruleType: priceRule.priceRuleType
          })
        }
      }
    }

    return {
      ...product,
      originalPrice: product.price,
      finalPrice: Math.max(finalPrice, 0), // Ensure price doesn't go below 0
      appliedPriceRules: appliedRules
    }
  }

  async function fetchProduct(productId) {
    isLoading.value = true
    error.value = null
    try {
      const docRef = doc(db, 'products', productId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        currentProduct.value = {
          id: docSnap.id,
          ...data,
          price: parseFloat(data.price || 0),
          stockQuantity: parseInt(data.stockQuantity || 0),
          categoryIds: data.categoryIds || [],
          imageURLs: data.imageURLs || [],
          thumbnailURL: data.thumbnailURL || null,
          createdAt: data.createdAt?.toDate() || new Date(),
        }
        return applyPriceRules(currentProduct.value)
      } else {
        throw new Error('Product not found')
      }
    } catch (err) {
      console.error('Error fetching product:', err)
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function uploadImage(file, productId, isThumbnail = false) {
    try {
      let fileName, fileBlob;
      
      if (file instanceof Blob) {
        fileName = file.name || `${Date.now()}_image.jpg`;
        fileBlob = file;
      } else if (typeof file === 'string' && file.startsWith('data:')) {
        fileName = `${Date.now()}_image.jpg`;
        fileBlob = await fetch(file).then(r => r.blob());
      } else {
        throw new Error('Invalid file type');
      }

      const safeFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
      const path = `products/${productId}/${safeFileName}`;
      
      const fileRef = storageRef(storage, path);
      await uploadBytes(fileRef, fileBlob);
      const downloadURL = await getDownloadURL(fileRef);
      
      return { 
        success: true, 
        url: downloadURL, 
        path,
        fileName: safeFileName
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async function addProduct(productData) {
    isLoading.value = true
    error.value = null
    let uploadedFiles = []

    try {
      let thumbnailURL = null
      let thumbnailPath = null
      if (productData.thumbnailFile) {
        const result = await uploadImage(productData.thumbnailFile, null, true)
        if (result.success) {
          thumbnailURL = result.url
          thumbnailPath = result.path
          uploadedFiles.push(result.path)
        }
      }

      const docRef = await addDoc(collection(db, 'products'), {
        name: productData.name || '',
        description: productData.description || '',
        price: parseFloat(productData.price) || 0,
        categoryIds: productData.categoryIds || [],
        stockQuantity: parseInt(productData.stockQuantity) || 0,
        date: productData.date || new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        thumbnailURL: thumbnailURL,
        thumbnailPath: thumbnailPath
      })

      const productId = docRef.id

      const imageURLs = []
      const imagePaths = []
      if (productData.imageFiles?.length > 0) {
        for (const file of productData.imageFiles) {
          const result = await uploadImage(file, productId)
          if (result.success) {
            imageURLs.push(result.url)
            imagePaths.push(result.path)
            uploadedFiles.push(result.path)
          }
        }
      }

      await updateDoc(docRef, {
        imageURLs: imageURLs,
        imagePaths: imagePaths
      })

      const newProduct = {
        id: productId,
        ...productData,
        stockQuantity: parseInt(productData.stockQuantity) || 0,
        price: parseFloat(productData.price) || 0,
        discountValue: parseFloat(productData.discountValue) || 0,
        imageURLs: imageURLs,
        thumbnailURL: thumbnailURL,
        imagePaths,
        thumbnailPath,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      products.value = [applyPriceRules(newProduct), ...products.value]

      // Increment product count for each category
      for (const categoryId of productData.categoryIds || []) {
        if (categoryId !== 'None') {
          await categoryStore.incrementProductCount(categoryId)
        }
      }

      return { success: true, product: newProduct }
    } catch (error) {
      console.error('Error adding product:', error)
      
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

      error.value = error.message
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  async function updateProduct(productId, updatedData) {
    isLoading.value = true;
    error.value = null;
    let uploadedFiles = [];

    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      if (!productSnap.exists()) {
        throw new Error('Product not found');
      }
      const currentData = productSnap.data();

      const firestoreData = {
        ...currentData,
        ...updatedData,
        name: updatedData.name || currentData.name,
        description: updatedData.description || currentData.description,
        price: parseFloat(updatedData.price) || currentData.price,
        categoryIds: updatedData.categoryIds || currentData.categoryIds,
        stockQuantity: updatedData.stockQuantity !== undefined ? parseInt(updatedData.stockQuantity) : currentData.stockQuantity,
        date: updatedData.date || currentData.date,
        updatedAt: serverTimestamp()
      };

      // Handle image updates only if new images are provided
      if (updatedData.images) {
        let imageURLs = [...(currentData.imageURLs || [])];
        let imagePaths = [...(currentData.imagePaths || [])];

        // Handle existing images
        const keptImages = updatedData.images.filter(img => !img.isNew).map(img => img.url);
        imageURLs = imageURLs.filter(url => keptImages.includes(url));
        imagePaths = imagePaths.filter(path => keptImages.some(url => url.includes(path.split('/').pop())));

        // Handle new images
        for (const image of updatedData.images) {
          if (image.isNew) {
            const result = await uploadImage(image.url, productId);
            if (!result.success) throw new Error(result.error);
            imageURLs.push(result.url);
            imagePaths.push(result.path);
            uploadedFiles.push(result.path);
          }
        }

        firestoreData.imageURLs = imageURLs;
        firestoreData.imagePaths = imagePaths;
      }

      // Handle thumbnail update only if a new thumbnail is provided
      if (updatedData.thumbnailFile) {
        const result = await uploadImage(updatedData.thumbnailFile, productId, true);
        if (!result.success) throw new Error(result.error);
        
        firestoreData.thumbnailURL = result.url;
        firestoreData.thumbnailPath = result.path;
        uploadedFiles.push(result.path);
      } else if (updatedData.thumbnailURL === null) {
        firestoreData.thumbnailURL = null;
        firestoreData.thumbnailPath = null;
      }

      await updateDoc(productRef, firestoreData);

      const index = products.value.findIndex(p => p.id === productId);
      if (index !== -1) {
        products.value[index] = applyPriceRules({
          ...products.value[index],
          ...firestoreData,
          id: productId,
          updatedAt: new Date()
        });
      }

      // Update category product counts only if categories have changed
      if (updatedData.categoryIds) {
        const oldCategoryIds = currentData.categoryIds || []
        const newCategoryIds = updatedData.categoryIds || []

        // Decrement count for removed categories
        for (const categoryId of oldCategoryIds) {
          if (categoryId !== 'None' && !newCategoryIds.includes(categoryId)) {
            await categoryStore.decrementProductCount(categoryId)
          }
        }

        // Increment count for added categories
        for (const categoryId of newCategoryIds) {
          if (categoryId !== 'None' && !oldCategoryIds.includes(categoryId)) {
            await categoryStore.incrementProductCount(categoryId)
          }
        }
      }

      return { success: true, id: productId };
    } catch (error) {
      console.error('Error updating product:', error);
      
      for (const path of uploadedFiles) {
        try {
          const fileRef = storageRef(storage, path);
          await deleteObject(fileRef);
          console.log(`Cleaned up file at path ${path} due to error`);
        } catch (deleteError) {
          console.error('Error cleaning up file:', deleteError);
        }
      }

      error.value = error.message;
      return { success: false, error: error.message };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteProduct(productId) {
    isLoading.value = true;
    error.value = null;

    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      
      if (!productSnap.exists()) {
        throw new Error('Product not found');
      }

      const productData = productSnap.data();

      const imagesToDelete = [...(productData.imagePaths || []), productData.thumbnailPath].filter(Boolean);
      const deletionErrors = [];

      for (const path of imagesToDelete) {
        try {
          const fileRef = storageRef(storage, path);
          await deleteObject(fileRef);
          console.log(`Successfully deleted file at path ${path}`);
        } catch (error) {
          if (error.code === 'storage/object-not-found') {
            console.log(`File at path ${path} already deleted or doesn't exist`);
          } else {
            console.error(`Error deleting file at path ${path}:`, error);
            deletionErrors.push({ path, error: error.message });
          }
        }
      }

      await deleteDoc(productRef);

      products.value = products.value.filter(p => p.id !== productId);
      if (currentProduct.value?.id === productId) {
        currentProduct.value = null;
      }

      // Decrement product count for each category
      for (const categoryId of productData.categoryIds || []) {
        if (categoryId !== 'None') {
          await categoryStore.decrementProductCount(categoryId)
        }
      }

      if (deletionErrors.length > 0) {
        console.warn('Some files could not be deleted:', deletionErrors);
        return { 
          success: true, 
          warning: 'Product deleted, but some associated files could not be removed from storage.'
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      error.value = error.message;
      return { success: false, error: error.message };
    } finally {
      isLoading.value = false;
    }
  }

  function clearError() {
    error.value = null
  }

  function resetState() {
    products.value = []
    isLoading.value = false
    error.value = null
    currentProduct.value = null
  }

  return {
    products,
    isLoading,
    error,
    currentProduct,
    fetchProducts,
    fetchProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    clearError,
    resetState,
    applyPriceRules,
    getProductById: (productId) => products.value.find(product => product.id === productId),
    getProductsByCategory: (category) => products.value.filter(product => product.categoryIds.includes(category)),
    getInStockProducts: () => products.value.filter(product => product.stockQuantity > 0),
    getOutOfStockProducts: () => products.value.filter(product => product.stockQuantity <= 0),
  }
})

