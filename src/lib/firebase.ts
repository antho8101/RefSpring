
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAlHsC-w7Sx18XKJ6dIcxvqj-AUdqkjqSE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "refspring-8c3ac.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://refspring-8c3ac-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "refspring-8c3ac",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "refspring-8c3ac.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "519439687826",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:519439687826:web:c0644e224f4ca23b57864b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-QNK35Y7EE4"
};

// Validation en mode développement
if (import.meta.env.DEV) {
  console.log('🔥 Firebase config loaded:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    usingEnvVars: !!import.meta.env.VITE_FIREBASE_API_KEY
  });
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Analytics avec vérification de support
export const analytics = await (async () => {
  try {
    if (typeof window !== 'undefined' && firebaseConfig.measurementId && await isSupported()) {
      return getAnalytics(app);
    }
    return null;
  } catch (error) {
    console.warn('Analytics non disponible dans cet environnement');
    return null;
  }
})();

export default app;
