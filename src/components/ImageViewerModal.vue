<!-- components/ImageViewerModal.vue -->
<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/75 backdrop-blur-sm"
      @click="$emit('close')"
    ></div>

    <!-- Modal -->
    <div
      class="relative z-10 max-w-7xl w-full bg-base-100 rounded-lg overflow-hidden shadow-xl"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Header -->
      <div
        class="bg-black/50 fixed top-0 left-0 right-0 z-20 p-4 flex justify-between items-center"
      >
        <span class="text-sm text-white"
          >{{ displayIndex }} / {{ images.length }}</span
        >
        <button
          @click="$emit('close')"
          class="btn btn-circle btn-sm bg-black/50 border-0 text-white hover:bg-black/70"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Navigation Buttons -->
      <button
        v-if="images.length > 1"
        class="fixed left-4 top-1/2 -translate-y-1/2 btn btn-circle hidden sm:flex z-20 bg-black/50 border-0 text-white hover:bg-black/70"
        @click="previousImage"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        v-if="images.length > 1"
        class="fixed right-4 top-1/2 -translate-y-1/2 btn btn-circle hidden sm:flex z-20 bg-black/50 border-0 text-white hover:bg-black/70"
        @click="nextImage"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <!-- Images Container -->
      <div 
        class="relative overflow-hidden h-[calc(100vh-2rem)]"
        ref="containerRef"
      >
        <div
          class="flex h-full transition-transform duration-300 ease-in-out"
          :style="{ transform: `translateX(-${currentTranslate}%)` }"
          ref="sliderRef"
        >
          <!-- Last Image Clone -->
          <div class="min-w-full h-full flex items-center justify-center">
            <img
              :src="images[images.length - 1]"
              class="max-w-full max-h-full object-contain"
              :class="imageOrientations[images.length - 1] ? 'h-full' : 'w-full'"
            />
          </div>

          <!-- Main Images -->
          <div
            v-for="(image, index) in images"
            :key="index"
            class="min-w-full h-full flex items-center justify-center"
          >
            <img
              :src="image"
              :ref="el => { if (el) imageRefs[index] = el }"
              class="max-w-full max-h-full object-contain"
              :class="imageOrientations[index] ? 'h-full' : 'w-full'"
              @load="onImageLoad($event, index)"
            />
          </div>

          <!-- First Image Clone -->
          <div class="min-w-full h-full flex items-center justify-center">
            <img
              :src="images[0]"
              class="max-w-full max-h-full object-contain"
              :class="imageOrientations[0] ? 'h-full' : 'w-full'"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const props = defineProps({
  images: {
    type: Array,
    required: true,
  },
  initialIndex: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["close"]);

const currentIndex = ref(props.initialIndex);
const currentTranslate = ref((props.initialIndex + 1) * 100);
const isTransitioning = ref(false);
const touchStart = ref(null);
const touchEnd = ref(null);
const minSwipeDistance = 50;
const imageRefs = ref({});
const imageOrientations = ref({});
const sliderRef = ref(null);
const containerRef = ref(null);

// คำนวณ index ที่จะแสดงผล (1-based)
const displayIndex = computed(() => currentIndex.value + 1);

const resetTransition = () => {
  if (!sliderRef.value) return;
  sliderRef.value.style.transition = 'none';
  sliderRef.value.offsetHeight; // force reflow
  sliderRef.value.style.transition = 'transform 0.3s ease-in-out';
};

const handleTransitionEnd = () => {
  if (!isTransitioning.value) return;
  isTransitioning.value = false;
};

const nextImage = () => {
  if (isTransitioning.value) return;
  
  if (currentIndex.value === props.images.length - 1) {
    // ไปรูปแรกโดยไม่มี transition
    sliderRef.value.style.transition = 'none';
    currentIndex.value = 0;
    currentTranslate.value = 100;
    sliderRef.value.offsetHeight; // force reflow
    sliderRef.value.style.transition = 'transform 0.3s ease-in-out';
  } else {
    isTransitioning.value = true;
    currentIndex.value++;
    currentTranslate.value += 100;
  }
};

const previousImage = () => {
  if (isTransitioning.value) return;

  if (currentIndex.value === 0) {
    // ไปรูปสุดท้ายโดยไม่มี transition
    sliderRef.value.style.transition = 'none';
    currentIndex.value = props.images.length - 1;
    currentTranslate.value = props.images.length * 100;
    sliderRef.value.offsetHeight; // force reflow
    sliderRef.value.style.transition = 'transform 0.3s ease-in-out';
  } else {
    isTransitioning.value = true;
    currentIndex.value--;
    currentTranslate.value -= 100;
  }
};

const handleTouchStart = (e) => {
  touchStart.value = e.changedTouches[0].screenX;
};

const handleTouchMove = (e) => {
  touchEnd.value = e.changedTouches[0].screenX;
};

const handleTouchEnd = () => {
  if (!touchStart.value || !touchEnd.value) return;

  const distance = touchStart.value - touchEnd.value;
  const isLeftSwipe = distance > minSwipeDistance;
  const isRightSwipe = distance < -minSwipeDistance;

  if (isLeftSwipe) nextImage();
  if (isRightSwipe) previousImage();

  touchStart.value = null;
  touchEnd.value = null;
};

const onImageLoad = (event, index) => {
  const img = event.target;
  imageOrientations.value[index] = img.naturalHeight > img.naturalWidth;
};

onMounted(() => {
  document.body.style.overflow = "hidden";
  
  if (sliderRef.value) {
    sliderRef.value.addEventListener('transitionend', handleTransitionEnd);
  }

  return () => {
    document.body.style.overflow = "auto";
    if (sliderRef.value) {
      sliderRef.value.removeEventListener('transitionend', handleTransitionEnd);
    }
  };
});

// Watch for changes in currentIndex
watch(currentIndex, (newValue) => {
  if (newValue < -1 || newValue > props.images.length) {
    currentIndex.value = newValue < -1 ? props.images.length - 1 : 0;
    currentTranslate.value = (currentIndex.value + 1) * 100;
  }
});
</script>

<style scoped>
.flex {
  transition: transform 0.3s ease-in-out;
  -webkit-transition: transform 0.3s ease-in-out;
  touch-action: pan-y pinch-zoom;
  user-select: none;
  -webkit-user-select: none;
}

img {
  transition: all 0.3s ease;
  -webkit-transition: all 0.3s ease;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  -webkit-user-drag: none;
}

* {
  -webkit-tap-highlight-color: transparent;
}
</style>