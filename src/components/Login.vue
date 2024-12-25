<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-base-200 to-base-300 p-4">
    <div class="card w-full max-w-sm bg-base-100 shadow-2xl">
      <!-- Logo Section -->
      <div class="relative -mt-8 mx-auto">
        <div class="w-16 h-16 rounded-xl bg-primary flex items-center justify-center shadow-lg mt-8">
          <span class="text-3xl font-bold text-primary-content">J</span>
        </div>
      </div>

      <div class="card-body items-center text-center pt-4">
        <h2 class="card-title text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          Welcome
        </h2>
        <p class="text-base-content/70 text-sm mb-6">
          Enter your passcode to continue
        </p>

        <div class="form-control w-full">
          <div class="relative">
            <input
              type="password"
              v-model="passcode"
              placeholder="Enter passcode"
              class="input input-bordered w-full pr-10 font-mono tracking-widest text-center transition-all duration-200 ease-in-out hover:shadow-md focus:shadow-md focus:scale-[1.02]"
              @keyup.enter="handleLogin"
            />
            <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                class="w-5 h-5 text-base-content/50"
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

          <!-- Error Message with Animation -->
          <div 
            v-if="error" 
            class="text-error text-sm mt-3 flex items-center justify-center gap-2 animate-shake"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              class="w-4 h-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{{ error }}</span>
          </div>
        </div>

        <div class="card-actions mt-6 w-full">
          <button
            class="btn btn-primary w-full shadow-lg hover:shadow-xl transition-shadow duration-200 normal-case text-lg"
            @click="handleLogin"
            :disabled="!passcode"
          >
            <span class="mr-2">Login</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup>
import { ref } from "vue";
import md5 from "crypto-js/md5";

const emit = defineEmits(["login"]);
const passcode = ref("");
const error = ref("");

// MD5 hashes ของ passcode ที่ถูกต้อง
const VALID_PASSCODES = {
  "a4c48e64ed907534b9bcca1a53be9d74": { userId: "user1", partnerId: "user2" }, // MD5 ของ A
  "40c24943ae50c537151eaa63b399df43": { userId: "user2", partnerId: "user1" }, // MD5 ของ B
};

const handleLogin = () => {
  if (!passcode.value) {
    error.value = "Please enter passcode";
    return;
  }

  // สร้าง MD5 hash จาก passcode ที่ผู้ใช้ป้อน
  const hashedPasscode = md5(passcode.value).toString();

  // ตรวจสอบว่า hash ตรงกับที่เก็บไว้หรือไม่
  const userInfo = VALID_PASSCODES[hashedPasscode];
  if (userInfo) {
    // ส่งทั้ง userId และ partnerId
    emit("login", userInfo.userId, userInfo.partnerId);
  } else {
    error.value = "Invalid passcode";
    passcode.value = "";
  }
};
</script>

<style scoped>
.input[type="password"] {
  letter-spacing: 0.3em;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}
</style>
