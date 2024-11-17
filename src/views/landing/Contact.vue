<template>
    <div class="contact">
      <h1 class="text-3xl font-semibold mb-6">Contact Us</h1>
      <form @submit.prevent="submitForm" class="max-w-lg mx-auto">
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" id="name" v-model="form.name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
        </div>
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" v-model="form.email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
        </div>
        <div class="mb-4">
          <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
          <textarea id="message" v-model="form.message" rows="4" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"></textarea>
        </div>
        <div class="mt-6">
          <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Send Message
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { reactive } from 'vue'
  
  const form = reactive({
    name: '',
    email: '',
    message: ''
  })
  
  const submitForm = () => {
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', form)
    // Reset form after submission
    form.name = ''
    form.email = ''
    form.message = ''
    alert('Thank you for your message. We will get back to you soon!')
  }
  </script>
  
  <style scoped>

  </style>