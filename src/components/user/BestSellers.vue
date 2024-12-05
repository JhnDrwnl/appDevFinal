<template>
  <div class="bg-white border border-gray-200 rounded-lg p-4">
    <h2 class="font-bold text-lg mb-4">BESTSELLERS</h2>
    <div class="space-y-4">
      <div v-for="product in bestSellers" :key="product.id" class="flex items-center space-x-4">
        <img :src="product.image" :alt="product.name" class="w-16 h-16 object-cover rounded">
        <div>
          <h3 class="font-semibold">{{ product.name }}</h3>
          <p class="text-[#FF9934] font-bold">₱{{ product.price.toFixed(2) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

const bestSellers = ref([]);

const fetchBestSellers = async () => {
  const q = query(collection(db, 'products'), orderBy('salesCount', 'desc'), limit(3));
  const querySnapshot = await getDocs(q);
  bestSellers.value = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

onMounted(fetchBestSellers);
</script>

