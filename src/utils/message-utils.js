// message-utils.js

export const detectAndConvertLinks = (text) => {
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  const parts = text.split(urlRegex);
  const matches = text.match(urlRegex) || [];

  let result = [];
  parts.forEach((part, index) => {
    if (matches.includes(part)) {
      result.push({
        type: "link",
        content: part,
        url: part,
      });
    } else if (part) {
      result.push({
        type: "text",
        content: part,
      });
    }
  });

  return result;
};

export const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const formatReadStatus = (message) => {
  if (!message.read_date) {
    return "";
  }
  return `อ่านแล้ว ${formatTime(message.read_date)}`;
};
