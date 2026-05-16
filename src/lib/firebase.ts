import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

declare global {
  interface Window {
    __firebaseEmulatorConnected?: boolean;
  }
}

// Conexión al emulator suite solo en dev local.
if (
  typeof window !== 'undefined' &&
  !window.__firebaseEmulatorConnected &&
  process.env.NEXT_PUBLIC_USE_EMULATOR === 'true'
) {
  window.__firebaseEmulatorConnected = true;
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (!msg.includes('already called')) {
      console.error('Failed to connect to Firebase emulator:', error);
    }
  }
}
