<template>
  <section class="bg-white py-12 sm:py-16 lg:py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Why Shop with DarwinAppdev
        </h2>
        <p class="mt-4 text-xl text-gray-600">
          Discover the advantages of choosing our platform for your online shopping needs.
        </p>
      </div>

      <div class="mt-16">
        <dl class="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
          <div v-for="feature in features" :key="feature.name" class="relative">
            <dt>
              <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <component :is="feature.icon" class="h-6 w-6" aria-hidden="true" />
              </div>
              <p class="ml-16 text-lg leading-6 font-medium text-gray-900">{{ feature.name }}</p>
            </dt>
            <dd class="mt-2 ml-16 text-base text-gray-500">{{ feature.description }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { Truck, ShieldCheck, Repeat, ThumbsUp } from 'lucide-vue-next'

const features = ref([
  {
    name: 'Free and Fast Shipping',
    description: 'Enjoy free shipping on all orders over $50. Most items arrive within 2-3 business days.',
    icon: Truck
  },
  {
    name: 'Secure Payments',
    description: 'Shop with confidence using our encrypted and secure payment systems.',
    icon: ShieldCheck
  },
  {
    name: 'Easy Returns',
    description: 'Not satisfied? Return any item within 30 days for a full refund, no questions asked.',
    icon: Repeat
  },
  {
    name: 'Top-Notch Support',
    description: '24/7 customer support to assist you with any questions or concerns about your purchase.',
    icon: ThumbsUp
  }
])
</script>