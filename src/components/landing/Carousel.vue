<template>
    <div class="relative w-full h-screen overflow-hidden">
      <!-- Carousel Container -->
      <div
        class="flex transition-transform duration-700 ease-in-out h-full"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <!-- Carousel Slides -->
        <div
          v-for="(slide, index) in slides"
          :key="index"
          class="w-full h-full flex-shrink-0 relative"
        >
          <img
            :src="slide.image"
            :alt="slide.alt"
            class="w-full h-full object-cover"
          />
          <!-- Content Overlay -->
          <div class="absolute inset-0 flex items-center bg-black/40">
            <div class="max-w-[600px] ml-[10%]">
              <h1 class="text-6xl font-bold text-white mb-4">
                {{ slide.title }}
              </h1>
              <p class="text-xl text-white/90 mb-8 font-light">
                {{ slide.description }}
              </p>
              <button class="bg-[#FF9934] hover:bg-[#FF8000] text-white px-8 py-3 rounded-full text-base font-semibold uppercase transition-colors duration-300">
                {{ slide.buttonText }}
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Navigation Arrows -->
      <button
        @click="prevSlide"
        class="absolute top-1/2 left-4 transform -translate-y-1/2 transition-all duration-200"
      >
        <svg class="w-12 h-12 text-[#FF9934]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.828 12l4.95 4.95-1.414 1.414L8 12l6.364-6.364 1.414 1.414z" />
        </svg>
      </button>
      <button
        @click="nextSlide"
        class="absolute top-1/2 right-4 transform -translate-y-1/2 transition-all duration-200"
      >
        <svg class="w-12 h-12 text-[#FF9934]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
        </svg>
      </button>
  
      <!-- Pagination Dots -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        <button
          v-for="(_, index) in slides"
          :key="index"
          @click="goToSlide(index)"
          :class="[
            'w-2.5 h-2.5 rounded-full transition-all duration-200',
            currentIndex === index ? 'bg-[#FF9934] scale-125' : 'bg-white hover:bg-[#FF9934]/50'
          ]"
        ></button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  
  const slides = [
    {
      image: '/src/assets/image/5.png',
      alt: 'Healthy Chicks',
      title: 'Healthy Chicks, Ready to Reserve',
      description: 'Reserve high-quality poultry, including Day-Old Chicks, Layer Hens, Broilers, and Specialty Breeds.',
      buttonText: 'RESERVE NOW'
    },
    {
      image: '/src/assets/image/3.png',
      alt: 'Poultry Nutrition',
      title: 'Nutrition for Every Stage',
      description: "Premium Starter, Grower, Layer, and Organic Feeds tailored to your flock's needs.",
      buttonText: 'VISIT OUR SHOP'
    },
    {
      image: '/src/assets/image/4.png',
      alt: 'Poultry Care',
      title: 'Care for Your Flock',
      description: 'Vitamins, Probiotics, Deworming Products, and more to keep your poultry thriving.',
      buttonText: 'VISIT OUR SHOP'
    }
  ];
  
  const currentIndex = ref(0);
  const timer = ref(null);
  
  const nextSlide = () => {
    currentIndex.value = (currentIndex.value + 1) % slides.length;
  };
  
  const prevSlide = () => {
    currentIndex.value = (currentIndex.value - 1 + slides.length) % slides.length;
  };
  
  const goToSlide = (index) => {
    currentIndex.value = index;
  };
  
  const startTimer = () => {
    stopTimer();
    timer.value = setInterval(nextSlide, 5000);
  };
  
  const stopTimer = () => {
    if (timer.value) {
      clearInterval(timer.value);
    }
  };
  
  onMounted(() => {
    startTimer();
  });
  
  onUnmounted(() => {
    stopTimer();
  });
  </script>