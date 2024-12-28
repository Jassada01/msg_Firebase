<template>
  <div class="flex items-center justify-center h-full w-full">
    <div class="text-center space-y-6">
      <!-- Cute Cat Animation -->
      <div class="relative w-32 h-32 mx-auto">
        <!-- Cat Body -->
        <div
          class="absolute w-24 h-20 bg-gray-300 rounded-full left-1/2 -translate-x-1/2 bottom-0"
        >
          <!-- Cat Face -->
          <div
            class="absolute w-20 h-16 bg-gray-300 rounded-full left-1/2 -translate-x-1/2 -top-6"
          >
            <!-- Eyes -->
            <div
              class="absolute w-2 h-4 bg-black rounded-full left-4 top-6 animate-blink"
            ></div>
            <div
              class="absolute w-2 h-4 bg-black rounded-full right-4 top-6 animate-blink"
            ></div>
            <!-- Cat Ears -->
            <div
              class="absolute -top-3 -left-2 w-6 h-6 bg-gray-300 rotate-45"
            ></div>
            <div
              class="absolute -top-3 -right-2 w-6 h-6 bg-gray-300 rotate-45"
            ></div>
          </div>
          <!-- Tail -->
          <div
            class="absolute -right-8 bottom-4 w-12 h-3 bg-gray-300 rounded-full origin-left animate-tail-wave"
          ></div>
        </div>
      </div>

      <!-- Loading Dots -->
      <div class="flex justify-center items-center space-x-3">
        <div
          v-for="index in 3"
          :key="index"
          class="w-3 h-3 bg-primary rounded-full animate-bounce-custom"
          :style="{
            animationDelay: `${(index - 1) * 0.15}s`,
            backgroundColor:
              index === 1 ? '#FF9999' : index === 2 ? '#FFB366' : '#99FF99',
          }"
        ></div>
      </div>

      <!-- Loading Text -->
      <div class="flex flex-col items-center gap-2">
        <div class="text-lg font-medium text-base-content/80 animate-pulse">
          Loading...
        </div>
        <div class="text-sm text-base-content/60">
          fetching your messages... 🐱
        </div>
      </div>

      <!-- Progress Circle -->
      <div class="flex justify-center mt-4">
        <div class="relative w-20 h-20">
          <div
            v-for="index in 3"
            :key="index"
            class="absolute inset-0 border-4 rounded-full animate-spin-custom"
            :style="{
              borderColor: `${
                index === 1 ? '#FF9999' : index === 2 ? '#FFB366' : '#99FF99'
              } transparent transparent transparent`,
              animationDelay: `${(index - 1) * 0.15}s`,
              animationDuration: '1s',
            }"
          ></div>
        </div>
      </div>

      <!-- Paw Prints -->
      <div class="flex justify-center gap-4 mt-4">
        <div
          v-for="index in 3"
          :key="index"
          class="text-2xl animate-bounce-delayed"
          :style="{ animationDelay: `${(index - 1) * 0.2}s` }"
        >
          🐾
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No props or other logic needed
</script>

<style scoped>
@keyframes bounce-custom {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-12px) scale(1.2);
  }
}

@keyframes spin-custom {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes blink {
  0%,
  90%,
  100% {
    transform: scaleY(1);
  }
  95% {
    transform: scaleY(0.1);
  }
}

@keyframes tail-wave {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-20deg);
  }
}

.animate-bounce-custom {
  animation: bounce-custom 2s infinite;
}

.animate-spin-custom {
  animation: spin-custom 3s linear infinite;
}

.animate-blink {
  animation: blink 4s infinite;
}

.animate-bounce-delayed {
  animation: bounce-custom 1s infinite;
}

/* เพิ่ม transition สำหรับ hover effects */
.animate-bounce-custom:hover {
  animation-duration: 0.5s;
}
</style>
