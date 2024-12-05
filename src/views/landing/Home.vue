<!-- views/landing/Home.vue -->
<template>
  <div class="min-h-screen flex flex-col bg-gray-50">

    <!-- Header -->
    <Header />
    
    <!-- Main Content with gradient background -->
    <main class="flex-grow relative">
      <!-- Carousel -->
      <Carousel />
      
      <!-- Content -->
      <div class="relative">
        <div ref="aboutSection">
          <About />
        </div>
        <div ref="productsSection">
          <LatestProducts />
        </div>
        <Education />
        <router-view v-if="!isDefaultRoute" v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Footer -->
    <Footer />

    <!-- Bottom Bar -->
    <BottomBar />

    <!-- Scroll to Top Button -->
    <ScrollToTop />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/common/Header.vue'
import Footer from '@/components/landing/Footer.vue'
import Carousel from '@/components/landing/Carousel.vue'
import About from '@/components/landing/About.vue'
import LatestProducts from '@/components/landing/LatestProducts.vue'
import Education from '@/components/landing/Education.vue'
import ScrollToTop from '@/components/common/ScrollToTop.vue'
import BottomBar from '@/components/common/BottomBar.vue'

const route = useRoute()
const aboutSection = ref(null)
const productsSection = ref(null)

const isDefaultRoute = computed(() => {
  return route.name === 'Home'
})

const scrollToSection = (sectionName, smooth = true) => {
  let section
  if (sectionName === 'about') {
    section = aboutSection.value
  } else if (sectionName === 'latestproducts') {
    section = productsSection.value
  }

  if (section) {
    section.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
  }
}

const handleScrollToSection = (event) => {
  scrollToSection(event.detail, true)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

