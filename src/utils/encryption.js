import CryptoJS from "crypto-js";

export const encryptMessage = (text, pin) => {
  if (!pin || pin.length !== 4) {
    throw new Error("Invalid PIN: must be 4 digits");
  }
  return CryptoJS.AES.encrypt(text, pin).toString();
};

export const decryptMessage = (ciphertext, pin) => {
  if (!pin || pin.length !== 4) {
    throw new Error("Invalid PIN: must be 4 digits");
  }
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, pin);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      throw new Error("Incorrect PIN");
    }
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Decryption failed: incorrect PIN or invalid message");
  }
};