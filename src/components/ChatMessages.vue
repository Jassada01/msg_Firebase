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
                    @click="$emit('select-image', doc.decryptedUrl)"
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

// Computed property to check if someone is typing
const isOtherUserTyping = computed(() => {
  return Object.values(typingUsers.value).some((status) => status === true);
});

// Watch for changes in messages
watch(() => props.messages, (newMessages, oldMessages) => {
  // เช็คว่ามีข้อความใหม่เพิ่มเข้ามาไหม
  if (!oldMessages || newMessages.length > oldMessages.length) {
    nextTick(() => {
      scrollToBottom();
    });
  }
}, { deep: true });

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
const groupedMessages = computed(() => {
  if (!props.messages.length) return [];

  const groups = [];
  let currentDate = null;
  let currentGroup = null;

  props.messages.forEach((message) => {
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
  const message = props.messages.find((m) => m.id === messageId);
  const thisMSGsendingUser = message.send_user;
  if (!message) return;

  if (decryptedMessageIds.value.has(messageId)) {
    return;
  }

  try {
    if (!props.pin || props.pin.length !== 4) {
      message.decryptError = true;
      setTimeout(() => {
        message.decryptError = false;
      }, 1000);
      return;
    }

    const decrypted = decryptMessage(message.message, props.pin);
    console.log(message);
    if (decrypted) {
      message.decryptedText = decrypted.trim() === " " ? "" : decrypted;
      message.isDecrypted = true;
      decryptedMessageIds.value.add(messageId);

      const isFromOtherUser = thisMSGsendingUser !== props.currentUserId;
      const isUnread = message.read_date === null;

      if (isFromOtherUser && isUnread) {
        await markAsRead(messageId);
      }

      if (message.attached_documents?.length) {
        message.attached_documents = message.attached_documents.map(
          (doc, index) => {
            try {
              const decryptedUrl = decryptMessage(doc, props.pin);
              const docId = `${messageId}-${index}`;
              imageLoadingStates.value[docId] = true;
              console.log("Decrypted URL:", decryptedUrl); // เช็ค URL ที่ถอดรหัสได้
              console.log("Is Image:", isImage(decryptedUrl)); // เช็คว่า function isImage return อะไร

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

onMounted(() => {
  scrollToBottom();
  // Add typing status listener
  const typingQuery = query(collection(db, "typing_status"));
  const unsubscribeTyping = onSnapshot(typingQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const userId = change.doc.id;
      if (userId !== props.currentUserId) {
        if (change.type === "removed") {
          delete typingUsers.value[userId];
        } else {
          const data = change.doc.data();
          typingUsers.value[userId] = data.isTyping;
        }
      }
    });
  });

  // Clean up listener on unmount
  onUnmounted(() => {
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
