<!-- views/admin/Administration.vue -->
<template>
  <div class="max-w-7xl mx-auto w-full">
    <div v-if="user" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
      <!-- Alert component for messages -->
      <Alert
        v-if="alertMessage"
        :type="alertType"
        :dismissible="true"
        v-model="showAlert"
        @dismiss="clearAlert"
      >
        {{ alertMessage }}
      </Alert>

      <div class="space-y-8">
        <!-- Profile Picture Section -->
        <div class="bg-gray-50 rounded-lg p-6">
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
                :disabled="isUpdatingProfilePicture"
              >
                {{ isUpdatingProfilePicture ? 'Saving...' : (fileSelected ? 'Save' : 'Upload') }}
              </button>
              <button
                type="button"
                @click="resetProfilePicture"
                class="px-6 py-2 text-white bg-[#FF9494] rounded-full hover:bg-[#FF7070] transition-colors"
                :disabled="isUpdatingProfilePicture"
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
        <div class="bg-gray-50 rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Email Address</h2>
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-600">{{ user.email }}</p>
            <button
              @click="toggleEmailEdit"
              class="p-2 text-gray-500 hover:text-[#0095FF] focus:outline-none"
            >
              <PencilSquareIcon v-if="!isEditingEmail" class="h-5 w-5" />
              <XMarkIcon v-else class="h-5 w-5" />
            </button>
          </div>
          <transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <form v-if="isEditingEmail" @submit.prevent="changeEmail" class="mt-4 space-y-4">
              <div>
                <label for="newEmail" class="block text-sm font-medium text-gray-700">New Email</label>
                <input 
                  v-model="newEmail" 
                  id="newEmail" 
                  type="email" 
                  required 
                  class="mt-1 block w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF]"
                >
              </div>
              <div>
                <label for="currentPasswordEmail" class="block text-sm font-medium text-gray-700">Current Password</label>
                <div class="relative">
                  <input 
                    v-model="currentPasswordEmail" 
                    id="currentPasswordEmail" 
                    :type="showCurrentPasswordEmail ? 'text' : 'password'"
                    required 
                    class="mt-1 block w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF] pr-10"
                  >
                  <button
                    type="button"
                    @click="showCurrentPasswordEmail = !showCurrentPasswordEmail"
                    class="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <EyeIcon v-if="!showCurrentPasswordEmail" class="h-5 w-5 text-gray-400" />
                    <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <button 
                type="submit" 
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#0095FF] hover:bg-[#0077CC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0095FF]"
                :disabled="isChangingEmail"
              >
                {{ isChangingEmail ? 'Processing...' : 'Change Email' }}
              </button>
            </form>
          </transition>
        </div>

        <!-- Password Change Section -->
        <div class="bg-gray-50 rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Password</h2>
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-600">••••••••</p>
            <button
              @click="togglePasswordEdit"
              class="p-2 text-gray-500 hover:text-[#0095FF] focus:outline-none"
            >
              <PencilSquareIcon v-if="!isEditingPassword" class="h-5 w-5" />
              <XMarkIcon v-else class="h-5 w-5" />
            </button>
          </div>
          <transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <form v-if="isEditingPassword" @submit.prevent="changePassword" class="mt-4 space-y-4">
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-700">Current Password</label>
                <div class="relative">
                  <input 
                    v-model="currentPassword" 
                    id="currentPassword" 
                    :type="showCurrentPassword ? 'text' : 'password'"
                    required 
                    class="mt-1 block w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF] pr-10"
                  >
                  <button
                    type="button"
                    @click="showCurrentPassword = !showCurrentPassword"
                    class="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <EyeIcon v-if="!showCurrentPassword" class="h-5 w-5 text-gray-400" />
                    <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
                <div class="relative">
                  <input 
                    v-model="newPassword" 
                    id="newPassword" 
                    :type="showNewPassword ? 'text' : 'password'"
                    required 
                    class="mt-1 block w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF] pr-10"
                  >
                  <button
                    type="button"
                    @click="showNewPassword = !showNewPassword"
                    class="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <EyeIcon v-if="!showNewPassword" class="h-5 w-5 text-gray-400" />
                    <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <div>
                <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <div class="relative">
                  <input 
                    v-model="confirmNewPassword" 
                    id="confirmNewPassword" 
                    :type="showConfirmNewPassword ? 'text' : 'password'"
                    required 
                    class="mt-1 block w-full px-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0095FF] pr-10"
                  >
                  <button
                    type="button"
                    @click="showConfirmNewPassword = !showConfirmNewPassword"
                    class="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <EyeIcon v-if="!showConfirmNewPassword" class="h-5 w-5 text-gray-400" />
                    <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <button 
                type="submit" 
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#0095FF] hover:bg-[#0077CC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0095FF]"
                :disabled="isChangingPassword || !passwordsMatch || !newPassword"
              >
                {{ isChangingPassword ? 'Processing...' : 'Change Password' }}
              </button>
            </form>
          </transition>
        </div>
      </div>
    </div>
    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8 text-center">
      <p>Loading user data...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  EyeIcon, 
  EyeSlashIcon,
  PencilSquareIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/store/modules/auth'
import Alert from '@/components/common/Alert.vue'

const authStore = useAuthStore()

const user = computed(() => authStore.user)

// Alert state
const alertMessage = ref('')
const alertType = ref('info')
const showAlert = ref(false)

const clearAlert = () => {
  alertMessage.value = ''
  showAlert.value = false
}

const setAlert = (message, type = 'info') => {
  alertMessage.value = message
  alertType.value = type
  showAlert.value = true
}

// Profile Picture
const fileSelected = ref(false)
const isUpdatingProfilePicture = ref(false)
const displayedImageUrl = computed(() => {
  return fileSelected.value ? URL.createObjectURL(selectedFile.value) : (user.value?.photoURL || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'36\' height=\'36\' viewBox=\'0 0 36 36\'%3E%3Crect width=\'36\' height=\'36\' fill=\'%23f0f2f5\'/%3E%3Cpath d=\'M18 20.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM8 28.5c0-2.5 5-5 10-5s10 2.5 10 5\' stroke=\'%23bec3c9\' stroke-width=\'2\' fill=\'none\'/%3E%3C/svg%3E')
})
const selectedFile = ref(null)

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size <= 800 * 1024) { // 800KB max
      selectedFile.value = file
      fileSelected.value = true
    } else {
      setAlert('File size exceeds 800KB limit.', 'error')
    }
  }
}

const handleProfilePictureUpdate = async () => {
  if (selectedFile.value) {
    isUpdatingProfilePicture.value = true
    try {
      const result = await authStore.updateProfilePicture(selectedFile.value)
      if (result.success) {
        setAlert(result.message, 'success')
        fileSelected.value = false
        selectedFile.value = null
        displayedImageUrl.value = `${result.photoURL}?t=${Date.now()}`
      } else {
        throw new Error(result.error || 'Failed to update profile picture')
      }
    } catch (error) {
      setAlert(error.message, 'error')
    } finally {
      isUpdatingProfilePicture.value = false
    }
  }
}

const resetProfilePicture = () => {
  fileSelected.value = false
  selectedFile.value = null
  clearAlert()
}

// Email Change
const isEditingEmail = ref(false)
const newEmail = ref('')
const currentPasswordEmail = ref('')
const showCurrentPasswordEmail = ref(false)
const isChangingEmail = ref(false)

const toggleEmailEdit = () => {
  isEditingEmail.value = !isEditingEmail.value
  if (!isEditingEmail.value) {
    newEmail.value = ''
    currentPasswordEmail.value = ''
    clearAlert()
  }
}

const changeEmail = async () => {
  isChangingEmail.value = true
  try {
    const result = await authStore.changeEmailWithVerification(newEmail.value, currentPasswordEmail.value)
    setAlert(result.message, result.success ? 'success' : 'error')
    if (result.success) {
      newEmail.value = ''
      currentPasswordEmail.value = ''
      isEditingEmail.value = false
    }
  } catch (error) {
    setAlert(error.message || 'An error occurred while changing the email.', 'error')
  } finally {
    isChangingEmail.value = false
  }
}

// Password Change
const isEditingPassword = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmNewPassword = ref(false)
const isChangingPassword = ref(false)

const passwordsMatch = computed(() => newPassword.value === confirmNewPassword.value)

const togglePasswordEdit = () => {
  isEditingPassword.value = !isEditingPassword.value
  if (!isEditingPassword.value) {
    currentPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
    clearAlert()
  }
}

const changePassword = async () => {
  if (!passwordsMatch.value) {
    setAlert('New passwords do not match.', 'error')
    return
  }

  if (currentPassword.value === newPassword.value) {
    setAlert('New password must be different from the current password.', 'error')
    return
  }

  isChangingPassword.value = true
  try {
    const result = await authStore.changePassword(currentPassword.value, newPassword.value)
    setAlert(result.message, result.success ? 'success' : 'error')
    if (result.success) {
      currentPassword.value = ''
      newPassword.value = ''
      confirmNewPassword.value = ''
      isEditingPassword.value = false
    } else {
      // Handle the case when the current password is incorrect
      if (result.error === 'wrong-password') {
        setAlert('The current password you entered is incorrect. Please try again.', 'error')
      }
    }
  } catch (error) {
    if (error.code === 'auth/wrong-password') {
      setAlert('The current password you entered is incorrect. Please try again.', 'error')
    } else {
      setAlert(error.message || 'An error occurred while changing the password.', 'error')
    }
  } finally {
    isChangingPassword.value = false
  }
}
</script>

<style scoped>
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}
</style>