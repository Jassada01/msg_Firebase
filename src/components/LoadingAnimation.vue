<template>
  <div class="flex items-center justify-center h-full w-full">
    <div class="text-center space-y-6">
      <!-- Kawaii Koala Animation -->
      <div class="relative w-48 h-48 mx-auto">
        <!-- Bamboo Background -->
        <div class="absolute w-6 h-40 bg-green-200 rounded-full left-2 bottom-0 -z-10"></div>
        <div class="absolute w-6 h-36 bg-green-200 rounded-full right-2 bottom-0 -z-10"></div>
        
        <!-- Koala Body -->
        <div class="absolute w-36 h-36 bg-[#E5E7EB] rounded-3xl left-1/2 -translate-x-1/2 bottom-4 animate-body-sway">
          <!-- Belly -->
          <div class="absolute w-24 h-24 bg-[#F3F4F6] rounded-full left-1/2 -translate-x-1/2 top-10"></div>
          
          <!-- Koala Face -->
          <div class="absolute w-32 h-28 bg-[#E5E7EB] rounded-3xl left-1/2 -translate-x-1/2 -top-4">
            <!-- Eyes -->
            <div class="absolute left-5 top-8 w-7 h-7">
              <div class="w-full h-full bg-white rounded-full">
                <div class="absolute w-4 h-4 bg-black rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-blink">
                  <div class="absolute w-1.5 h-1.5 bg-white rounded-full top-1 left-1"></div>
                </div>
              </div>
            </div>
            <div class="absolute right-5 top-8 w-7 h-7">
              <div class="w-full h-full bg-white rounded-full">
                <div class="absolute w-4 h-4 bg-black rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-blink">
                  <div class="absolute w-1.5 h-1.5 bg-white rounded-full top-1 left-1"></div>
                </div>
              </div>
            </div>
            
            <!-- Blush -->
            <div class="absolute -left-1 top-12 w-6 h-4 bg-pink-200 rounded-full opacity-60"></div>
            <div class="absolute -right-1 top-12 w-6 h-4 bg-pink-200 rounded-full opacity-60"></div>
            
            <!-- Nose -->
            <div class="absolute w-6 h-5 bg-[#4B5563] rounded-full left-1/2 -translate-x-1/2 top-16">
              <div class="absolute w-1.5 h-1.5 bg-white rounded-full top-1 right-1"></div>
            </div>
            
            <!-- Ears -->
            <div class="absolute -top-3 -left-4 w-10 h-10 bg-[#D1D5DB] rounded-full transform -rotate-15 animate-ear-wiggle"></div>
            <div class="absolute -top-3 -right-4 w-10 h-10 bg-[#D1D5DB] rounded-full transform rotate-15 animate-ear-wiggle-reverse"></div>
            
            <!-- Fluffy Cheeks -->
            <div class="absolute -left-2 top-12 w-8 h-8 bg-[#F3F4F6] rounded-full"></div>
            <div class="absolute -right-2 top-12 w-8 h-8 bg-[#F3F4F6] rounded-full"></div>
          </div>
          
          <!-- Arms -->
          <div class="absolute -left-6 top-10 w-8 h-14 bg-[#E5E7EB] rounded-2xl origin-top-right animate-wave-left">
            <div class="absolute bottom-0 w-6 h-6 bg-[#D1D5DB] rounded-full"></div>
          </div>
          <div class="absolute -right-6 top-10 w-8 h-14 bg-[#E5E7EB] rounded-2xl origin-top-left animate-wave-right">
            <div class="absolute bottom-0 w-6 h-6 bg-[#D1D5DB] rounded-full"></div>
          </div>
          
          <!-- Eucalyptus Leaf -->
          <div class="absolute -right-10 top-14 w-10 h-4 bg-green-300 rounded-full rotate-45 animate-leaf-swing">
            <div class="absolute w-8 h-3 bg-green-200 rounded-full top-0.5 left-1"></div>
          </div>
        </div>
      </div>

      <!-- Loading Text -->
      <div class="flex flex-col items-center gap-2">
        <div class="text-xl font-bold text-gray-600 animate-pulse tracking-wide">
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
            backgroundColor: index === 1 ? '#86EFAC' : index === 2 ? '#4ADE80' : index === 3 ? '#22C55E' : '#16A34A',
            animationDelay: `${(index - 1) * 0.2}s`
          }"
        >
          <div class="w-4 h-3 bg-green-200 rounded-full mx-auto mt-0.5 animate-pulse"></div>
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
@keyframes blink {
  0%, 85%, 100% { transform: scaleY(1); }
  90% { transform: scaleY(0.1); }
}

@keyframes wave-left {
  0%, 100% { transform: rotate(-15deg); }
  50% { transform: rotate(25deg); }
}

@keyframes wave-right {
  0%, 100% { transform: rotate(15deg); }
  50% { transform: rotate(-25deg); }
}

@keyframes leaf-swing {
  0%, 100% { transform: rotate(45deg) scale(1); }
  50% { transform: rotate(30deg) scale(1.05); }
}

@keyframes leaf-bounce {
  0%, 100% { 
    transform: translateY(0) scale(1);
    opacity: 0.8;
  }
  50% { 
    transform: translateY(-10px) scale(1.1);
    opacity: 1;
  }
}

@keyframes body-sway {
  0%, 100% { transform: translateX(-50%) rotate(-2deg); }
  50% { transform: translateX(-50%) rotate(2deg); }
}

@keyframes ear-wiggle {
  0%, 100% { transform: rotate(-15deg); }
  50% { transform: rotate(-5deg); }
}

@keyframes ear-wiggle-reverse {
  0%, 100% { transform: rotate(15deg); }
  50% { transform: rotate(5deg); }
}

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

.animate-blink { animation: blink 4s infinite; }
.animate-wave-left { animation: wave-left 3s infinite; }
.animate-wave-right { animation: wave-right 3s infinite; }
.animate-leaf-swing { animation: leaf-swing 2s infinite; }
.animate-leaf-bounce { animation: leaf-bounce 1.5s infinite; }
.animate-body-sway { animation: body-sway 4s infinite; }
.animate-ear-wiggle { animation: ear-wiggle 2s infinite; }
.animate-ear-wiggle-reverse { animation: ear-wiggle-reverse 2s infinite; }
.animate-float-up { animation: float-up 2.4s infinite; }

/* Shadow and Hover Effects */
.rounded-3xl, .rounded-full {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.animate-leaf-bounce:hover {
  animation-duration: 0.8s;
  filter: brightness(1.1);
}
</style>