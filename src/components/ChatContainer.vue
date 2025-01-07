<!-- ChatContainer.vue -->
<template>
  <div
    class="flex-1 w-full max-w-[100%] sm:max-w-[640px] lg:max-w-[768px] xl:max-w-[1024px] mx-auto p-2 sm:p-4 overflow-hidden"
  >
    <ImageViewerModal
      v-if="selectedImages.length > 0"
      :images="selectedImages"
      :initial-index="selectedImageIndex"
      @close="closeImageViewer"
    />
    <div class="h-full rounded-lg shadow-xl flex flex-col">
      <!-- Chat messages -->
      <ChatMessages
        :messages="messages"
        :current-user-id="currentUserId"
        :pin="pin"
        :is-initial-loading="isInitialLoading"
        @select-image="handleImageSelect"
      />

      <!-- Message input -->
      <div class="p-2 sm:p-4 border-t">
        <!-- Attached files preview -->
        <div v-if="newMessage.files.length" class="mb-3">
          <div class="flex flex-wrap gap-2">
            <div
              v-for="(file, index) in newMessage.files"
              :key="index"
              class="badge badge-neutral gap-2"
            >
              <span class="truncate max-w-[200px]">{{ file.name }}</span>
              <button
                @click="removeFile(index)"
                class="btn btn-ghost btn-xs btn-circle"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <textarea
            v-model="newMessage.text"
            @input="handleInput"
            placeholder="Type a message..."
            class="textarea textarea-bordered textarea-sm sm:textarea-md flex-1 min-h-[40px] sm:min-h-[45px] max-h-[120px] resize-y"
            rows="1"
            @keydown.enter.exact.prevent="newMessage.text += '\n'"
            @keydown.ctrl.enter.exact="sendMessage"
            @keydown.meta.enter.exact="sendMessage"
          ></textarea>
          <div class="flex flex-col gap-2">
            <label class="btn btn-neutral btn-sm sm:btn-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                @change="handleFileUpload"
                class="hidden"
              />
            </label>
            <button
              class="btn btn-primary btn-sm sm:btn-md"
              @click="sendMessage"
              :disabled="!pin || pin.length !== 4"
            >
              <span class="hidden sm:inline">ส่ง</span>
              <span class="sm:hidden">➤</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <UploadModal
      v-if="isUploading"
      :is-open="isUploading"
      :files="uploadingFiles"
      :file-progress="fileProgress"
      :file-status="fileStatus"
      :error="uploadError"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { db } from "../firebase";
import ChatMessages from "./ChatMessages.vue";
import { isImage } from '../utils/file-utils';

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { encryptMessage } from "../utils/encryption";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import UploadModal from "./UploadModal.vue";

import { setDoc, doc as firestoreDoc } from "firebase/firestore";
import { resizeImage } from '../utils/file-utils';


// refs สำหรับ upload
const isUploading = ref(false);
const uploadingFiles = ref([]);
const fileProgress = ref({});
const fileStatus = ref({});
const uploadError = ref(null);

// เพิ่ม import
import ImageViewerModal from "./ImageViewerModal.vue";

// เพิ่ม ref สำหรับเก็บ URL รูปที่เลือก
const selectedImages = ref([]);
const selectedImageIndex = ref(0);

const props = defineProps({
  currentUserId: {
    type: String,
    required: true,
  },
  pin: {
    type: String,
    required: true,
  },
});

// Refs
const messages = ref([]);
const newMessage = ref({
  text: "",
  files: [],
});
const storage = getStorage();
const uploadProgress = ref(0);
const isLoading = ref(false);
const isInitialLoading = ref(true);

// Add computed property to check if user has pending message
const hasPendingMessage = computed(() => {
  return (
    newMessage.value.text.trim() !== "" || newMessage.value.files.length > 0
  );
});

// Watch for changes in pending message status
watch(hasPendingMessage, async (isTyping) => {
  await updateTypingStatus(isTyping);
});

// Add method to update typing status
const updateTypingStatus = async (typing) => {
  if (!props.currentUserId) return;

  try {
    await setDoc(firestoreDoc(db, "typing_status", props.currentUserId), {
      isTyping: typing,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating typing status:", error);
  }
};

// Modify textarea v-model to watch for typing
// Update newMessage handling
const handleInput = (event) => {
  newMessage.value.text = event.target.value;
};

// Utility functions and methods
const getQueryLimit = () => {
  const params = new URLSearchParams(window.location.search);
  const queryLimit = parseInt(params.get("ql"));
  return !isNaN(queryLimit) && queryLimit > 0 ? queryLimit : 8;
};

const closeImageViewer = () => {
  selectedImages.value = [];
  selectedImageIndex.value = 0;
};


const uploadFile = async (file, index) => {
  if (!props.pin || props.pin.length !== 4) {
    throw new Error("กรุณาระบุ PIN ให้ถูกต้อง");
  }

  fileProgress.value[index] = 0;
  fileStatus.value[index] = "uploading";

  return new Promise((resolve, reject) => {
    const fileRef = storageRef(
      storage,
      `chat-files/${Date.now()}_${file.name}`
    );
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        fileProgress.value[index] = progress;
      },
      (error) => {
        console.error("Upload error:", error);
        fileStatus.value[index] = "error";
        reject(error);
      },
      async () => {
        try {
          const url = await getDownloadURL(fileRef);
          const encryptedUrl = encryptMessage(url, props.pin);
          fileStatus.value[index] = "completed";

          // เมื่ออัพโหลดเสร็จแล้วและเป็นไฟล์สุดท้าย ปิด modal
          const allCompleted = Object.values(fileStatus.value).every(
            (status) => status === "completed"
          );
          if (allCompleted) {
            isUploading.value = false;
          }

          resolve(encryptedUrl);
        } catch (error) {
          fileStatus.value[index] = "error";
          reject(error);
        }
      }
    );
  });
};

// Modify the handleFileUpload function
const handleFileUpload = async (event) => {
  try {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    isUploading.value = true;
    uploadingFiles.value = files;
    uploadError.value = null;

    // Process each file - resize images if needed
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        if (file.type.startsWith('image/')) {
          return await resizeImage(file);
        }
        return file;
      })
    );

    // Initialize progress and status for each file
    processedFiles.forEach((_, index) => {
      fileProgress.value[index] = 0;
      fileStatus.value[index] = "waiting";
    });

    // Upload processed files
    const uploadPromises = processedFiles.map((file, index) => uploadFile(file, index));
    const urls = await Promise.all(uploadPromises);

    // Add uploaded files to newMessage
    newMessage.value.files = [
      ...newMessage.value.files,
      ...processedFiles.map((file, index) => ({
        file,
        name: file.name,
        url: urls[index],
      })),
    ];
  } catch (error) {
    console.error("Error handling files:", error);
    uploadError.value = "เกิดข้อผิดพลาดในการอัพโหลดไฟล์";
  }
};



const removeFile = (index) => {
  newMessage.value.files = newMessage.value.files.filter((_, i) => i !== index);
};

const sendMessage = async () => {
  if (!hasPendingMessage.value) return;
  if (!props.pin || props.pin.length !== 4) {
    alert("Please enter a valid 4-digit PIN");
    return;
  }

  try {
    isLoading.value = true;
    const messageText = newMessage.value.text || " ";
    // ใช้ URLs ที่ได้จากการ upload แล้ว
    const attachedUrls = newMessage.value.files.map((file) => file.url);

    await addDoc(collection(db, "messages"), {
      send_user: props.currentUserId,
      message: encryptMessage(messageText, props.pin),
      send_date: serverTimestamp(),
      read_date: null,
      attached_documents: attachedUrls,
    });

    // Clear message and files after successful send
    newMessage.value = {
      text: "",
      files: [],
    };

    // Clear typing status
    await updateTypingStatus(false);
  } catch (error) {
    console.error("Error sending message:", error);
    alert("Error sending message. Please check your PIN and try again.");
  } finally {
    isLoading.value = false;
    uploadProgress.value = 0;
  }
};

// แก้ไขฟังก์ชัน handleImageSelect
const handleImageSelect = (urls, index) => {
  // กรองเอาเฉพาะ URL ที่เป็นรูปภาพ
  const imageUrls = urls.filter(url => isImage(url));
  
  // หา index ใหม่หลังจากกรองแล้ว
  const newIndex = imageUrls.indexOf(urls[index]);
  
  // ส่งข้อมูลไป ImageViewerModal เฉพาะรูปภาพ
  if (imageUrls.length > 0 && newIndex !== -1) {
    selectedImages.value = imageUrls;
    selectedImageIndex.value = newIndex;
  }
};

// Separate onMounted and onUnmounted
let unsubscribeMessages;

// Lifecycle hooks
onMounted(() => {
  const messageLimit = getQueryLimit();
  const q = query(
    collection(db, "messages"),
    orderBy("send_date", "desc"),
    limit(messageLimit)
  );

  unsubscribeMessages = onSnapshot(q, (snapshot) => {
    isInitialLoading.value = false;
    messages.value = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data, // เอาข้อมูลจาก database มาก่อน
          isDecrypted: false,
          decryptedText: "",
          decryptError: false,
          // ไม่ต้อง override attached_documents
        };
      })
      .reverse();
  });
});

onUnmounted(async () => {
  if (unsubscribeMessages) {
    unsubscribeMessages();
  }
  await updateTypingStatus(false);
});
</script>
