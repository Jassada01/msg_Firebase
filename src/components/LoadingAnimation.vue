<template>
  <div class="flex items-center justify-center h-full w-full">
    <div class="text-center space-y-6">
      <!-- BT21 Koya Animation -->
      <div class="relative w-48 h-48 mx-auto">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/msgproject-6bb1b.firebasestorage.app/o/chat-files%2F1735812327780_bt21-koya.gif?alt=media&token=bd130e0f-c309-4720-a96a-c00f6af82350"
          alt="BT21 Koya Loading Animation"
          class="w-full h-full object-contain"
        />
      </div>

      <!-- Loading Text -->
      <div class="flex flex-col items-center gap-2">
        <div
          class="text-xl font-bold text-gray-600 animate-pulse tracking-wide"
        >
          Loading...
        </div>
        <div class="text-base text-gray-500">
          Nomming eucalyptus leaves... 🌿
        </div>
      </div>

      <!-- Eucalyptus Leaves Progress -->
      <div class="flex justify-center gap-6 mt-4">
        <div
          v-for="index in 4"
          :key="index"
          class="w-5 h-5 rounded-full animate-leaf-bounce"
          :style="{
            backgroundColor:
              index === 1
                ? '#86EFAC'
                : index === 2
                ? '#4ADE80'
                : index === 3
                ? '#22C55E'
                : '#16A34A',
            animationDelay: `${(index - 1) * 0.2}s`,
          }"
        >
          <div
            class="w-4 h-3 bg-green-200 rounded-full mx-auto mt-0.5 animate-pulse"
          ></div>
        </div>
      </div>

      <!-- Hearts Animation -->
      <div class="flex justify-center gap-3 mt-2">
        <div
          v-for="index in 3"
          :key="index"
          class="text-xl animate-float-up"
          :style="{ animationDelay: `${(index - 1) * 0.8}s` }"
        >
          ❤️
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No props needed
</script>

<style scoped>
@keyframes float-up {
  0% {
    transform: translateY(0) scale(0.5);
    opacity: 0;
  }
  50% {
    transform: translateY(-20px) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-40px) scale(0.8);
    opacity: 0;
  }
}

.animate-float-up {
  animation: float-up 2.4s infinite;
}

/* Shadow and Hover Effects */
.rounded-3xl,
.rounded-full {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.animate-leaf-bounce:hover {
  animation-duration: 0.8s;
  filter: brightness(1.1);
}
</style>
