<template>
    <div class="bg-[#FFF8F3] py-24 relative overflow-hidden">
      <!-- Decorative Images -->
      <img 
        src="https://placehold.co/300x300?text=Chicken+Outline"
        alt="" 
        class="absolute left-0 top-1/2 -translate-y-1/2 w-48 opacity-10"
        aria-hidden="true"
      />
      <img 
        src="https://placehold.co/300x300?text=Chicken+Outline"
        alt="" 
        class="absolute right-0 top-1/2 -translate-y-1/2 w-48 opacity-10"
        aria-hidden="true"
      />
  
      <div class="container mx-auto px-4">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4 text-gray-800">What Our Customer Say's</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet consectetur. Suspendisse ut lorem at nunc Vitae nibh ultricies tellus dolor not amet eget.
          </p>
        </div>
  
        <!-- Testimonials Grid -->
        <div class="relative">
          <div class="overflow-hidden">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div 
                v-for="testimonial in testimonials" 
                :key="testimonial.id"
                class="bg-white rounded-lg p-8 shadow-sm"
              >
                <p class="text-gray-600 mb-6 italic">
                  "{{ testimonial.quote }}"
                </p>
                <div class="flex items-center">
                  <img 
                    :src="testimonial.image" 
                    :alt="testimonial.name"
                    class="w-12 h-12 rounded-full object-cover"
                  />
                  <div class="ml-4">
                    <h4 class="font-semibold text-gray-800">{{ testimonial.name }}</h4>
                    <p class="text-gray-500 text-sm">{{ testimonial.role }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Navigation Arrows -->
          <div class="flex justify-center mt-8 space-x-4">
            <button 
              @click="prevSlide"
              class="p-2 rounded-full bg-[#FF9934] text-white hover:bg-[#FF8000] transition-colors"
              aria-label="Previous testimonials"
            >
              <ChevronLeftIcon class="w-6 h-6" />
            </button>
            <button 
              @click="nextSlide"
              class="p-2 rounded-full bg-[#FF9934] text-white hover:bg-[#FF8000] transition-colors"
              aria-label="Next testimonials"
            >
              <ChevronRightIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
  
  const testimonials = [
    {
      id: 1,
      quote: "Lorem ipsum dolor sit amet, consecr adipiscing elit. Nibh proin libero, amet, is aenean commodo neque'roin libero, amet, is aenean commet, consecr adipiscing elit. Nibh proin libero, amet, is aenodo",
      name: "Jony Duff",
      role: "Web Designer",
      image: "https://placehold.co/100x100?text=Person+1"
    },
    {
      id: 2,
      quote: "Lorem ipsum dolor sit amet, consecr adipiscing elit. Nibh proin libero, amet, is aenean commodo neque'roin libero, amet, is aenean commet, consecr adipiscing elit. Nibh proin libero, amet, is aenodo",
      name: "Jony Duff",
      role: "Web Designer",
      image: "https://placehold.co/100x100?text=Person+2"
    },
    {
      id: 3,
      quote: "Lorem ipsum dolor sit amet, consecr adipiscing elit. Nibh proin libero, amet, is aenean commodo neque'roin libero, amet, is aenean commet, consecr adipiscing elit. Nibh proin libero, amet, is aenodo",
      name: "Jony Duff",
      role: "Web Designer",
      image: "https://placehold.co/100x100?text=Person+3"
    }
  ]
  
  const currentIndex = ref(0)
  
  const nextSlide = () => {
    // This function will be implemented when we add more testimonials
    console.log('Next slide')
  }
  
  const prevSlide = () => {
    // This function will be implemented when we add more testimonials
    console.log('Previous slide')
  }
  </script>
  
  