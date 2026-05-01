import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Converts a base64 string to a Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Checks if push notifications are supported and permitted
 */
export async function getPushStatus() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return 'unsupported';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  } else if (Notification.permission === 'denied') {
    return 'denied';
  } else {
    return 'prompt';
  }
}

/**
 * Registers the Service Worker and subscribes the user to Push
 */
export async function subscribeToPush() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push not supported in this browser');
    }

    if (Notification.permission === 'denied') {
      throw new Error('Notifications are blocked by browser permission');
    }

    // 1. Register Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    // Ensure the service worker is ready before subscribing
    await navigator.serviceWorker.ready;
    
    // Small extra safety delay for some browsers
    await new Promise(resolve => setTimeout(resolve, 100));

    // 2. Get VAPID public key from backend
    const { data: { publicKey } } = await axios.get(`${API_URL}/api/push/key`);
    console.log('[PUSH_SERVICE] Public Key Received:', publicKey);

    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    console.log('[PUSH_SERVICE] Converted Key Length:', applicationServerKey.length);

    // 3. Reuse existing subscription when possible (Brave/Chromium can throw
    // InvalidStateError if we try to subscribe again with an existing sub).
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
    }

    // 4. Send subscription to backend
    await axios.post(`${API_URL}/api/push/subscribe`, subscription);

    return true;
  } catch (error) {
    console.error('[PUSH_SERVICE] Error subscribing:', error);
    throw error;
  }
}

/**
 * Returns user push preference from backend.
 */
export async function getPushPreferences() {
  const { data } = await axios.get(`${API_URL}/api/push/preferences`);
  return data;
}

/**
 * Updates user push preference in backend.
 */
export async function updatePushPreferences(push_disabled) {
  const { data } = await axios.patch(`${API_URL}/api/push/preferences`, { push_disabled });
  return data;
}

/**
 * Unsubscribes from Push
 */
export async function unsubscribeFromPush() {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    // 1. Remove from backend
    await axios.post(`${API_URL}/api/push/unsubscribe`, subscription);

    // 2. Unsubscribe from browser
    await subscription.unsubscribe();

    return true;
  } catch (error) {
    console.error('[PUSH_SERVICE] Error unsubscribing:', error);
    throw error;
  }
}
