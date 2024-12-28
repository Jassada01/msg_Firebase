<template>
  <div class="fixed inset-0 flex flex-col bg-base-100">
    <!-- Header -->
    <header
      class="navbar bg-gradient-to-r from-base-100 to-base-200 shadow-lg rounded-box px-2 sm:px-4 lg:px-6 border-b border-base-300"
    >
      <!-- Logo and Status Section -->
      <div class="flex-1 flex items-center gap-4">
        <!-- Logo -->
        <div class="flex flex-col items-start gap-0">
          <span
            class="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight"
          >
            Jubx
          </span>
          <span class="text-[10px] text-base-content/50 -mt-1">v3.0.3</span>
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
        <span class="text-xs text-base-content/70 hidden sm:inline"
          >Security PIN:</span
        >
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
          <div
            class="absolute inset-y-0 right-2 flex items-center pointer-events-none"
          >
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

    <!-- Chat container -->
    <div
      class="flex-1 w-full max-w-[100%] sm:max-w-[640px] lg:max-w-[768px] xl:max-w-[1024px] mx-auto p-2 sm:p-4 overflow-hidden"
    >
      <div class="h-full rounded-lg shadow-xl flex flex-col">
        <!-- Chat messages -->
        <div
          class="flex-1 overflow-y-auto p-2 sm:p-4"
          style="max-height: calc(100vh - 200px)"
          ref="messageContainer"
        >
          <!-- Loading Animation -->
          <template v-if="isInitialLoading">
            <LoadingAnimation />
          </template>
          <div
            v-for="message in messages"
            :key="message.id"
            :class="[
              'chat',
              {
                'chat-end': message.send_user === currentUserId,
                'chat-start': message.send_user !== currentUserId,
              },
            ]"
          >
            <div class="chat-image avatar hidden sm:block">
              <div class="w-8 sm:w-10 rounded-full">
                <img
                  alt="avatar"
                  src="https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/loginBG_wqv.png"
                />
              </div>
            </div>
            <div class="chat-header text-xs sm:text-sm">
              {{ message.send_user === currentUserId ? "Me" : "You" }}
              <time class="text-xs opacity-50">{{
                formatTime(message.send_date)
              }}</time>
            </div>
            <div
              class="chat-bubble text-sm sm:text-base whitespace-pre-wrap cursor-pointer select-none text-left"
              :class="[
                { 'chat-bubble-primary': message.send_user === currentUserId },
                { 'shake-animation': message.decryptError },
              ]"
              @click="toggleMessageDecryption(message.id)"
              tabindex="0"
              @keyup.enter="toggleMessageDecryption(message.id)"
            >
              <template v-if="!message.isDecrypted">
                <div class="flex items-center gap-2">
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Click to decrypt</span>
                </div>
              </template>
              <template v-else>
                <template
                  v-for="(part, index) in detectAndConvertLinks(
                    message.decryptedText
                  )"
                  :key="index"
                >
                  <a
                    v-if="part.type === 'link'"
                    :href="part.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-info hover:underline"
                    @click.stop
                    >Link</a
                  >
                  <span v-else>{{ part.content }}</span>
                </template>
                <div
                  v-if="message.attached_documents?.length"
                  class="mt-2 space-y-2"
                >
                  <div
                    v-for="(doc, index) in message.attached_documents"
                    :key="doc.id"
                    class="attachment-container"
                  >
                    <!-- สำหรับรูปภาพ -->
                    <div v-if="isImage(doc.decryptedUrl)" class="relative">
                      <!-- Skeleton loading -->
                      <div
                        v-if="imageLoadingStates[doc.id]"
                        class="w-32 h-32 rounded-lg animate-pulse bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                      >
                        <svg
                          class="w-10 h-10 text-gray-300 dark:text-gray-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>

                      <!-- รูปภาพจริง -->
                      <img
                        :src="doc.decryptedUrl"
                        :alt="doc.filename || 'Attached image'"
                        class="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        @load="handleImageLoad(doc.id)"
                        @click="selectedImage = doc.decryptedUrl"
                        :class="{ hidden: imageLoadingStates[doc.id] }"
                      />
                    </div>

                    <!-- สำหรับวิดีโอ -->
                    <div v-else-if="isVideo(doc.decryptedUrl)" class="relative">
                      <video
                        controls
                        class="w-full max-w-sm rounded-lg"
                        preload="metadata"
                      >
                        <source
                          :src="doc.decryptedUrl"
                          :type="getVideoType(doc.decryptedUrl)"
                        />
                        Your browser does not support the video tag.
                      </video>
                    </div>

                    <!-- สำหรับไฟล์อื่นๆ -->
                    <div v-else>
                      <a
                        :href="doc.decryptedUrl"
                        target="_blank"
                        class="link link-primary flex items-center gap-1"
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
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                        {{ doc.filename || `Attachment ${index + 1}` }}
                      </a>
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <div
              v-if="message.send_user == currentUserId"
              class="chat-footer opacity-50 text-xs"
            >
              {{ formatReadStatus(message) }}
            </div>
          </div>
        </div>

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
              placeholder="Type a message"
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
    </div>
    <!-- เพิ่ม modal สำหรับแสดงรูปขนาดใหญ่ -->
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

    <!-- Loading Modal with Progress -->
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div
        class="bg-base-100 rounded-lg p-8 flex flex-col items-center gap-4 w-80"
      >
        <div
          class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"
        ></div>
        <p class="text-lg font-medium">Uploading...</p>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div
            class="bg-primary h-2.5 rounded-full transition-all duration-300"
            :style="{ width: `${uploadProgress}%` }"
          ></div>
        </div>
        <p class="text-sm text-gray-500">{{ uploadProgress }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 1. Update imports at the top of the file
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { db } from "../firebase";
import SessionTimer from "./SessionTimer.vue";
import LastLoginStatus from "./LastLoginStatus.vue";
import { useOnlineStatus } from "../composables/useOnlineStatus";
import LoadingAnimation from "./LoadingAnimation.vue";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  limit,
} from "firebase/firestore";

import { encryptMessage, decryptMessage } from "../utils/encryption";
import {
  extractFilenameFromUrl,
  isImage,
  isVideo,
  getVideoType,
} from "../utils/file-utils";

import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable, // เปลี่ยนจาก uploadBytes
  getDownloadURL,
} from "firebase/storage";

// Props
const props = defineProps({
  currentUserId: {
    type: String,
    required: true,
  },
  partnerUserId: {
    // เพิ่ม prop นี้
    type: String,
    required: true,
  },
});

// Refs
// เพิ่มการใช้งาน useOnlineStatus
const { updateOnlineStatus } = useOnlineStatus(props.currentUserId);
const messages = ref([]);
const messageContainer = ref(null);
const newMessage = ref({
  text: "",
  files: [],
});
const pin = ref("1234"); // Default PIN as in your example
const storage = getStorage();
// ... existing refs ...
const uploadProgress = ref(0);
const isLoading = ref(false);
// เพิ่ม ref สำหรับเก็บสถานะการถอดรหัส
const decryptedMessageIds = ref(new Set());

// เพิ่ม ref สำหรับ loading state
const isInitialLoading = ref(true);

// Add this function to get URL parameters
const getQueryLimit = () => {
  const params = new URLSearchParams(window.location.search);
  const queryLimit = parseInt(params.get("ql"));
  // Return custom limit if valid, otherwise return default 5
  return !isNaN(queryLimit) && queryLimit > 0 ? queryLimit : 8;
};

// เพิ่ม ref สำหรับรูปที่เลือก
const selectedImage = ref(null);
const partnerUserId = ref(props.partnerUserId); // ใส่ ID ของผู้ใช้อีกฝ่าย

// Methods
const handlePinInput = (event) => {
  // Only allow numbers and max 4 digits
  const value = event.target.value;
  if (/^\d*$/.test(value) && value.length <= 4) {
    pin.value = value;
  }
};
// เพิ่ม ref สำหรับเก็บสถานะการโหลดของรูปภาพ
const imageLoadingStates = ref({}); // เก็บสถานะการโหลดของแต่ละรูป

// เพิ่มฟังก์ชันสำหรับจัดการสถานะการโหลดรูปภาพ
const handleImageLoad = (docId) => {
  imageLoadingStates.value[docId] = false;
};

// ปรับปรุงฟังก์ชัน uploadFile
const uploadFile = async (file) => {
  if (!pin.value || pin.value.length !== 4) {
    throw new Error("Valid PIN required");
  }

  return new Promise((resolve, reject) => {
    const fileRef = storageRef(
      storage,
      `chat-files/${Date.now()}_${file.name}`
    );
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      "state_changed",
      // Progress callback
      (snapshot) => {
        uploadProgress.value = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
      },
      // Error callback
      (error) => {
        console.error("Upload error:", error);
        reject(error);
      },
      // Complete callback
      async () => {
        try {
          const url = await getDownloadURL(fileRef);
          const encryptedUrl = encryptMessage(url, pin.value);
          resolve(encryptedUrl);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};
// Update handleFileUpload function
const handleFileUpload = async (event) => {
  isLoading.value = true;
  try {
    newMessage.value.files = [
      ...newMessage.value.files,
      ...Array.from(event.target.files),
    ];
  } catch (error) {
    console.error("Error uploading files:", error);
    alert("Error uploading files. Please try again.");
  } finally {
    isLoading.value = false;
  }
};

const removeFile = (index) => {
  newMessage.value.files = newMessage.value.files.filter((_, i) => i !== index);
};

// Update sendMessage function
const sendMessage = async () => {
  // เปลี่ยนเงื่อนไขการตรวจสอบ - อนุญาตให้ส่งได้ถ้ามีไฟล์แนบแม้ไม่มีข้อความ
  if (!newMessage.value.text && !newMessage.value.files.length) return;
  if (!pin.value || pin.value.length !== 4) {
    alert("Please enter a valid 4-digit PIN");
    return;
  }

  try {
    // อัปโหลดไฟล์ทีละไฟล์เพื่อแสดง progress ที่ถูกต้อง
    const attachedUrls = [];
    for (const file of newMessage.value.files) {
      isLoading.value = true;
      uploadProgress.value = 0; // รีเซ็ต progress
      const url = await uploadFile(file);
      attachedUrls.push(url);
    }

    // เพิ่มเงื่อนไขสำหรับข้อความว่าง
    const messageText = newMessage.value.text || " "; // ใช้ space แทนข้อความว่าง

    await addDoc(collection(db, "messages"), {
      send_user: props.currentUserId,
      message: encryptMessage(messageText, pin.value),
      send_date: serverTimestamp(),
      read_date: null,
      attached_documents: attachedUrls,
    });

    newMessage.value = { text: "", files: [] };
    scrollToBottom();
  } catch (error) {
    console.error("Error sending message:", error);
    alert("Error sending message. Please check your PIN and try again.");
  } finally {
    isLoading.value = false;
    uploadProgress.value = 0;
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

const markAsRead = async (messageId) => {
  try {
    const messageRef = doc(db, "messages", messageId);
    await updateDoc(messageRef, {
      read_date: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
  }
};

const decryptedMessage = (encryptedText) => {
  if (!encryptedText) return "";
  if (!pin.value || pin.value.length !== 4) return "Enter PIN to view message";
  try {
    return decryptMessage(encryptedText, pin.value);
  } catch (error) {
    return "Unable to decrypt message (incorrect PIN)";
  }
};

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// First, add this utility function somewhere in your script section
const detectAndConvertLinks = (text) => {
  // Regular expression for detecting URLs
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

  // Split text into parts - URLs and non-URLs
  const parts = text.split(urlRegex);
  const matches = text.match(urlRegex) || [];

  // Combine parts with styled links
  let result = [];
  parts.forEach((part, index) => {
    if (matches.includes(part)) {
      // If part is a URL, wrap it in a styled link
      result.push({
        type: "link",
        content: part,
        url: part,
      });
    } else if (part) {
      // If part is regular text, keep it as is
      result.push({
        type: "text",
        content: part,
      });
    }
  });

  return result;
};

// Methods
// ปรับปรุงฟังก์ชัน toggleMessageDecryption
const toggleMessageDecryption = async (messageId) => {
  const message = messages.value.find((m) => m.id === messageId);
  const thisMSGsendingUser = message.send_user;
  console.log(message);
  if (!message) return;

  // ถ้าเคยถอดรหัสแล้ว ไม่ต้องทำอะไร
  if (decryptedMessageIds.value.has(messageId)) {
    return;
  }

  try {
    if (!pin.value || pin.value.length !== 4) {
      message.decryptError = true;
      setTimeout(() => {
        message.decryptError = false;
      }, 1000);
      return;
    }

    const decrypted = decryptMessage(message.message, pin.value);
    if (decrypted) {
      message.decryptedText = decrypted.trim() === " " ? "" : decrypted;
      message.isDecrypted = true;
      // เพิ่ม messageId เข้าไปใน Set
      decryptedMessageIds.value.add(messageId);

      // อัพเดท read_date
      const isFromOtherUser = thisMSGsendingUser !== props.currentUserId;
      const isUnread = message.read_date === null;

      if (isFromOtherUser && isUnread) {
        await markAsRead(messageId);
      }

      // ถอดรหัสไฟล์แนบ
      if (message.attached_documents && message.attached_documents.length > 0) {
        message.attached_documents = message.attached_documents.map(
          (doc, index) => {
            try {
              const decryptedUrl = decryptMessage(doc, pin.value);
              const docId = `${messageId}-${index}`;
              imageLoadingStates.value[docId] = true;
              return {
                id: docId,
                decryptedUrl,
                filename: extractFilenameFromUrl(decryptedUrl),
              };
            } catch (error) {
              console.error("Error decrypting attachment:", error);
              return {
                id: `${messageId}-${index}`,
                decryptedUrl: null,
                filename: "Decryption failed",
              };
            }
          }
        );
      }
    } else {
      message.decryptError = true;
      setTimeout(() => {
        message.decryptError = false;
      }, 1000);
    }
  } catch (error) {
    console.error("Decryption error:", error);
    message.decryptError = true;
    setTimeout(() => {
      message.decryptError = false;
    }, 1000);
  }
};

const formatReadStatus = (message) => {
  if (!message.read_date) {
    return "";
  }
  return `อ่านแล้ว ${formatTime(message.read_date)}`;
};

// 2. Updated onMounted section with cleanup
onMounted(() => {
  const messageLimit = getQueryLimit();
  const q = query(
    collection(db, "messages"),
    orderBy("send_date", "desc"),
    limit(messageLimit)
  );

  // Create unsubscribe function
  const unsubscribe = onSnapshot(q, (snapshot) => {
    isInitialLoading.value = false; // ปิด loading เมื่อโหลดข้อมูลเสร็จ
    messages.value = snapshot.docs
      .map((doc) => {
        const messageId = doc.id;
        const data = doc.data();

        // Check if message was previously decrypted
        const isDecrypted = decryptedMessageIds.value.has(messageId);
        let decryptedText = "";
        let decryptedAttachments = null;

        // Re-decrypt if previously decrypted
        if (isDecrypted && pin.value) {
          try {
            decryptedText = decryptMessage(data.message, pin.value);
            if (data.attached_documents) {
              decryptedAttachments = data.attached_documents.map(
                (doc, index) => {
                  try {
                    const decryptedUrl = decryptMessage(doc, pin.value);
                    return {
                      id: `${messageId}-${index}`,
                      decryptedUrl,
                      filename: extractFilenameFromUrl(decryptedUrl),
                    };
                  } catch (error) {
                    return {
                      id: `${messageId}-${index}`,
                      decryptedUrl: null,
                      filename: "Decryption failed",
                    };
                  }
                }
              );
            }
          } catch (error) {
            console.error("Error re-decrypting message:", error);
          }
        }

        return {
          id: messageId,
          ...data,
          isDecrypted,
          decryptedText: decryptedText || "",
          attached_documents:
            decryptedAttachments || data.attached_documents || [],
          decryptError: false,
        };
      })
      .reverse();

    scrollToBottom();
  });

  // Cleanup subscription when component unmounts
  onUnmounted(() => {
    unsubscribe();
  });
});
</script>

<style>
html,
body {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

.shake-animation {
  animation: shake 0.2s ease-in-out 0s 3;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* เพิ่ม style สำหรับ transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Optional: Add smooth transition for hover effects */
.input {
  transition: all 0.2s ease-in-out;
}
</style>
