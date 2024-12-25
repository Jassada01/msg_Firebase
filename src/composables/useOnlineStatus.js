// composables/useOnlineStatus.js
import { onMounted, onBeforeUnmount } from 'vue'
import { db } from '../firebase'
import { doc, updateDoc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

export function useOnlineStatus(userId) {
  let updateInterval

  const updateOnlineStatus = async () => {
    if (!userId) return

    try {
      const userRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        // If user document doesn't exist, create it
        await setDoc(userRef, {
          lastLogin: serverTimestamp(),
          createdAt: serverTimestamp()
        })
      } else {
        // If exists, just update lastLogin
        await updateDoc(userRef, {
          lastLogin: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error updating online status:', error)
    }
  }

  const startOnlineUpdates = () => {
    // Update immediately when starting
    updateOnlineStatus()
    
    // Then update every minute
    updateInterval = setInterval(updateOnlineStatus, 60 * 1000)
    
    // Add window event listeners for better accuracy
    window.addEventListener('focus', updateOnlineStatus)
    window.addEventListener('online', updateOnlineStatus)
  }

  const stopOnlineUpdates = () => {
    if (updateInterval) {
      clearInterval(updateInterval)
    }
    window.removeEventListener('focus', updateOnlineStatus)
    window.removeEventListener('online', updateOnlineStatus)
  }

  onMounted(() => {
    startOnlineUpdates()
  })

  onBeforeUnmount(() => {
    stopOnlineUpdates()
  })

  return {
    updateOnlineStatus,
    startOnlineUpdates,
    stopOnlineUpdates
  }
}