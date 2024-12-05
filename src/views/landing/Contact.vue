<!-- views/landing/Contact.vue -->
<template>
    <div class="min-h-screen flex flex-col bg-gray-50">

      <!-- Header -->
      <Header />
      
      <!-- Main Content -->
      <main class="flex-grow">
        <section class="py-16">
          <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <h2 class="text-3xl md:text-4xl font-bold text-center mb-10">Contact Us</h2>
            
            <!-- Get in Touch Section -->
            <div class="mb-16 w-full">
              <h3 class="text-2xl font-bold mb-6 text-center">GET IN TOUCH</h3>
              <p class="text-gray-600 mb-8 text-center text-base max-w-4xl mx-auto">
                Have questions about our products or services? We're here to help! Get in touch with us through any of the following channels.
              </p>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <!-- Address & Phone -->
                <div class="text-center md:text-left space-y-6">
                  <div>
                    <h4 class="font-semibold text-lg mb-2">Address</h4>
                    <p class="text-gray-600">4005 Silver Business Point India</p>
                  </div>
                  
                  <div>
                    <h4 class="font-semibold text-lg mb-2">Phone</h4>
                    <p class="text-gray-600">123456789</p>
                  </div>
                </div>
                
                <!-- Email & Opening Hours -->
                <div class="text-center md:text-left space-y-6">
                  <div>
                    <h4 class="font-semibold text-lg mb-2">Email</h4>
                    <p class="text-gray-600">demoexample@gmail.com</p>
                  </div>
                  
                  <div>
                    <h4 class="font-semibold text-lg mb-2">Opening Hours</h4>
                    <p class="text-gray-600">
                      We are open: Monday - Saturday (10AM - 5PM) and closed on Sunday.
                    </p>
                  </div>
                </div>
              </div>
              
              <!-- Social Media -->
              <div class="mt-12 text-center">
                <h4 class="font-semibold text-lg mb-4">Social Media</h4>
                <div class="flex gap-6 justify-center">
                  <a 
                    v-for="(icon, index) in socialIcons" 
                    :key="index" 
                    :href="icon.link"
                    :aria-label="icon.name"
                    class="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors duration-300"
                  >
                    <i :class="['fab', icon.class, 'text-gray-600 text-xl']"></i>
                  </a>
                </div>
              </div>
            </div>
            
            <!-- Contact Form Section -->
            <div class="mb-16 w-full">
              <h3 class="text-2xl font-bold text-center mb-8">LET US KNOW WHAT YOU THINK</h3>
              <p class="text-center text-gray-600 mb-8 text-base max-w-4xl mx-auto">
                We value your feedback and are always looking to improve our services. Please fill out the form below and we'll get back to you as soon as possible.
              </p>
              <form @submit.prevent="submitForm" class="space-y-6 max-w-6xl mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label for="name" class="text-sm font-medium text-gray-700">Your Name</label>
                    <input
                      id="name"
                      type="text"
                      v-model="form.name"
                      class="w-full px-6 py-3 text-base border-b-2 border-gray-300 bg-transparent focus:outline-none focus:border-[#FF9934]"
                      required
                    >
                  </div>
                  <div class="space-y-2">
                    <label for="email" class="text-sm font-medium text-gray-700">E-Mail Address</label>
                    <input
                      id="email"
                      type="email"
                      v-model="form.email"
                      class="w-full px-6 py-3 text-base border-b-2 border-gray-300 bg-transparent focus:outline-none focus:border-[#FF9934]"
                      required
                    >
                  </div>
                </div>
                <div class="space-y-2">
                  <label for="message" class="text-sm font-medium text-gray-700">Your Message</label>
                  <textarea
                    id="message"
                    v-model="form.message"
                    rows="5"
                    class="w-full px-6 py-3 text-base border-b-2 border-gray-300 bg-transparent focus:outline-none focus:border-[#FF9934]"
                    required
                  ></textarea>
                </div>
                <div class="text-center">
                  <button
                    type="submit"
                    class="bg-[#FF9934] text-white text-base px-10 py-3 rounded-full hover:bg-[#FF8000] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isSubmitting"
                  >
                    <span v-if="isSubmitting" class="flex items-center justify-center">
                      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      SUBMITTING...
                    </span>
                    <span v-else>SUBMIT NOW</span>
                  </button>
                </div>
              </form>
            </div>
            
            <!-- Google Map -->
            <div class="w-full">
              <div v-if="!mapError" class="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
                <div id="map" class="w-full h-full"></div>
              </div>
              <div v-else class="w-full h-[400px] rounded-lg overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
                <div class="text-center p-6">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01" />
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">Map loading failed</h3>
                  <p class="mt-1 text-sm text-gray-500">{{ mapError }}</p>
                  <div class="mt-6">
                    <button
                      type="button"
                      class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#FF9934] hover:bg-[#FF8000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934]"
                      @click="retryLoadMap"
                    >
                      <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                      </svg>
                      Retry loading map
                    </button>
                  </div>
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
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import Header from '@/components/common/Header.vue';
  import Footer from '@/components/landing/Footer.vue';
  import BottomBar from '@/components/common/BottomBar.vue';

  
  const isSubmitting = ref(false);
  const mapLoaded = ref(false);
  const mapError = ref(null);
  
  const form = ref({
    name: '',
    email: '',
    message: ''
  });
  
  const socialIcons = [
    { class: 'fa-facebook-f', link: '#', name: 'Facebook' },
    { class: 'fa-twitter', link: '#', name: 'Twitter' },
    { class: 'fa-youtube', link: '#', name: 'YouTube' },
    { class: 'fa-pinterest', link: '#', name: 'Pinterest' },
    { class: 'fa-instagram', link: '#', name: 'Instagram' }
  ];
  
  const customMarkerIcon = computed(() => ({
    url: '/src/assets/image/locationLogo.png',
    scaledSize: new google.maps.Size(40, 40),
    anchor: new google.maps.Point(20, 40),
    labelOrigin: new google.maps.Point(20, 50)
  }));
  
  const submitForm = async () => {
    try {
      isSubmitting.value = true;
      // Here you would typically make an API call to submit the form
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Form submitted:', form.value);
      form.value = { name: '', email: '', message: '' };
      alert('Thank you for your message. We will get back to you soon!');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again later.');
    } finally {
      isSubmitting.value = false;
    }
  };
  
  const initMap = () => {
    const position = { lat: 13.374064738619396, lng: 121.15671666469326 };
    const map = new google.maps.Map(document.getElementById("map"), {
      center: position,
      zoom: 15,
      mapId: 'YOUR_MAP_ID', // Optional: Add your custom map ID here
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_LEFT, // Move from TOP_RIGHT to TOP_LEFT
      },
      streetViewControl: false,
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.BOTTOM_RIGHT, // Explicitly position fullscreen control
      },
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM, // Move zoom to bottom right
      }
    });
  
    const marker = new google.maps.Marker({
      position: position,
      map: map,
      title: "Our Shop",
      icon: customMarkerIcon.value,
      label: {
        text: "Our Shop",
        color: "#FF9934",
        fontSize: "14px",
        fontWeight: "bold"
      }
    });
  
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-3 max-w-xs">
          <h3 class="font-bold text-base mb-1">Our Shop</h3>
          <div class="text-xs space-y-0.5">
            <p class="font-medium">Working Hours:</p>
            <p>Thursday: 10:00AM - 5:00PM</p>
            <p>Friday: 6:00AM - 5:00PM</p>
            <p>Saturday: 6:00AM - 4:00PM</p>
            <p>Sunday: Closed</p>
            <p>Monday: 10:00AM - 5:00PM</p>
            <p>Tuesday: 6:00AM - 5:00PM</p>
            <p>Wednesday: 6:00AM - 5:00PM</p>
          </div>
        </div>
      `,
    });
  
    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  
    mapLoaded.value = true;
    mapError.value = null;
  };
  
  const loadMap = () => {
    if (typeof google === 'undefined') {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      window.initMap = initMap;
    } else {
      initMap();
    }
  };
  
  const retryLoadMap = () => {
    mapError.value = null;
    loadMap();
  };
  
  onMounted(() => {
    if (!mapLoaded.value) {
      loadMap();
    }
  });
  </script>
  
  <style scoped>
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
  
  /* Custom styles for the map container */
  #map {
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  /* Form input focus styles */
  input:focus,
  textarea:focus {
    transition: border-color 0.2s ease-in-out;
  }
  
  /* Loading spinner animation */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  /* Smooth transition for hover effects */
  .hover\:bg-gray-100:hover {
    transition: background-color 0.2s ease-in-out;
  }
  </style>
  
  