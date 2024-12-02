<template>
    <div class="absolute z-10 mt-1 bg-white rounded-lg shadow-lg p-4 w-[28rem]">
      <div class="flex justify-between items-center mb-2">
        <button @click="previousMonth" class="text-gray-600 hover:text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
        <span class="font-semibold text-lg">{{ currentMonthName }} {{ currentYear }}</span>
        <button @click="nextMonth" class="text-gray-600 hover:text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      <div class="grid grid-cols-7 gap-1 mb-1">
        <div v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="day" class="text-center text-gray-600 text-xs font-medium">
          {{ day }}
        </div>
      </div>
      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="date in calendarDates"
          :key="date.toISOString()"
          @click="selectDate(date)"
          :class="[
            'w-9 h-7 rounded-sm text-sm flex items-center justify-center',
            isCurrentMonth(date) ? 'text-gray-700' : 'text-gray-400',
            isSelected(date) ? 'bg-[#FF9934] text-white' : 'hover:bg-gray-100'
          ]"
        >
          {{ date.getDate() }}
        </button>
      </div>
      <div class="mt-2 flex items-center justify-between">
        <div class="flex items-center">
          <label class="block text-xs font-medium text-gray-700 mr-2">Time:</label>
          <input
            type="time"
            v-model="selectedTime"
            class="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FF9934] text-gray-700 text-sm"
            @change="updateDateTime"
          />
        </div>
        <button
          @click="close"
          class="px-3 py-1 bg-[#FF9934] text-white text-sm rounded-full hover:bg-[#E88820] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9934]"
        >
          Done
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  
  const props = defineProps({
    selectedDate: {
      type: Date,
      required: true
    }
  });
  
  const emit = defineEmits(['select-date', 'close']);
  
  const currentDate = ref(new Date(props.selectedDate));
  const selectedTime = ref(formatTime(props.selectedDate));
  
  const currentMonthName = computed(() => {
    return currentDate.value.toLocaleString('default', { month: 'long' });
  });
  
  const currentYear = computed(() => {
    return currentDate.value.getFullYear();
  });
  
  const calendarDates = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
  
    const calendarDays = [];
  
    // Add days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      calendarDays.push(new Date(year, month, -i));
    }
  
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(new Date(year, month, i));
    }
  
    // Add days from next month
    const remainingDays = 42 - calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push(new Date(year, month + 1, i));
    }
  
    return calendarDays;
  });
  
  function isCurrentMonth(date) {
    return date.getMonth() === currentDate.value.getMonth();
  }
  
  function isSelected(date) {
    return date.toDateString() === props.selectedDate.toDateString();
  }
  
  function selectDate(date) {
    const [hours, minutes] = selectedTime.value.split(':');
    date.setHours(parseInt(hours), parseInt(minutes));
    emit('select-date', date);
  }
  
  function previousMonth() {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
  }
  
  function nextMonth() {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
  }
  
  function formatTime(date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
  
  function updateDateTime() {
    const [hours, minutes] = selectedTime.value.split(':');
    const newDate = new Date(props.selectedDate);
    newDate.setHours(parseInt(hours), parseInt(minutes));
    emit('select-date', newDate);
  }
  
  function close() {
    emit('close');
  }
  
  watch(() => props.selectedDate, (newDate) => {
    currentDate.value = new Date(newDate);
    selectedTime.value = formatTime(newDate);
  });
  </script>
  
  <style scoped>
  /* Change the blue highlight color in the time picker */
  input[type="time"]::-webkit-calendar-picker-indicator {
    color: #FF9934;
  }
  
  input[type="time"]::-webkit-inner-spin-button,
  input[type="time"]::-webkit-clear-button {
    color: #FF9934;
  }
  
  /* Style for the dropdown items */
  input[type="time"]::-webkit-datetime-edit-fields-wrapper {
    color: #FF9934;
  }
  
  input[type="time"]::-webkit-datetime-edit-hour-field:focus,
  input[type="time"]::-webkit-datetime-edit-minute-field:focus,
  input[type="time"]::-webkit-datetime-edit-ampm-field:focus {
    background-color: #FF9934;
    color: white;
  }
  </style>
  
  