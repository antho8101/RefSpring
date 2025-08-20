
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// Configuration Firebase avec des valeurs par défaut pour le développement
const firebaseConfig = {
  apiKey: "AIzaSyAlHsC-w7Sx18XKJ6dIcxvqj-AUdqkjqSE",
  authDomain: "refspring-8c3ac.firebaseapp.com",
  databaseURL: "https://refspring-8c3ac-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "refspring-8c3ac",
  storageBucket: "refspring-8c3ac.firebasestorage.app",
  messagingSenderId: "519439687826",
  appId: "1:519439687826:web:c0644e224f4ca23b57864b",
  measurementId: "G-QNK35Y7EE4"
};

console.log('🔥 Firebase config loaded:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKeyPrefix: firebaseConfig.apiKey.substring(0, 10) + '...'
});

// Test de connexion Firebase
const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    const testUrl = `https://identitytoolkit.googleapis.com/v1/projects/${firebaseConfig.projectId}`;
    const response = await fetch(testUrl, { method: 'HEAD' });
    console.log('🔥 Firebase connection test:', response.status);
  } catch (error) {
    console.error('🚨 Firebase connection failed:', error);
  }
};

// Tester la connexion au démarrage
testFirebaseConnection();

// Éviter la double initialisation de Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
