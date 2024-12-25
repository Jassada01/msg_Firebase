<template>
    <div class="text-sm opacity-50">
      expires in: {{ formatTime }}
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  
  const timeLeft = ref(0)
  let timerInterval;
  
  const updateTime = () => {
    const sessionStartTime = parseInt(localStorage.getItem('sessionStartTime'))
    if (!sessionStartTime) return
    
    const currentTime = Date.now()
    const sessionTimeout = 10 * 60 * 1000 // 10 minutes
    const remainingTime = sessionTimeout - (currentTime - sessionStartTime)
    
    timeLeft.value = Math.max(0, remainingTime)
  }
  
  const formatTime = computed(() => {
    const minutes = Math.floor(timeLeft.value / 60000)
    const seconds = Math.floor((timeLeft.value % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  })
  
  onMounted(() => {
    updateTime()
    timerInterval = setInterval(updateTime, 1000)
  })
  
  onBeforeUnmount(() => {
    if (timerInterval) {
      clearInterval(timerInterval)
    }
  })
  </script>