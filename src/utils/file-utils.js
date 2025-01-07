// file-utils.js

export const extractFilenameFromUrl = (url) => {
    try {
      // แยก URL path ออกมา
      const pathname = new URL(url).pathname;
      // หาชื่อไฟล์จาก path โดยดูจากส่วนที่มี chat-files/
      const match = pathname.match(/chat-files%2F(.*?)(?:\?|$)/);
      if (match && match[1]) {
        // Decode URL-encoded filename
        return decodeURIComponent(match[1]);
      }
      return '';
    } catch (e) {
      console.error('Error parsing URL:', e);
      return '';
    }
  };
  
  export const isImage = (url) => {
    const filename = extractFilenameFromUrl(url);
    return /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(filename);
  };
  
  export const isVideo = (url) => {
    const filename = extractFilenameFromUrl(url);
    return /\.(mp4|webm|ogg|mov|m4v)$/i.test(filename);
  };
  
  export const getVideoType = (url) => {
    const filename = extractFilenameFromUrl(url);
    const ext = filename.split('.').pop().toLowerCase();
    const typeMap = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',
      'mov': 'video/quicktime',
      'm4v': 'video/mp4'
    };
    return typeMap[ext] || `video/${ext}`;
  };

  const LANDSCAPE_MAX_WIDTH = 1920;
  const LANDSCAPE_MAX_HEIGHT = 1080;
  const PORTRAIT_MAX_WIDTH = 1080;
  const PORTRAIT_MAX_HEIGHT = 1920;
  const QUALITY = 0.8;
  
  export const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }
  
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          // ตรวจสอบว่าเป็นภาพแนวตั้งหรือแนวนอน
          const isPortrait = img.height > img.width;
          const MAX_WIDTH = isPortrait ? PORTRAIT_MAX_WIDTH : LANDSCAPE_MAX_WIDTH;
          const MAX_HEIGHT = isPortrait ? PORTRAIT_MAX_HEIGHT : LANDSCAPE_MAX_HEIGHT;
  
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;
          
          // คำนวณอัตราส่วนการย่อขยาย
          const widthRatio = MAX_WIDTH / width;
          const heightRatio = MAX_HEIGHT / height;
          const scale = Math.min(widthRatio, heightRatio, 1);
  
          // คำนวณขนาดใหม่
          width = Math.round(width * scale);
          height = Math.round(height * scale);
  
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress image
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            
            // Create new file from blob
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            resolve(resizedFile);
          }, file.type, QUALITY);
        };
        img.onerror = () => {
          reject(new Error('Image loading failed'));
        };
      };
      reader.onerror = () => {
        reject(new Error('File reading failed'));
      };
    });
  };