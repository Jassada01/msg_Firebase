<template>
  <div class="flex items-center gap-2 text-sm">
    <div class="relative flex items-center">
      <div
        class="w-2 h-2 rounded-full"
        :class="isOnline ? 'bg-green-500' : 'bg-gray-400'"
      ></div>
      <span class="ml-2" v-if="lastLogin">
        {{ formatTime(lastLogin) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import moment from "moment";

// Props
const props = defineProps({
  otherUserId: {
    type: String,
    required: true,
  },
});

// Reactive references
const lastLogin = ref(null);
const isOnline = ref(false);

// Format time using moment.js
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = moment(timestamp.seconds * 1000);
  const now = moment();
  const diffMinutes = now.diff(date, "minutes");

  // ถ้าเวลาผ่านมาน้อยกว่า 1 นาที
  if (diffMinutes < 1) {
    return "เมื่อสักครู่";
  }
  // ถ้าเวลาผ่านมามากกว่า 1 นาที
  else {
    return date.fromNow(); // จะแสดงเป็น "x นาทีที่แล้ว", "x ชั่วโมงที่แล้ว", "x วันที่แล้ว" ฯลฯ
  }
};

// Lifecycle hooks
onMounted(() => {
  // Subscribe to user status changes
  const userRef = doc(db, "users", props.otherUserId);

  onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const userData = doc.data();
      lastLogin.value = userData.lastLogin;

      // Check if user is currently online (within last 5 minutes)
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

      isOnline.value =
        userData.lastLogin?.seconds * 1000 > fiveMinutesAgo.getTime();
    }
  });
});
</script>
