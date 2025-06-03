
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
