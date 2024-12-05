<template>
  <div class="bg-white py-16 sm:py-24">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl sm:text-4xl font-bold text-center mb-12">Watch & Learn: Poultry Made Easy</h2>
      <div class="grid md:grid-cols-2 gap-12">
        <!-- Left Column - Featured Video -->
        <div class="flex flex-col h-full">
          <div class="relative rounded-2xl overflow-hidden shadow-lg flex-grow">
            <div class="aspect-w-16 aspect-h-9">
              <img
                src="https://img.youtube.com/vi/g71o1TEIhLU/maxresdefault.jpg"
                alt="Chicken Feed Tutorial"
                class="w-full h-full object-cover"
              />
              <div 
                class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer"
                @click="playVideo"
              >
                <button class="bg-[#FF9934] text-white rounded-full p-4 hover:bg-[#FF8000] transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="mt-6 text-center flex-shrink-0">
            <h3 class="text-xl sm:text-2xl font-bold mb-4">How to Choose the Right Feed for Your Chickens</h3>
            <p class="text-gray-600 mb-6">
              Learn the essentials of selecting the perfect feed for your flock's health and productivity.
            </p>
            <button @click="navigateToPoultryTips" class="bg-[#FF9934] text-white font-semibold py-2 px-6 rounded-full hover:bg-[#FF8000] transition-colors uppercase tracking-wider">
              Watch More Videos
            </button>
          </div>
        </div>

        <!-- Right Column - Video Hub Info -->
        <div class="flex flex-col h-full">
          <div class="bg-gray-100 rounded-2xl p-6 sm:p-8 shadow-md flex-grow">
            <h2 class="text-2xl sm:text-3xl font-bold mb-4">Expert Poultry Care Tips</h2>
            <p class="text-gray-600 mb-6">
              Explore our comprehensive video library featuring expert tutorials on feed selection, health management, and pest control. Elevate your poultry care skills with our easy-to-follow guides.
            </p>
            <h3 class="text-xl sm:text-2xl font-bold mb-6">Why Watch Our Tutorials?</h3>
            <ul class="space-y-4 mb-6">
              <li class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#FF9934] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Easy-to-follow expert guides</span>
              </li>
              <li class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#FF9934] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Learn the secrets to happy, healthy chickens</span>
              </li>
              <li class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-[#FF9934] mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Start with videos on feed, health, and coop care</span>
              </li>
            </ul>
            <a @click.prevent="navigateToPoultryTips" href="#" class="text-[#FF9934] font-semibold hover:text-[#FF8000] transition-colors uppercase tracking-wider">
              Browse Full Video Library
            </a>
          </div>
          <div class="mt-6 text-center bg-white rounded-2xl p-6 sm:p-8 shadow-md flex-shrink-0">
            <h3 class="text-2xl sm:text-3xl font-bold text-[#FF9934] mb-4">Start Watching and Become a Poultry Pro Today!</h3>
            <button @click="navigateToPoultryTips" class="bg-[#FF9934] text-white font-semibold py-2 px-6 rounded-full hover:bg-[#FF8000] transition-colors uppercase tracking-wider mt-4">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-4 max-w-3xl w-full mx-4">
        <div class="aspect-w-16 aspect-h-9">
          <iframe
            :src="'https://www.youtube.com/embed/g71o1TEIhLU?autoplay=1'"
            title="Chicken Feed Tutorial"
            frameborder="0"
            allow="autoplay"
            allowfullscreen
            class="w-full h-full"
          ></iframe>
        </div>
        <button @click="closeModal" class="mt-4 bg-[#FF9934] text-white font-semibold py-2 px-4 rounded hover:bg-[#FF8000] transition-colors">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const showModal = ref(false);

const navigateToPoultryTips = () => {
  router.push({ name: 'PoultryTips' });
};

const playVideo = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};
</script>

<style scoped>
.aspect-w-16 {
  position: relative;
  padding-bottom: calc(var(--tw-aspect-h) / var(--tw-aspect-w) * 100%);
  --tw-aspect-w: 16;
}

.aspect-h-9 {
  --tw-aspect-h: 9;
}

.aspect-w-16 > * {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>