<!-- components/ImageViewerModal.vue -->
<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black/75 backdrop-blur-sm" 
        @click="$emit('close')"
      ></div>
  
      <!-- Modal -->
      <div class="relative z-10 max-w-7xl w-full bg-base-100 rounded-lg overflow-hidden shadow-xl">
        <!-- Header -->
        <div class="absolute top-0 right-0 p-4">
          <button 
            @click="$emit('close')"
            class="btn btn-circle btn-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
  
        <!-- Image -->
        <img 
          :src="imageUrl" 
          alt="Full size image"
          class="w-full h-auto"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    imageUrl: {
      type: String,
      required: true
    }
  });
  
  defineEmits(['close']);
  </script>