<!-- components/user/Categories.vue -->
<template>
  <div class="bg-white border border-gray-200 rounded-lg p-4">
    <h2 class="font-bold text-lg mb-4">CATEGORIES</h2>
    <div class="space-y-2">
      <div v-for="category in rootCategories" :key="category.id">
        <div 
          @click="toggleCategory(category.id)"
          class="flex justify-between items-center cursor-pointer"
          :class="{ 'text-[#FF9934]': isSelected(category.id), 'opacity-50': hiddenCategories.includes(category.id) }"
        >
          <span class="font-semibold">{{ category.name }} ({{ category.productCount }})</span>
          <svg 
            v-if="hasSubcategories(category.id)"
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 transition-transform duration-200 ease-in-out"
            :class="{ 'transform rotate-180': openCategories.includes(category.id) }"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <div 
          v-if="hasSubcategories(category.id) && openCategories.includes(category.id)"
          class="ml-4 mt-2 space-y-2"
        >
          <div 
            v-for="subcategory in getSubcategories(category.id)" 
            :key="subcategory.id"
            class="flex justify-between items-center cursor-pointer"
            :class="{ 'text-[#FF9934]': isSelected(subcategory.id), 'opacity-50': hiddenCategories.includes(subcategory.id) }"
            @click.stop="toggleCategory(subcategory.id)"
          >
            <span class="text-sm">{{ subcategory.name }} ({{ subcategory.productCount }})</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCategoryStore } from '@/store/modules/categories';

const props = defineProps({
  selectedCategoryId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update-hidden-categories']);

const router = useRouter();
const categoryStore = useCategoryStore();

const openCategories = ref([]);
const hiddenCategories = ref([]);
const clickTimer = ref(null);

const rootCategories = computed(() => categoryStore.getRootCategories);
const getSubcategories = computed(() => categoryStore.getChildCategories);

const hasSubcategories = (categoryId) => {
  return getSubcategories.value(categoryId).length > 0;
};

const toggleHideCategory = (categoryId) => {
  const index = hiddenCategories.value.indexOf(categoryId);
  if (index === -1) {
    hiddenCategories.value.push(categoryId);
  } else {
    hiddenCategories.value.splice(index, 1);
  }
  emit('update-hidden-categories', hiddenCategories.value);
};

const handleDoubleClick = (categoryId) => {
  toggleHideCategory(categoryId);
  // Prevent the click event from firing
  clearTimeout(clickTimer.value);
  clickTimer.value = null;
};

const toggleCategory = (categoryId) => {
  if (clickTimer.value) {
    clearTimeout(clickTimer.value);
    clickTimer.value = null;
    handleDoubleClick(categoryId);
  } else {
    clickTimer.value = setTimeout(() => {
      const index = openCategories.value.indexOf(categoryId);
      if (index === -1) {
        openCategories.value = [categoryId];
      } else {
        openCategories.value = [];
      }
      selectCategory(categoryId);
      clickTimer.value = null;
    }, 250); // Adjust this delay as needed
  }
};

const selectCategory = (categoryId) => {
  router.push({ name: 'UserHome', query: { category: categoryId } });
  const category = categoryStore.getCategoryById(categoryId);
  if (category && category.parentIds && category.parentIds.length > 0) {
    openCategories.value = [category.parentIds[0]]; // Open parent category for subcategories
  } else {
    openCategories.value = [categoryId]; // Open clicked category if it's a root category
  }
};

const isSelected = (categoryId) => {
  return props.selectedCategoryId === categoryId;
};

watch(() => props.selectedCategoryId, (newCategoryId) => {
  if (newCategoryId) {
    const category = categoryStore.getCategoryById(newCategoryId);
    if (category && category.parentIds && category.parentIds.length > 0) {
      openCategories.value = [category.parentIds[0]];
    } else {
      openCategories.value = [newCategoryId];
    }
  } else {
    openCategories.value = [];
  }
});

onMounted(() => {
  categoryStore.fetchCategories();
  if (props.selectedCategoryId) {
    const category = categoryStore.getCategoryById(props.selectedCategoryId);
    if (category && category.parentIds && category.parentIds.length > 0) {
      openCategories.value = [category.parentIds[0]];
    } else {
      openCategories.value = [props.selectedCategoryId];
    }
  }
});
</script>



