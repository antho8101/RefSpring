
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration Firebase avec des valeurs par défaut pour le développement
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

console.log('🔥 Firebase config loaded with fallback values');

// Éviter la double initialisation de Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
