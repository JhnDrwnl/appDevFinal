<!-- views/landing/Home.vue -->
<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Promotional Banner -->
    <PromotionalBanner />

    <!-- Header -->
    <Header />
    
    <!-- Main Content with gradient background -->
    <main class="flex-grow relative">
      <!-- Carousel -->
      <Carousel />
      
      <!-- Content -->
      <div class="relative">
        <About ref="aboutSection" />
        <LatestProducts ref="productsSection" />
        <Testimonials />
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/landing/Header.vue'
import Footer from '@/components/landing/Footer.vue'
import Carousel from '@/components/landing/Carousel.vue'
import About from '@/components/landing/About.vue'
import LatestProducts from '@/components/landing/LatestProducts.vue'
import Testimonials from '@/components/landing/Testimonials.vue'
import Education from '@/components/landing/Education.vue'
import ScrollToTop from '@/components/common/ScrollToTop.vue'
import PromotionalBanner from '@/components/landing/PromotionalBanner.vue'
import BottomBar from '@/components/common/BottomBar.vue'

const route = useRoute()
const aboutSection = ref(null)
const productsSection = ref(null)

const isDefaultRoute = computed(() => {
  return route.name === 'Home' || route.name === 'About' || route.name === 'Products'
})

const scrollToSection = (sectionName) => {
  let section
  if (sectionName === 'about') {
    section = aboutSection.value
  } else if (sectionName === 'latestproducts') {
    section = productsSection.value
  }

  if (section) {
    section.$el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const handleScrollToSection = (event) => {
  scrollToSection(event.detail)
}

onMounted(() => {
  window.addEventListener('scroll-to-section', handleScrollToSection)

  // Initial scroll based on the route
  if (route.name === 'About') {
    scrollToSection('about')
  } else if (route.name === 'Products') {
    scrollToSection('latestproducts')
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll-to-section', handleScrollToSection)
})
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