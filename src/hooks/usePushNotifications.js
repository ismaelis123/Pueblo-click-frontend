import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  };

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) { setIsSupported(false); return; }
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      if (permission !== 'granted') return;
      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) return;
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) });
      setSubscription(subscription);
      await api.post('/notifications/subscribe', { subscription: subscription.toJSON(), device: navigator.userAgent });
    } catch (error) { console.error('Error al suscribirse:', error); }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return;
    try {
      await subscription.unsubscribe();
      await api.post('/notifications/unsubscribe', { endpoint: subscription.endpoint });
      setSubscription(null);
    } catch (error) { console.error('Error al desuscribirse:', error); }
  };

  useEffect(() => { if (user && permission === 'granted') subscribeToPush(); }, [user]);

  return { permission, subscription, isSupported, subscribeToPush, unsubscribeFromPush };
};