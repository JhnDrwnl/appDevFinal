<!-- components/landing/About.vue -->
<template>
    <div class="bg-white py-24">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-6 text-gray-800">About Supreme Agrivet</h2>
          <p class="text-gray-600 leading-relaxed max-w-3xl mx-auto text-lg">
            At Supreme Agrivet, we're your trusted partner for all poultry needs. From high-quality chicks to premium feeds and essential health supplements, we help you build a thriving flock. Explore our offerings to elevate your poultry farming experience.
          </p>
        </div>
  
        <!-- Steps Section with wavy connecting line -->
        <div class="relative">
          <!-- Updated Wavy Connecting Line with balanced detail -->
          <div class="absolute top-16 left-0 w-full hidden lg:block">
            <svg class="w-full h-24" preserveAspectRatio="none">
              <path 
                d="M200,20 
                   C280,20 320,0 360,0 
                   S440,40 520,40 
                   S600,0 680,0 
                   S760,40 840,40 
                   S920,0 1000,0 
                   S1080,40 1160,40 
                   S1240,0 1320,0"
                fill="none" 
                stroke="#FF9934" 
                stroke-width="2" 
                stroke-dasharray="4,6"
                class="opacity-40"
              />
            </svg>
          </div>
  
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div 
              v-for="(step, index) in steps" 
              :key="index" 
              class="flex flex-col items-center text-center group"
            >
              <div class="mb-6 p-8 rounded-full bg-[#FFF5EB] relative z-10 transition-transform duration-300 group-hover:scale-110">
                <component 
                  :is="step.icon" 
                  :class="[step.iconClass, 'transition-colors duration-300 group-hover:text-[#FF7600]']" 
                />
              </div>
              <h3 class="text-xl font-bold mb-4 text-gray-800">{{ step.title }}</h3>
              <p class="text-gray-600 leading-relaxed max-w-xs mx-auto">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { WheatIcon, HeartPulseIcon, LeafIcon } from 'lucide-vue-next';
  
  const steps = [
    {
      title: 'Healthy Chicks',
      description: 'We provide carefully bred Day-Old Chicks, Layer Hens, Broilers, and Specialty Breeds to suit your farming goals.',
      icon: 'span',
      iconClass: 'icon-[fluent-emoji-high-contrast--chicken] h-16 w-16 text-[#FF9934]'
    },
    {
      title: 'Premium Feeds',
      description: 'Nourish your flock with Starter, Grower, Layer, and Organic feeds, crafted to maximize health and productivity.',
      icon: WheatIcon,
      iconClass: 'h-16 w-16 text-[#FF9934]'
    },
    {
      title: 'Poultry Wellness',
      description: 'Keep your flock healthy with vitamins, probiotics, medications, and first-aid essentials.',
      icon: HeartPulseIcon,
      iconClass: 'h-16 w-16 text-[#FF9934]'
    },
    {
      title: 'Sustainable Farming',
      description: 'Partner with us for products and services that promote sustainable and ethical poultry farming.',
      icon: LeafIcon,
      iconClass: 'h-16 w-16 text-[#FF9934]'
    }
  ];
  </script>