<template>
  <div v-if="user" class="max-w-4xl mx-auto px-4 py-8">
    <!-- Tab Navigation -->
    <div class="mb-8 border-b border-gray-200">
      <nav class="flex space-x-8" aria-label="Settings navigation">
        <button
          @click="activeTab = 'profile'"
          :class="[
            'pb-4 px-1 font-medium text-sm flex items-center space-x-2',
            activeTab === 'profile'
              ? 'border-b-2 border-[#0095FF] text-[#0095FF]'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <UserIcon class="h-5 w-5" />
          <span>Profile Settings</span>
        </button>
        <button
          @click="activeTab = 'history'"
          :class="[
            'pb-4 px-1 font-medium text-sm flex items-center space-x-2',
            activeTab === 'history'
              ? 'border-b-2 border-[#0095FF] text-[#0095FF]'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <ClockIcon class="h-5 w-5" />
          <span>Update History</span>
        </button>
      </nav>
    </div>

    <div v-if="activeTab === 'profile'" class="space-y-8">
      <!-- Profile Picture Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Profile Picture</h2>
        <div class="flex flex-col items-center space-y-4">
          <img
            :src="displayedImageUrl"
            alt="Profile picture"
            class="w-32 h-32 rounded-full object-cover"
          />
          <div class="flex space-x-3">
            <button
              type="button"
              @click="fileSelected ? handleProfilePictureUpdate() : $refs.fileInput.click()"
              class="px-6 py-2 bg-[#0095FF] text-white rounded-full hover:bg-[#0077CC] transition-colors"
            >
              {{ fileSelected ? 'Save' : 'Upload' }}
            </button>
            <button
              type="button"
              @click="resetProfilePicture"
              class="px-6 py-2 text-white bg-[#FF9494] rounded-full hover:bg-[#FF7070] transition-colors"
            >
              Reset
            </button>
          </div>
          <input
            type="file"
            ref="fileInput"
            @change="handleFileChange"
            accept="image/*"
            class="hidden"
          />
          <p class="text-xs text-gray-500">Allowed JPG, GIF or PNG. Max size of 800K</p>
        </div>
      </div>

      <!-- Email Change Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Email Address</h2>
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <input
              type="email"
              v-model="email"
              :disabled="!isEditingEmail"
              placeholder="Email Address"
              class="flex-grow px-4 py-3 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
            />
            <button
              @click="toggleEmailEdit"
              class="p-2 text-gray-500 hover:text-green-600 focus:outline-none"
            >
              <PencilSquareIcon v-if="!isEditingEmail" class="h-5 w-5 text-green-500" />
              <XMarkIcon v-else class="h-5 w-5" />
            </button>
          </div>
          <div v-if="isEditingEmail" class="space-y-4">
            <div class="relative">
              <input
                :type="showCurrentPassword ? 'text' : 'password'"
                v-model="currentPassword"
                placeholder="Current Password (required for email change)"
                class="w-full px-4 py-3 bg-gray-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF] pr-10"
              />
              <button
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <EyeIcon v-if="!showCurrentPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <button
              @click="handleEmailChange"
              class="w-full px-6 py-2 bg-[#0095FF] text-white rounded-full hover:bg-[#0077CC] transition-colors"
            >
              Update Email
            </button>
          </div>
        </div>
      </div>

      <!-- Password Change Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Password</h2>
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <div class="flex-grow px-4 py-3 bg-gray-50/50 rounded-lg">
              ••••••••
            </div>
            <button
              @click="togglePasswordEdit"
              class="p-2 text-gray-500 hover:text-green-600 focus:outline-none"
            >
              <PencilSquareIcon v-if="!isEditingPassword" class="h-5 w-5 text-green-500" />
              <XMarkIcon v-else class="h-5 w-5" />
            </button>
          </div>
          <div v-if="isEditingPassword" class="space-y-4">
            <!-- Password change form fields -->
          </div>
        </div>
      </div>

    </div>

    <div v-if="activeTab === 'history'" class="space-y-8">
      <!-- Email Updates -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Email Update History</h2>
        <div class="h-64 overflow-y-auto mb-4">
          <div v-if="emailUpdateHistory.length > 0" class="space-y-4">
            <div v-for="(update, index) in paginatedEmailHistory" :key="index" class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <EnvelopeIcon class="h-5 w-5 text-gray-400" />
                <span class="text-sm text-gray-600">Changed from: {{ update.oldEmail }} to: {{ update.newEmail }}</span>
              </div>
              <span class="text-sm font-medium text-gray-900">{{ formatDateTime(update.timestamp) }}</span>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500">No email updates recorded.</p>
        </div>
      </div>

      <!-- Password Changes -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Password Change History</h2>
        <!-- Password change history content -->
      </div>

      <!-- Profile Picture Updates -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Profile Picture Update History</h2>
        <!-- Profile picture update history content -->
      </div>
    </div>
  </div>
  <div v-else class="max-w-4xl mx-auto px-4 py-8 text-center">
    <p>Loading user data...</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  ClockIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { format } from 'date-fns'


const authStore = useAuthStore()

// Tab state
const activeTab = ref('profile')

// Form fields
const email = ref('')
const currentPassword = ref('')

// Toggle password visibility
const showCurrentPassword = ref(false)

// Email editing state
const isEditingEmail = ref(false)

// Password editing state
const isEditingPassword = ref(false)

// Status message
const statusMessage = ref('')
const statusType = ref('')

// File selection state
const fileSelected = ref(false)

// Dummy email update history
const emailUpdateHistory = ref([
  { oldEmail: 'old@example.com', newEmail: 'new@example.com', timestamp: new Date() }
])

// Computed properties
const user = computed(() => authStore.user)

const displayedImageUrl = computed(() => {
  if (user.value && user.value.photoURL) {
    return user.value.photoURL
  } else {
    return 'https://via.placeholder.com/100'
  }
})

onMounted(() => {
  if (user.value) {
    email.value = user.value.email
  }
})

watch(user, () => {
  if (user.value) {
    email.value = user.value.email
  }
})

const toggleEmailEdit = () => {
  isEditingEmail.value = !isEditingEmail.value
  if (!isEditingEmail.value) {
    email.value = user.value.email
    currentPassword.value = ''
  }
}

const togglePasswordEdit = () => {
  isEditingPassword.value = !isEditingPassword.value
}

const handleEmailChange = async () => {
  if (!email.value) {
    statusMessage.value = 'Email is required'
    statusType.value = 'error'
    return
  }
  if (!currentPassword.value) {
    statusMessage.value = 'Current password is required'
    statusType.value = 'error'
    return
  }
  try {
    // Implement email change logic here
    statusMessage.value = 'Email updated successfully'
    statusType.value = 'success'
    isEditingEmail.value = false
    currentPassword.value = ''
    // Force a page reload to ensure the user is logged in with the new email
    window.location.reload()
  } catch (error) {
    statusMessage.value = error.message
    statusType.value = 'error'
  }
}

const formatDateTime = (timestamp) => {
  if (timestamp instanceof Date) {
    return format(timestamp, 'MMM d, yyyy HH:mm:ss')
  } else if (timestamp && timestamp.seconds) {
    return format(new Date(timestamp.seconds * 1000), 'MMM d, yyyy HH:mm:ss')
  }
  return 'Invalid date'
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    fileSelected.value = true
    // Implement file validation and preview logic here
  }
}

const handleProfilePictureUpdate = () => {
  // Implement profile picture update logic here
  console.log('Updating profile picture')
}

const resetProfilePicture = () => {
  // Implement profile picture reset logic here
  console.log('Resetting profile picture')
}

const paginatedEmailHistory = computed(() => {
  // Implement pagination logic for email history here
  return emailUpdateHistory.value
})
</script>