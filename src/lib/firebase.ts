

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

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

// Initialize Firebase avec optimisations de performance
const app = initializeApp(firebaseConfig);

// Initialize Firebase services avec configuration optimisée
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configuration ultra-rapide pour Google Auth
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: undefined // Pas de restriction de domaine pour plus de rapidité
});

// Log optimisé en dev seulement
if (import.meta.env.DEV) {
  console.log('🔥 Firebase config OPTIMISÉ pour la vitesse:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    usingEnvVars: !!import.meta.env.VITE_FIREBASE_API_KEY
  });
}

// Analytics complètement désactivé pour éviter tout délai
console.log('⚡ Firebase optimisé pour vitesse maximale - Analytics désactivé');

export const getAnalyticsInstance = () => null;

export default app;

