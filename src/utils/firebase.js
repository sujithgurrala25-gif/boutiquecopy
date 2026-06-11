import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Read Firebase configurations from Vite environment variables (or fall back to dummy/dev values)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy-api-key-for-development",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dhanvika-boutique.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dhanvika-boutique",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dhanvika-boutique.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:1234567890"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
