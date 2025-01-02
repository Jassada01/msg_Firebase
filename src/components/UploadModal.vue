<!-- UploadModal.vue -->
<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">กำลังอัพโหลดไฟล์</h2>
        </div>

        <!-- Overall Progress -->
        <div v-if="files.length > 1" class="space-y-2">
          <div class="flex justify-between text-sm text-gray-600">
            <span>ความคืบหน้ารวม</span>
            <span>{{ uploadedFiles }}/{{ files.length }} ไฟล์</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${overallProgress}%` }"
            ></div>
          </div>
          <div class="text-sm text-gray-600 text-right">
            {{ overallProgress }}%
          </div>
        </div>

        <!-- Individual File Progress -->
        <div class="max-h-48 overflow-y-auto space-y-4">
          <div
            v-for="(file, index) in files"
            :key="file.name + index"
            class="space-y-2"
          >
            <div class="flex justify-between items-start">
              <div class="text-sm text-gray-600">
                <div class="font-medium">{{ file.name }}</div>
                <div class="text-xs">{{ formatFileSize(file.size) }}</div>
              </div>
              <div class="text-xs text-gray-500">
                {{ fileProgress[index] }}%
              </div>
            </div>

            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div
                class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                :style="{ width: `${fileProgress[index]}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="bg-red-50 border border-red-200 rounded-md p-3"
        >
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  files: {
    type: Array,
    required: true,
  },
  fileProgress: {
    type: Object,
    required: true,
  },
  fileStatus: {
    type: Object,
    required: true,
  },
  error: {
    type: String,
    default: null,
  },
});

const overallProgress = computed(() => {
  if (!props.files.length) return 0;
  const totalProgress = Object.values(props.fileProgress).reduce(
    (sum, progress) => sum + progress,
    0
  );
  return Math.round(totalProgress / props.files.length);
});

const uploadedFiles = computed(() => {
  return Object.values(props.fileStatus).filter(
    (status) => status === "completed"
  ).length;
});

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
