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