
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration Firebase fixe (sans variables d'environnement pour test)
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

console.log('🔥 Firebase config DIRECT:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configuration Google Auth simple
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
