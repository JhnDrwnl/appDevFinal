<!-- components/admin/TreeNode.vue -->
<template>
    <div class="tree-node">
      <div 
        class="flex items-center py-1 group cursor-pointer"
        :style="{ marginLeft: level === 0 ? '0' : '20px' }"
      >
        <div class="flex items-center w-full relative">
          <!-- Connecting lines -->
          <template v-if="level > 0">
            <div class="absolute left-[-20px] top-[50%] w-[20px] h-[1px] bg-gray-300"></div>
            <div 
              v-if="isFirstChild" 
              class="absolute left-[-20px] top-[-50%] w-[1px] h-[calc(100%+8px)] bg-gray-300"
            ></div>
            <div 
              v-if="!isLastChild" 
              class="absolute left-[-20px] top-[50%] w-[1px] h-[calc(100%+8px)] bg-gray-300"
            ></div>
          </template>
  
          <!-- Expand/Collapse icon -->
          <span 
            v-if="hasChildren"
            class="tree-prefix mr-1 select-none cursor-pointer transition-transform duration-300 ease-in-out"
            :class="{ 'transform rotate-45': !isCollapsed }"
            @click.stop="toggleCollapse"
          >
            <PlusIcon size="12" />
          </span>
          <span v-else class="tree-prefix mr-1 select-none w-[12px]"></span>
  
          <!-- Folder icon -->
          <Folder 
            class="w-4 h-4 mr-2 cursor-pointer" 
            :class="{ 
              'text-[#FF9934]': isSelected,
              'text-gray-400 cursor-not-allowed': node.id === disabledId
            }"
            @click.stop="selectAsParent" 
          />
  
          <!-- Category name -->
          <span 
            class="tree-label select-none flex-grow"
            :class="{ 'text-[#FF9934]': isSelected }"
            @click.stop="selectAsParent"
          >
            {{ node.name }}
          </span>
        </div>
      </div>
  
      <!-- Children container with transition -->
      <transition
        name="collapse"
        @enter="enter"
        @after-enter="afterEnter"
        @leave="leave"
      >
        <div 
          v-if="hasChildren && !isCollapsed" 
          class="tree-children overflow-hidden"
        >
          <TreeNode
            v-for="(child, index) in childCategories"
            :key="child.id"
            :node="child"
            :level="level + 1"
            :view-only="viewOnly"
            :selected-ids="selectedIds"
            :disabled-id="disabledId"
            :is-first-child="index === 0"
            :is-last-child="index === childCategories.length - 1"
            @select-parent="$emit('select-parent', $event)"
          />
        </div>
      </transition>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { Folder, PlusIcon } from 'lucide-vue-next'
  import { useCategoryStore } from '@/store/modules/categories'
  
  const props = defineProps({
    node: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      default: 0
    },
    viewOnly: {
      type: Boolean,
      default: false
    },
    selectedIds: {
      type: Array,
      default: () => []
    },
    disabledId: {
      type: [String, Number],
      default: null
    },
    isFirstChild: {
      type: Boolean,
      default: false
    },
    isLastChild: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits(['select-parent'])
  const categoryStore = useCategoryStore()
  const isCollapsed = ref(true)
  
  const childCategories = computed(() => {
    return categoryStore.getChildCategories(props.node.id)
  })
  
  const hasChildren = computed(() => childCategories.value.length > 0)
  const isSelected = computed(() => props.selectedIds.includes(props.node.id))
  
  const toggleCollapse = () => {
    if (hasChildren.value) {
      isCollapsed.value = !isCollapsed.value
    }
  }
  
  const selectAsParent = () => {
    if (!props.viewOnly && props.node.id !== props.disabledId) {
      emit('select-parent', props.node.id)
    }
  }
  
  // Transition hooks for smooth collapse/expand
  const enter = (element) => {
    element.style.height = '0';
    element.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      element.style.height = `${element.scrollHeight}px`;
    });
  }
  
  const afterEnter = (element) => {
    element.style.height = 'auto';
    element.style.overflow = 'visible';
  }
  
  const leave = (element) => {
    element.style.height = `${element.scrollHeight}px`;
    element.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      element.style.height = '0';
    });
  }
  </script>
  
  <style scoped>
  .tree-node {
    position: relative;
  }
  
  .tree-prefix {
    color: #9CA3AF;
    width: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .tree-label {
    font-size: 0.875rem;
    color: #111827;
    cursor: pointer;
  }
  
  .tree-label:hover {
    color: #FF9934;
  }
  
  .tree-children {
    position: relative;
  }
  
  .collapse-enter-active,
  .collapse-leave-active {
    transition: height 0.3s ease-in-out;
  }
  
  .collapse-enter-from,
  .collapse-leave-to {
    height: 0 !important;
  }
  </style>
  
  