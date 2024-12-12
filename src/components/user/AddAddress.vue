<!-- components/user/AddAddress -->
<template>
  <div class="max-w-4xl mx-auto bg-white">
    <h2 class="text-3xl font-bold p-6 border-b border-gray-200">Shipping Address</h2>
    
    <!-- API Error Alert -->
    <div v-if="apiError" class="p-4 mb-4 bg-red-50 border border-red-200 rounded">
      <p class="text-red-700">{{ apiError }}</p>
      <p class="text-sm text-red-600 mt-1">Please contact support if this issue persists.</p>
    </div>

    <form @submit.prevent="submitForm" class="p-6 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="fullName" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            id="fullName"
            v-model="form.fullName"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#FF9934] focus:border-transparent"
          >
        </div>
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#FF9934] focus:border-transparent"
          >
        </div>
      </div>

      <div>
        <label for="map" class="block text-sm font-medium text-gray-700 mb-1">Select Location on Map</label>
        <div v-if="!isMapLoaded" class="w-full h-64 mb-4 border border-gray-300 rounded flex items-center justify-center bg-gray-50">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9934] mx-auto mb-2"></div>
            <p class="text-gray-600">Loading map...</p>
          </div>
        </div>
        <div id="map" :class="['w-full h-64 mb-4 border border-gray-300 rounded', { 'hidden': !isMapLoaded }]"></div>
        <p class="text-sm text-gray-600 mt-2">Drag Pegman or click on blue circles for 360° view. Click in Street View to autofill address.</p>
      </div>

      <div>
        <label for="addressLine1" class="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
        <input
          id="addressLine1"
          v-model="form.addressLine1"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#FF9934] focus:border-transparent"
        >
      </div>

      <div>
        <label for="addressLine2" class="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
        <input
          id="addressLine2"
          v-model="form.addressLine2"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#FF9934] focus:border-transparent"
        >
      </div>

      <div>
        <label for="otherDetails" class="block text-sm font-medium text-gray-700 mb-1">Other Details (Optional)</label>
        <textarea
          id="otherDetails"
          v-model="form.otherDetails"
          rows="3"
          class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#FF9934] focus:border-transparent"
        ></textarea>
      </div>

      <div class="flex justify-end space-x-4">
        <button
          type="button"
          @click="$emit('cancel')"
          class="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-full hover:bg-gray-400 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting || !isMapLoaded"
          class="bg-[#FF9934] text-white font-bold py-2 px-4 rounded-full hover:bg-[#e88a2f] transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF9934] focus:ring-opacity-50 disabled:opacity-50"
        >
          {{ isSubmitting ? 'Saving...' : 'Save Shipping Address' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAddressStore } from '@/store/modules/address';
import { useAuthStore } from '@/store/modules/auth';

const emit = defineEmits(['address-added', 'cancel']);

const addressStore = useAddressStore();
const authStore = useAuthStore();

const form = ref({
  fullName: '',
  addressLine1: '',
  addressLine2: '',
  phone: '',
  otherDetails: '',
  latitude: 13.376937076393572,
  longitude: 121.16408940668741
});

const apiError = ref('');
const isMapLoaded = ref(false);
const isSubmitting = ref(false);
let map, marker, panorama, streetViewService;

const handleApiError = (error) => {
  console.error('Google Maps API Error:', error);
  if (error.includes('ApiNotActivatedMapError')) {
    apiError.value = 'Maps API is not activated. Please enable the Maps JavaScript API in your Google Cloud Console.';
  } else if (error.includes('ApiTargetBlockedMapError')) {
    apiError.value = 'API key is not properly configured. Please check API key restrictions in Google Cloud Console.';
  } else {
    apiError.value = 'An error occurred while loading the map. Please refresh the page or try again later.';
  }
  isMapLoaded.value = false;
};

const updateFormFromPlace = (place) => {
  form.value.addressLine1 = place.formatted_address || place.name || '';
  form.value.latitude = place.geometry.location.lat();
  form.value.longitude = place.geometry.location.lng();
};

const initMap = () => {
  try {
    if (!window.google) {
      handleApiError('Google Maps failed to load');
      return;
    }

    const mapOptions = {
      center: { lat: form.value.latitude, lng: form.value.longitude },
      zoom: 13,
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: true,
    };

    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    panorama = map.getStreetView();
    streetViewService = new google.maps.StreetViewService();

    isMapLoaded.value = true;
    apiError.value = ''; // Clear any previous errors

    marker = new google.maps.Marker({
      position: mapOptions.center,
      map: map,
      draggable: true,
      animation: google.maps.Animation.DROP
    });

    marker.addListener('dragend', (event) => {
      form.value.latitude = event.latLng.lat();
      form.value.longitude = event.latLng.lng();
      updateAddressFromLatLng(event.latLng.lat(), event.latLng.lng());
    });

    map.addListener('click', (event) => {
      marker.setPosition(event.latLng);
      form.value.latitude = event.latLng.lat();
      form.value.longitude = event.latLng.lng();
      updateAddressFromLatLng(event.latLng.lat(), event.latLng.lng());
    });

    panorama.addListener('position_changed', () => {
      const position = panorama.getPosition();
      marker.setPosition(position);
      form.value.latitude = position.lat();
      form.value.longitude = position.lng();
      updateAddressFromLatLng(position.lat(), position.lng());
    });

    panorama.addListener('click', (event) => {
      updateAddressFromLatLng(event.latLng.lat(), event.latLng.lng());
    });

    try {
      const searchInput = document.getElementById('addressLine1');
      const searchBox = new google.maps.places.SearchBox(searchInput);

      map.addListener('bounds_changed', () => {
        searchBox.setBounds(map.getBounds());
      });

      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;

        const place = places[0];
        if (!place.geometry || !place.geometry.location) {
          apiError.value = 'No location details available for this address.';
          return;
        }

        map.setCenter(place.geometry.location);
        marker.setPosition(place.geometry.location);
        map.setZoom(17);

        form.value.latitude = place.geometry.location.lat();
        form.value.longitude = place.geometry.location.lng();
        updateFormFromPlace(place);
      });
    } catch (error) {
      handleApiError('Places API Error: ' + error.message);
    }

  } catch (error) {
    handleApiError(error.message);
  }
};

const updateAddressFromLatLng = (lat, lng) => {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    if (status === 'OK' && results[0]) {
      updateFormFromPlace(results[0]);
    } else {
      apiError.value = 'Could not find address for this location.';
    }
  });
};

const submitForm = async () => {
  if (!authStore.isAuthenticated) {
    apiError.value = 'Please log in to save your shipping address.';
    return;
  }

  try {
    isSubmitting.value = true;
    const result = await addressStore.createAddress(form.value);
    
    if (result.success) {
      Object.keys(form.value).forEach(key => {
        if (key !== 'latitude' && key !== 'longitude') {
          form.value[key] = '';
        }
      });

      if (marker && map) {
        marker.setPosition(map.getCenter());
      }

      alert('Shipping address saved successfully!');
      emit('address-added');
    } else {
      apiError.value = result.error || 'Failed to save shipping address';
    }
  } catch (error) {
    console.error('Error saving shipping address:', error);
    apiError.value = 'An error occurred while saving the shipping address. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    apiError.value = 'Google Maps API key is missing. Please check your environment variables.';
    return;
  }

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  
  script.onerror = () => {
    handleApiError('Failed to load Google Maps API script');
  };

  window.gm_authFailure = () => {
    handleApiError('Google Maps authentication failed. Please check your API key configuration.');
  };

  script.onload = () => {
    initMap();
  };

  document.head.appendChild(script);
});
</script>