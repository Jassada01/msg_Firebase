<template>
  <div class="fixed inset-0 flex flex-col bg-base-100">
    <!-- Header -->
    <header class="navbar bg-gradient-to-r from-base-100 to-base-200 shadow-lg rounded-box px-2 sm:px-4 lg:px-6 border-b border-base-300">
      <!-- Logo and Status Section -->
      <div class="flex-1 flex items-center gap-4">
        <!-- Logo -->
        <div class="flex flex-col items-start gap-0">
          <span class="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
            Jubx
          </span>
          <span class="text-[10px] text-base-content/50 -mt-1">v3.0.5</span>
        </div>

        <!-- Divider -->
        <div class="h-6 w-px bg-base-300"></div>

        <!-- Status Components -->
        <div class="flex items-center gap-4">
          <LastLoginStatus :other-user-id="partnerUserId" />
          <SessionTimer />
        </div>
      </div>

      <!-- PIN Input Section -->
      <div class="flex-none flex items-center gap-3">
        <span class="text-xs text-base-content/70 hidden sm:inline">Security PIN:</span>
        <div class="relative group">
          <input
            type="text"
            class="input input-bordered input-sm w-24 sm:w-28 pr-8 text-center font-mono tracking-[0.2em] transition-all duration-200 ease-in-out hover:shadow-md focus:shadow-md focus:scale-[1.02] placeholder-base-content/30"
            v-model="pin"
            @input="handlePinInput"
            @focus="$event.target.select()"
            maxlength="4"
            pattern="\d*"
            placeholder="• • • •"
          />
          <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              class="w-4 h-4 text-base-content/50 transition-colors group-hover:text-primary"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>
      </div>
    </header>

    <!-- Chat Container Component -->
    <ChatContainer 
      :current-user-id="currentUserId"
      :pin="pin"
      @select-image="selectedImage = $event"
    />

    <!-- Image Preview Modal -->
    <div
      v-if="selectedImage"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      @click="selectedImage = null"
    >
      <img
        :src="selectedImage"
        class="max-w-[90%] max-h-[90vh] object-contain"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import SessionTimer from './SessionTimer.vue';
import LastLoginStatus from './LastLoginStatus.vue';
import ChatContainer from './ChatContainer.vue';
import { useOnlineStatus } from '../composables/useOnlineStatus';

// Props
const props = defineProps({
  currentUserId: {
    type: String,
    required: true,
  },
  partnerUserId: {
    type: String,
    required: true,
  },
});

// Refs
const { updateOnlineStatus } = useOnlineStatus(props.currentUserId); 
const pin = ref('1234');
const selectedImage = ref(null);

// Methods
const handlePinInput = (event) => {
  const value = event.target.value;
  if (/^\d*$/.test(value) && value.length <= 4) {
    pin.value = value;
  }
};
</script>

<style>
html, body {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}

/* Optional: Add smooth transition for hover effects */
.input {
  transition: all 0.2s ease-in-out;
}
</style>