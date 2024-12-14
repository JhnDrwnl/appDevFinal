<template>
  <div class="min-h-screen bg-slate-50/50 p-4 md:p-8 lg:p-10">
    <div class="mx-auto max-w-[1400px] space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
        <!-- Products Card -->
        <div class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_4px_12px_rgb(0,0,0,0.06)]">
          <div class="flex justify-between">
            <div class="space-y-1">
              <h2 class="text-sm font-medium text-slate-600">Products</h2>
              <p class="text-3xl font-bold text-slate-800">{{ productCount }}</p>
              <div class="flex items-center gap-1">
                <span :class="productPercentageChange >= 0 ? 'text-emerald-600' : 'text-rose-600'"
                      class="inline-flex items-center text-sm font-medium">
                  {{ productPercentageChange >= 0 ? '+' : '' }}{{ productPercentageChange }}%
                </span>
                <span class="text-xs text-slate-500">vs last week</span>
              </div>
            </div>
            <div class="relative h-20 w-20">
              <svg viewBox="0 0 36 36" class="circular-chart transform transition-transform duration-300 group-hover:scale-105">
                <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="circle" stroke="#FF9934" :stroke-dasharray="`${(inStockCount / productCount) * 100}, 100`"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <span class="text-sm text-slate-600">In Stock: <span class="font-medium text-slate-800">{{ inStockCount }}</span></span>
            <span class="text-sm text-slate-600">Out: <span class="font-medium text-slate-800">{{ outOfStockCount }}</span></span>
          </div>
        </div>

        <!-- Orders Card -->
        <div class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_4px_12px_rgb(0,0,0,0.06)]">
          <div class="flex justify-between">
            <div class="space-y-1">
              <h2 class="text-sm font-medium text-slate-600">Total Orders</h2>
              <p class="text-3xl font-bold text-slate-800">{{ orderCount }}</p>
              <div class="flex items-center gap-1">
                <span :class="orderPercentageChange >= 0 ? 'text-emerald-600' : 'text-rose-600'"
                      class="inline-flex items-center text-sm font-medium">
                  {{ orderPercentageChange >= 0 ? '+' : '' }}{{ orderPercentageChange }}%
                </span>
                <span class="text-xs text-slate-500">vs last week</span>
              </div>
            </div>
            <div class="relative h-16 w-24">
              <svg viewBox="0 0 100 50" class="h-full w-full transform transition-transform duration-300 group-hover:scale-105">
                <polyline fill="none" stroke="#FF9934" stroke-width="2" :points="getChartPoints(weeklyOrderData)"
                          class="transition-all duration-300" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders Chart -->
      <div class="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgb(0,0,0,0.04)]">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-800">Total Orders</h2>
          <select v-model="selectedMonth"
                  class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-[#FF9934] focus:outline-none focus:ring-2 focus:ring-[#FF9934] focus:ring-opacity-20">
            <option v-for="month in availableMonths" :key="month" :value="month">{{ month }}</option>
          </select>
        </div>
        <div class="h-[400px]">
          <canvas ref="orderChart"></canvas>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgb(0,0,0,0.04)]">
        <h2 class="mb-4 text-lg font-semibold text-slate-800">Recent Orders</h2>
        <div v-if="recentOrders.length > 0" class="divide-y divide-slate-100">
          <div v-for="order in recentOrders" :key="order.id"
               class="flex items-center justify-between py-4 transition-colors hover:bg-slate-50">
            <div class="space-y-1">
              <p class="font-medium text-slate-800">Order #{{ order.id }}</p>
              <p class="text-sm text-slate-500">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="text-right">
              <p class="font-medium text-slate-800">₱{{ order.totalAmount.toFixed(2) }}</p>
              <p class="text-sm" :class="{
                'text-emerald-600': order.status === 'completed',
                'text-amber-600': order.status === 'pending',
                'text-slate-600': !['completed', 'pending'].includes(order.status)
              }">{{ order.status }}</p>
            </div>
          </div>
        </div>
        <p v-else class="py-4 text-center text-sm text-slate-500">No recent orders</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { db } from '@/services/firebase'
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore'
import Chart from 'chart.js/auto'
import { useProductStore } from '@/store/modules/products'

const productStore = useProductStore()
const productCount = ref(0)
const inStockCount = ref(0)
const outOfStockCount = ref(0)
const orderCount = ref(0)
const recentOrders = ref([])
const selectedMonth = ref('')
const orderChart = ref(null)
let chartInstance = null

const weeklyOrderData = ref([])
const previousWeekOrderData = ref([])

const productPercentageChange = ref(0)
const orderPercentageChange = ref(0)

const availableMonths = computed(() => {
  const months = []
  const currentDate = new Date()
  for (let i = 0; i < 12; i++) {
    const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    months.push(month.toLocaleString('default', { month: 'long', year: 'numeric' }))
  }
  return months
})

const formatDate = (date) => {
  return new Date(date.seconds * 1000).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getChartPoints = (data) => {
  if (data.length === 0) return ''
  const max = Math.max(...data)
  const min = Math.min(...data)
  return data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = max === min ? 25 : 50 - ((value - min) / (max - min)) * 50
    return `${x},${y}`
  }).join(' ')
}

const fetchProducts = async () => {
  await productStore.fetchProducts()
  productCount.value = productStore.products.length
  inStockCount.value = productStore.getInStockProducts().length
  outOfStockCount.value = productStore.getOutOfStockProducts().length
}

const fetchOrders = async (month) => {
  const ordersRef = collection(db, 'reservations')
  const recentOrdersQuery = query(ordersRef, orderBy('createdAt', 'desc'), limit(5))
  const recentOrdersSnapshot = await getDocs(recentOrdersQuery)
  recentOrders.value = recentOrdersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt
  }))

  const startOfMonth = new Date(month)
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const endOfMonth = new Date(startOfMonth)
  endOfMonth.setMonth(endOfMonth.getMonth() + 1)
  endOfMonth.setDate(0)
  endOfMonth.setHours(23, 59, 59, 999)

  const monthOrdersQuery = query(
    ordersRef,
    where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
    where('createdAt', '<=', Timestamp.fromDate(endOfMonth)),
    orderBy('createdAt', 'asc')
  )
  const monthOrdersSnapshot = await getDocs(monthOrdersQuery)

  const ordersByDay = monthOrdersSnapshot.docs.reduce((acc, doc) => {
    const date = doc.data().createdAt.toDate()
    const dayOfMonth = date.getDate() - 1 // 0-indexed
    if (!acc[dayOfMonth]) acc[dayOfMonth] = 0
    acc[dayOfMonth]++
    return acc
  }, Array(endOfMonth.getDate()).fill(0))

  const currentDate = new Date()
  const isCurrentMonth = startOfMonth.getMonth() === currentDate.getMonth() && startOfMonth.getFullYear() === currentDate.getFullYear()

  if (isCurrentMonth) {
    const currentDay = currentDate.getDate()
    weeklyOrderData.value = ordersByDay.slice(Math.max(0, currentDay - 7), currentDay)
    previousWeekOrderData.value = ordersByDay.slice(Math.max(0, currentDay - 14), currentDay - 7)
  } else {
    weeklyOrderData.value = ordersByDay.slice(-7)
    previousWeekOrderData.value = ordersByDay.slice(-14, -7)
  }

  orderCount.value = ordersByDay.reduce((sum, count) => sum + count, 0)
}

const initOrderChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = orderChart.value.getContext('2d')
  const currentWeekData = weeklyOrderData.value
  const previousWeekData = previousWeekOrderData.value
  const labels = Array.from({length: 7}, (_, i) => i + 1)

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Current Week',
          data: currentWeekData,
          borderColor: '#FF9934',
          tension: 0.4
        },
        {
          label: 'Previous Week',
          data: previousWeekData,
          borderColor: '#9CA3AF',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  })
}

const calculatePercentageChanges = () => {
  const calculateChange = (currentValue, previousValue) => {
    return previousValue === 0 ? 100 : Math.round(((currentValue - previousValue) / previousValue) * 100)
  }

  productPercentageChange.value = calculateChange(productCount.value, productCount.value - 1)
  orderPercentageChange.value = calculateChange(orderCount.value, orderCount.value - weeklyOrderData.value[0])
}

const updateDashboard = async () => {
  await fetchProducts()
  await fetchOrders(new Date())
  calculatePercentageChanges()
  initOrderChart()
}

watch(selectedMonth, async (newMonth) => {
  const [monthName, year] = newMonth.split(' ')
  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth()
  const selectedDate = new Date(Number(year), monthIndex)
  await fetchOrders(selectedDate)
  calculatePercentageChanges()
  initOrderChart()
})

onMounted(async () => {
  selectedMonth.value = availableMonths.value[0]
  await updateDashboard()
})
</script>

<style scoped>
.circular-chart {
  display: block;
  margin: 10px auto;
  max-width: 80%;
  max-height: 250px;
}
.circle-bg {
  fill: none;
  stroke: rgb(241 245 249);
  stroke-width: 3;
}
.circle {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  animation: progress 1s ease-out forwards;
}
@keyframes progress {
  0% {
    stroke-dasharray: 0 100;
  }
}
</style>

