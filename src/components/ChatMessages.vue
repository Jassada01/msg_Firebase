<!-- ChatMessages.vue -->
<template>
  <div
    class="flex-1 overflow-y-auto p-2 sm:p-4"
    style="max-height: calc(100vh - 200px)"
    ref="messageContainer"
  >
    <!-- Loading Animation -->
    <template v-if="isInitialLoading">
      <LoadingAnimation />
    </template>

    <!-- Messages with date separators -->
    <template v-for="(messageGroup, index) in groupedMessages" :key="index">
      <!-- Date Separator -->
      <div class="flex items-center justify-center my-4">
        <div
          class="bg-base-200 rounded-full px-4 py-1 text-xs text-base-content/70"
        >
          {{ formatDateSeparator(messageGroup.date) }}
        </div>
      </div>

      <!-- Messages for this date -->
      <div
        v-for="message in messageGroup.messages"
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
        <div
          class="chat-header text-xs sm:text-sm"
          v-if="
            shouldShowTime(
              message,
              messageGroup.messages,
              messageGroup.messages.indexOf(message)
            )
          "
        >
          {{ message.send_user === currentUserId ? "Me" : "You" }}
          <time class="text-xs opacity-50">
            {{ formatTime(message.send_date) }}
          </time>
        </div>

        <!-- อัพเดต class binding ใน chat-bubble -->
        <div
          class="chat-bubble text-sm sm:text-base whitespace-pre-wrap cursor-pointer select-none text-left"
          :class="[
            { 'chat-bubble-primary': message.send_user === currentUserId },
            { 'shake-animation': message.decryptError },
            { 'opacity-50': !message.isDecrypted && message.decryptError },
            { 'cursor-not-allowed': isDecrypting.has(message.id) },
          ]"
          @click="toggleMessageDecryption(message.id)"
          :tabindex="isMobile ? null : '0'"
          @keyup.enter="!isMobile && toggleMessageDecryption(message.id)"
        >
          <!-- เพิ่มสถานะ loading ระหว่าง decrypt -->
          <template v-if="isDecrypting.has(message.id)">
            <div class="flex items-center gap-2">
              <span class="loading loading-spinner loading-xs"></span>
              <span>Decrypting...</span>
            </div>
          </template>
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
                <!-- Image attachments -->
                <div v-if="isImage(doc.decryptedUrl)" class="relative">
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
                  <img
                    :src="doc.decryptedUrl"
                    :alt="doc.filename || 'Attached image'"
                    class="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    @load="handleImageLoad(doc.id)"
                    @click="
                      $emit(
                        'select-image',
                        message.attached_documents.map(
                          (doc) => doc.decryptedUrl
                        ),
                        index
                      )
                    "
                    :class="{ hidden: imageLoadingStates[doc.id] }"
                  />
                </div>

                <!-- Video attachments -->
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

                <!-- Other file attachments -->
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
    </template>
    <!-- Typing indicator -->
    <div v-if="isOtherUserTyping" class="chat chat-start">
      <div class="chat-bubble bg-base-200 min-h-0 p-2">
        <div class="flex gap-1 items-center">
          <div class="w-2 h-2 rounded-full bg-current animate-bounce"></div>
          <div
            class="w-2 h-2 rounded-full bg-current animate-bounce"
            style="animation-delay: 0.2s"
          ></div>
          <div
            class="w-2 h-2 rounded-full bg-current animate-bounce"
            style="animation-delay: 0.4s"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import LoadingAnimation from "./LoadingAnimation.vue";
import { isImage, isVideo, getVideoType } from "../utils/file-utils";
import { decryptMessage } from "../utils/encryption";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import {
  detectAndConvertLinks,
  formatTime,
  formatReadStatus,
} from "../utils/message-utils";

import { collection, query, onSnapshot } from "firebase/firestore";

// เพิ่ม reactive variable สำหรับเช็คว่าเป็น mobile หรือไม่
const isMobile = ref(false);

// เพิ่ม state ใหม่เพื่อเก็บข้อมูลที่ decrypt แล้ว
const decryptedMessages = ref(new Map());

const props = defineProps({
  messages: {
    type: Array,
    required: true,
  },
  currentUserId: {
    type: String,
    required: true,
  },
  pin: {
    type: String,
    required: true,
  },
  isInitialLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["select-image"]);
const messageContainer = ref(null);
const imageLoadingStates = ref({});
const decryptedMessageIds = ref(new Set());
// Add new ref for typing status
const typingUsers = ref({});

// เพิ่ม ref ใหม่เพื่อติดตามสถานะการ decrypt
const isDecrypting = ref(new Set());

// Computed property to check if someone is typing
const isOtherUserTyping = computed(() => {
  return Object.values(typingUsers.value).some((status) => status === true);
});

// Watch for changes in messages
watch(
  () => props.messages,
  (newMessages, oldMessages) => {
    // เช็คว่ามีข้อความใหม่เพิ่มเข้ามาไหม
    if (!oldMessages || newMessages.length > oldMessages.length) {
      nextTick(() => {
        scrollToBottom();
      });
    }
  },
  { deep: true }
);

// Watch for changes in typing status
watch(isOtherUserTyping, (newValue) => {
  if (newValue) {
    nextTick(() => {
      scrollToBottom();
    });
  }
});

// New date formatting function
const formatDateSeparator = (date) => {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Format date based on how recent it is
  if (messageDate.toDateString() === today.toDateString()) {
    return "วันนี้";
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return "เมื่อวาน";
  } else {
    // Format for older dates
    const options = { year: "numeric", month: "long", day: "numeric" };
    return messageDate.toLocaleDateString("th-TH", options);
  }
};

// Group messages by date
// แก้ computed property groupedMessages ให้ใช้ displayMessages
const groupedMessages = computed(() => {
  if (!displayMessages.value.length) return [];

  const groups = [];
  let currentDate = null;
  let currentGroup = null;

  displayMessages.value.forEach((message) => {
    const messageDate = new Date(
      message.send_date?.seconds * 1000 || Date.now()
    );
    const dateString = messageDate.toDateString();

    if (dateString !== currentDate) {
      currentDate = dateString;
      currentGroup = {
        date: messageDate,
        messages: [],
      };
      groups.push(currentGroup);
    }

    currentGroup.messages.push(message);
  });

  return groups;
});
const handleImageLoad = (docId) => {
  imageLoadingStates.value[docId] = false;
};

const extractFilenameFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.substring(pathname.lastIndexOf("/") + 1);
    return decodeURIComponent(filename);
  } catch (error) {
    console.error("Error extracting filename:", error);
    return "";
  }
};

const toggleMessageDecryption = async (messageId) => {
  if (isDecrypting.value.has(messageId)) {
    return;
  }

  const message = props.messages.find((m) => m.id === messageId);
  if (!message) return;

  try {
    isDecrypting.value.add(messageId);

    // ถ้าเคย decrypt แล้วให้ใช้ค่าเดิม
    if (decryptedMessages.value.has(messageId)) {
      return;
    }

    const decrypted = decryptMessage(message.message, props.pin);
    if (!decrypted) throw new Error("Decryption failed");

    // เก็บข้อมูลที่ decrypt แล้วใน local state แทนการแก้ไข prop
    decryptedMessages.value.set(messageId, {
      text: decrypted.trim() === " " ? "" : decrypted,
      isDecrypted: true,
      attachments: [], // จะเติมข้อมูล attachments ที่ decrypt แล้วที่หลัง
    });

    // Handle attachments
    if (message.attached_documents?.length) {
      const attachments = await Promise.all(
        message.attached_documents.map(async (doc, index) => {
          try {
            const decryptedUrl = decryptMessage(doc, props.pin);
            return {
              id: `${messageId}-${index}`,
              decryptedUrl,
              filename: extractFilenameFromUrl(decryptedUrl),
            };
          } catch (error) {
            console.error("Error decrypting attachment:", error);
            return {
              id: `${messageId}-${index}`,
              decryptedUrl: null,
              filename: "Decryption failed",
              error: error.message,
            };
          }
        })
      );

      // Update attachments in local state
      const messageData = decryptedMessages.value.get(messageId);
      messageData.attachments = attachments;
      decryptedMessages.value.set(messageId, messageData);
    }

    // Handle read status
    const isFromOtherUser = message.send_user !== props.currentUserId;
    const isUnread = message.read_date === null;
    if (isFromOtherUser && isUnread) {
      await markAsRead(messageId);
    }
  } catch (error) {
    console.error("Decryption error:", error);
    decryptedMessages.value.delete(messageId);
  } finally {
    isDecrypting.value.delete(messageId);
  }
};

// Computed property เพื่อรวมข้อมูลจาก props และ state
const displayMessages = computed(() => {
  return props.messages.map((message) => {
    const decryptedData = decryptedMessages.value.get(message.id);
    if (!decryptedData) return message;

    return {
      ...message,
      decryptedText: decryptedData.text,
      isDecrypted: decryptedData.isDecrypted,
      attached_documents: decryptedData.attachments,
    };
  });
});

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

const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

// Add this helper function
const shouldShowTime = (message, messages, currentIndex) => {
  if (currentIndex === 0) return true;

  const previousMessage = messages[currentIndex - 1];

  // Check if messages are from the same user
  if (previousMessage.send_user !== message.send_user) return true;

  // Convert timestamps to milliseconds
  const currentTime = message.send_date?.seconds * 1000 || Date.now();
  const previousTime = previousMessage.send_date?.seconds * 1000 || Date.now();

  // Check if difference is more than 3 minutes (180000 milliseconds)
  return currentTime - previousTime > 180000;
};

onMounted(() => {
  const checkMobile = () => {
    isMobile.value =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
  };

  // เช็คตอน mount และเมื่อ resize
  checkMobile();
  window.addEventListener("resize", checkMobile);

  scrollToBottom();
  // Add typing status listener
  const typingQuery = query(collection(db, "typing_status"));
  // Inside the onSnapshot callback, update this section:
  const unsubscribeTyping = onSnapshot(typingQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const userId = change.doc.id;
      if (userId !== props.currentUserId) {
        if (change.type === "removed") {
          delete typingUsers.value[userId];
        } else {
          const data = change.doc.data();
          const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
          const timestampSeconds = data.timestamp?.seconds || 0;

          // Check if timestamp is more than 1 minute old
          const isExpired = currentTime - timestampSeconds > 60;

          // Set typing status to false if expired, otherwise use the actual status
          typingUsers.value[userId] = isExpired ? false : data.isTyping;
        }
      }
    });
  });

  // Clean up listener on unmount
  onUnmounted(() => {
    window.removeEventListener("resize", checkMobile);
    unsubscribeTyping();
  });
});
</script>

<style scoped>
.shake-animation {
  animation: shake 0.2s ease-in-out 0s 3;
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

/* Styles for date separator */
.date-separator {
  position: relative;
  text-align: center;
  margin: 1rem 0;
}

.date-separator::before,
.date-separator::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background-color: rgba(var(--base-content), 0.1);
}

.date-separator::before {
  left: 0;
}

.date-separator::after {
  right: 0;
}

/* Message transitions */
.chat-message-enter-active,
.chat-message-leave-active {
  transition: all 0.3s ease;
}

.chat-message-enter-from,
.chat-message-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Image loading transition */
.image-fade-enter-active,
.image-fade-leave-active {
  transition: opacity 0.3s ease;
}

.image-fade-enter-from,
.image-fade-leave-to {
  opacity: 0;
}
</style>
