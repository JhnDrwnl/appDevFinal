<!-- src/views/admin/Dashboard.vue -->
<template>
    <div class="admin-dashboard">
      <h1 class="text-3xl font-semibold mb-6">Admin Dashboard</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-2">Total Orders</h2>
          <p class="text-3xl font-bold">123</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-2">Revenue</h2>
          <p class="text-3xl font-bold">$12,345</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-2">Active Users</h2>
          <p class="text-3xl font-bold">456</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // Add any necessary imports and logic here
  </script>