<!-- components/landing/PoultryTips -->
<template>
  <div class="min-h-screen flex flex-col bg-gray-50">

    <!-- Header -->
    <Header />

    
    <!-- Main Content -->
    <main class="flex-grow">
      <section class="bg-white py-16">
        <div class="container mx-auto px-4">
          <h2 class="text-3xl md:text-4xl font-bold text-center mb-12">Watch and Learn: Poultry Care Videos</h2>
          
          <!-- Featured Video -->
          <div class="mb-16">
            <div class="relative rounded-2xl overflow-hidden shadow-xl cursor-pointer" @click="openModal(featuredVideo)">
              <img 
                :src="featuredVideo.thumbnail" 
                :alt="featuredVideo.title" 
                class="w-full h-auto"
              />
              <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <button class="bg-[#FF9934] text-white rounded-full p-4 hover:bg-[#FF8000] transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
            <h3 class="text-2xl font-bold mt-6 mb-2">{{ featuredVideo.title }}</h3>
            <p class="text-gray-600">{{ featuredVideo.description }}</p>
          </div>
          
          <!-- Video Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="(video, index) in videos" :key="index" class="rounded-lg overflow-hidden shadow-md cursor-pointer" @click="openModal(video)">
              <div class="relative">
                <img :src="video.thumbnail" :alt="video.title" class="w-full h-48 object-cover" />
                <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <button class="bg-[#FF9934] text-white rounded-full p-2 hover:bg-[#FF8000] transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="p-4">
                <h4 class="text-lg font-semibold mb-2">{{ video.title }}</h4>
                <p class="text-gray-600 text-sm">{{ video.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <Footer />

    <!-- Bottom Bar -->
    <BottomBar />

    <!-- Video Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-2xl font-bold text-[#FF9934]">{{ selectedVideo.title }}</h3>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="relative w-full" style="padding-top: 56.25%">
          <div class="absolute top-0 left-0 w-full h-full">
            <div ref="youtubePlayerRef"></div>
          </div>
        </div>
        <p class="text-gray-600 mt-4">{{ selectedVideo.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Header from '@/components/common/Header.vue';
import Footer from '@/components/landing/Footer.vue';
import BottomBar from '@/components/common/BottomBar.vue';

const isModalOpen = ref(false);
const selectedVideo = ref({});
const youtubePlayerRef = ref(null);
let youtubePlayer = null;

const featuredVideo = ref({
  id: '2Pbl49TaRUk',
  title: "Complete Guide to Raising Chickens",
  description: "Expert tips on raising healthy and productive chickens, from choosing breeds to daily care routines.",
  thumbnail: "https://img.youtube.com/vi/2Pbl49TaRUk/maxresdefault.jpg"
});

const videos = ref([
  {
    id: 'YgjJ0_QA3T0',
    title: "Chicken Feed Guide: What to Feed Your Chickens",
    description: "Learn about different types of feed and nutrition requirements for your chickens.",
    thumbnail: "https://img.youtube.com/vi/YgjJ0_QA3T0/hqdefault.jpg"
  },
  {
    id: 'pyw7B3S6FFw',
    title: "Common Chicken Health Problems and Solutions",
    description: "Identify and treat common health issues in your chicken flock.",
    thumbnail: "https://img.youtube.com/vi/pyw7B3S6FFw/hqdefault.jpg"
  },
  {
    id: 'SwbaP2ERj04',
    title: "Essential Tips for Chicken Coop Setup",
    description: "Create the perfect living space for your chickens with these expert tips.",
    thumbnail: "https://img.youtube.com/vi/SwbaP2ERj04/maxresdefault.jpg"
  }
]);

const loadYouTubeIframeAPI = () => {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
};

const initializeYouTubePlayer = () => {
  if (typeof YT !== 'undefined' && YT.Player) {
    youtubePlayer = new YT.Player(youtubePlayerRef.value, {
      height: '100%',
      width: '100%',
      videoId: selectedVideo.value.id,
      playerVars: {
        autoplay: 1,
        modestbranding: 1,
        rel: 0
      },
      events: {
        onReady: onPlayerReady,
        onError: onPlayerError
      }
    });
  }
};

const openModal = (video) => {
  selectedVideo.value = { ...video };
  isModalOpen.value = true;
  setTimeout(() => {
    initializeYouTubePlayer();
  }, 100);
};

const closeModal = () => {
  if (youtubePlayer && youtubePlayer.stopVideo) {
    youtubePlayer.stopVideo();
  }
  isModalOpen.value = false;
  selectedVideo.value = {};
};

const onPlayerReady = (event) => {
  console.log('YouTube Player is ready');
  event.target.playVideo();
};

const onPlayerError = (error) => {
  console.error('YouTube Player Error:', error);
};

const handleEscapeKey = (event) => {
  if (event.key === 'Escape' && isModalOpen.value) {
    closeModal();
  }
};

onMounted(() => {
  loadYouTubeIframeAPI();
  document.addEventListener('keydown', handleEscapeKey);
  window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey);
});
</script>

<style scoped>
/* Add any component-specific styles here if needed */
</style>

