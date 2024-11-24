<template>
    <nav aria-label="Breadcrumb" class="bg-[#FFF8F3] border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-8 sm:px-10 lg:px-12">
        <div class="flex items-center justify-start h-32">
          <ol class="flex items-center space-x-4 py-8 text-base font-medium">
            <li>
              <div class="flex items-center">
                <router-link 
                  to="/" 
                  class="text-gray-600 hover:text-[#FF9934] transition-colors"
                  @click.native="handleNavigation('/')"
                >
                  <HomeIcon class="w-5 h-5" />
                  <span class="sr-only">Home</span>
                </router-link>
              </div>
            </li>
            <template v-for="(crumb, index) in breadcrumbs" :key="index">
              <li>
                <div class="flex items-center">
                  <ChevronRightIcon 
                    class="flex-shrink-0 h-5 w-5 text-gray-400 mx-2 transition-transform duration-500 ease-in-out" 
                    :class="{ 'rotate-180': isNavigating }"
                    aria-hidden="true" 
                  />
                  <router-link 
                    v-if="crumb.path && index < breadcrumbs.length - 1"
                    :to="crumb.path"
                    class="text-gray-600 hover:text-[#FF9934] transition-colors"
                    @click.native="handleNavigation(crumb.path)"
                  >
                    {{ crumb.name }}
                  </router-link>
                  <span 
                    v-else
                    class="text-[#FF9934]"
                    :class="{ 'font-semibold': index === breadcrumbs.length - 1 }"
                  >
                    {{ crumb.name }}
                  </span>
                </div>
              </li>
            </template>
          </ol>
        </div>
      </div>
    </nav>
  
    <transition name="fade">
      <div v-if="showOverlay" class="fixed inset-0 bg-white z-50"></div>
    </transition>
  </template>
  
  <script setup>
  import { computed, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { HomeIcon, ChevronRightIcon } from 'lucide-vue-next'
  
  const route = useRoute()
  const router = useRouter()
  const showOverlay = ref(false)
  const isNavigating = ref(false)
  
  const breadcrumbs = computed(() => {
    const pathArray = route.path.split('/').filter(Boolean)
    const crumbs = []
  
    // Handle auth routes
    if (pathArray[0] === 'auth') {
      crumbs.push({
        name: 'Account',
        path: null
      })
  
      // Add specific auth page
      if (pathArray[1]) {
        const pageName = {
          'login': 'Login',
          'register': 'Register',
          'verify-email': 'Verify Email'
        }[pathArray[1]]
  
        if (pageName) {
          crumbs.push({
            name: pageName,
            path: null
          })
        }
      }
    } 
    // Handle landing routes
    else if (pathArray.length > 0) {
      const pageName = {
        'about': 'About',
        'latestproducts': 'Latest Products',
        'contact': 'Contact'
      }[pathArray[0]]
  
      if (pageName) {
        crumbs.push({
          name: pageName,
          path: null
        })
      }
    }
  
    return crumbs
  })
  
  const handleNavigation = (path) => {
    isNavigating.value = true
    showOverlay.value = true
    setTimeout(() => {
      router.push(path)
      setTimeout(() => {
        showOverlay.value = false
        isNavigating.value = false
      }, 800)
    }, 800)
  }
  </script>
  
  <style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.8s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  
  .fade-enter-to,
  .fade-leave-from {
    opacity: 1;
  }
  
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(180deg);
    }
  }
  
  .rotate-180 {
    animation: rotate 0.5s ease-in-out;
  }
  </style>
  
  