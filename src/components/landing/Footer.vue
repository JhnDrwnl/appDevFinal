<template>
  <footer class="bg-[#FFF8F3]">
    <!-- Newsletter Section -->
    <div class="container mx-auto px-4 py-16">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold mb-4">Get 20% off on your first order</h2>
        <p class="text-gray-600">Join our email list for exclusive offers and the latest news.</p>
      </div>
      
      <div class="max-w-md mx-auto mb-16">
        <div class="flex gap-2">
          <input 
            type="email" 
            placeholder="Your E-Mail" 
            class="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF9934]"
          />
          <button class="bg-[#FF9934] text-white p-2 rounded-full hover:bg-[#FF8000] transition-colors">
            <ArrowRightIcon class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Main Footer Content -->
      <div class="grid md:grid-cols-4 gap-8">
        <!-- Company Info -->
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <img 
              src="@/assets/image/SALogo.png"
              alt="Supreme Agrivet Logo" 
              class="h-12"
            />
            <div class="flex flex-col">
              <span class="text-lg font-bold text-gray-900">Supreme</span>
              <span class="text-base text-gray-700">Agrivet</span>
            </div>
          </div>
          <p class="text-gray-600">
            Lorem ipsum dolor sit amet, consectet adipiscing elit. Gravida volutpat sapien viverra. Etiam id sit donec integer tincidunt vestibulum
          </p>
          <!-- Social Media Icons -->
          <div class="flex space-x-4">
            <a href="#" class="text-gray-600 hover:text-[#FF9934]">
              <FacebookIcon class="w-5 h-5" />
            </a>
            <a href="#" class="text-gray-600 hover:text-[#FF9934]">
              <TwitterIcon class="w-5 h-5" />
            </a>
            <a href="#" class="text-gray-600 hover:text-[#FF9934]">
              <YoutubeIcon class="w-5 h-5" />
            </a>
            <a href="#" class="text-gray-600 hover:text-[#FF9934]">
              <InstagramIcon class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- Account Links -->
        <div>
          <h3 class="font-bold text-lg mb-4">Account</h3>
          <ul class="space-y-2">
            <li><a href="#" class="text-gray-600 hover:text-[#FF9934]">My Account</a></li>
            <li><a href="#" class="text-gray-600 hover:text-[#FF9934]">Specials</a></li>
            <li><a href="#" class="text-gray-600 hover:text-[#FF9934]">Order History</a></li>
            <li><a href="#" class="text-gray-600 hover:text-[#FF9934]">Newsletter</a></li>
            <li><a href="#" class="text-gray-600 hover:text-[#FF9934]">Contact Us</a></li>
          </ul>
        </div>

        <!-- Information Links -->
        <div>
          <h3 class="font-bold text-lg mb-4">Information</h3>
          <ul class="space-y-2">
            <li><a href="#" class="text-gray-600 hover:text-[#FF9934]">About Us</a></li>
            <li><a href="#" class="text-gray-600 hover:text-[#FF9934]">Information</a></li>
            <li><a href="#" class="text-gray-600 hover:text-[#FF9934]">Privacy Policy</a></li>
            <li><a href="#" class="text-gray-600 hover:text-[#FF9934]">Terms Of Use</a></li>
            <li><a href="#" class="text-gray-600 hover:text-[#FF9934]">Privacy Policy</a></li>
          </ul>
        </div>

        <!-- Contact Information -->
        <div>
          <h3 class="font-bold text-lg mb-4">Contact Information</h3>
          <ul class="space-y-2">
            <li class="flex items-start space-x-2">
              <MapPinIcon class="w-5 h-5 text-[#FF9934] flex-shrink-0 mt-1" />
              <span class="text-gray-600">4005 Silver Business Point India</span>
            </li>
            <li class="flex items-center space-x-2">
              <PhoneIcon class="w-5 h-5 text-[#FF9934]" />
              <span class="text-gray-600">123456789</span>
            </li>
            <li class="flex items-center space-x-2">
              <MailIcon class="w-5 h-5 text-[#FF9934]" />
              <span class="text-gray-600">demoexample@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { 
  FacebookIcon, 
  TwitterIcon, 
  YoutubeIcon, 
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ArrowRightIcon
} from 'lucide-vue-next'
</script>

