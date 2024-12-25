<template>
  <div class="app">
    <template v-if="isValidSession">
      <SimpleChat 
        :current-user-id="userId" 
        :partner-user-id="partnerUserId" 
      />
    </template>
    <template v-else>
      <Login @login="handleLogin" />
    </template>
  </div>
</template>

<script setup>
import SimpleChat from "./components/SimpleChat.vue";
import Login from "./components/Login.vue";
import { ref, onMounted, onBeforeUnmount } from "vue";

const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
const userId = ref(null);
const partnerUserId = ref(null);  // เพิ่ม ref สำหรับ partner
const isValidSession = ref(false);
let checkSessionInterval;

// แก้ไขฟังก์ชัน handleLogin รับ partnerId ด้วย
const handleLogin = (id, partnerId) => {
  userId.value = id;
  partnerUserId.value = partnerId;  // เก็บค่า partnerId
  // เก็บข้อมูล session ใน localStorage
  localStorage.setItem("sessionStartTime", Date.now().toString());
  localStorage.setItem("userId", id);
  localStorage.setItem("partnerId", partnerId);  // เก็บ partnerId ใน localStorage
  isValidSession.value = true;
};

const checkSession = () => {
  const sessionStartTime = localStorage.getItem("sessionStartTime");
  const storedUserId = localStorage.getItem("userId");
  const storedPartnerId = localStorage.getItem("partnerId");  // อ่าน partnerId

  if (!sessionStartTime || !storedUserId || !storedPartnerId) {  // เช็ค partnerId ด้วย
    logout();
    return;
  }

  const currentTime = Date.now();
  const sessionAge = currentTime - parseInt(sessionStartTime);

  if (sessionAge > SESSION_TIMEOUT) {
    logout();
    return;
  }

  userId.value = storedUserId;
  partnerUserId.value = storedPartnerId;  // กำหนดค่า partnerId
  isValidSession.value = true;
};

const logout = () => {
  localStorage.removeItem("sessionStartTime");
  localStorage.removeItem("userId");
  localStorage.removeItem("partnerId");  // ลบ partnerId
  userId.value = null;
  partnerUserId.value = null;  // รีเซ็ต partnerId
  isValidSession.value = false;
};

// ส่วนที่เหลือเหมือนเดิม
const startSessionCheck = () => {
  checkSessionInterval = setInterval(() => {
    checkSession();
  }, 60 * 1000);
};

onMounted(() => {
  checkSession();
  startSessionCheck();
});

onBeforeUnmount(() => {
  if (checkSessionInterval) {
    clearInterval(checkSessionInterval);
  }
});
</script>

<style>
.app {
  width: 100%;
  height: 100vh;
}
</style>