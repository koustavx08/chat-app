import CryptoJS from 'crypto-js';

// This is a simple end-to-end encryption implementation
// In a production app, you'd use a more robust solution with proper key exchange

// In a real E2E app, this key would be generated on the client and exchanged securely
// For demo purposes, we're using a fixed key - NEVER do this in production!
const SECRET_KEY = 'super-secret-key-that-should-be-unique-per-conversation';

export const encryptMessage = (message: string): string => {
  return CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
};

export const decryptMessage = (encryptedMessage: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Failed to decrypt message:', error);
    return 'Failed to decrypt message';
  }
};