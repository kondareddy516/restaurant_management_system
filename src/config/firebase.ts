/**
 * Firebase Configuration & Initialization
 * This file initializes Firebase with all required services:
 * - Authentication (Firebase Auth)
 * - Database (Firestore)
 * - Storage (Firebase Storage)
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Firebase configuration from environment or hardcoded credentials
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyA7zy78TO_qV0QL0BZVV7GBytL7OUqjLyg",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "restaurant-e-comerce.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "restaurant-e-comerce",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "restaurant-e-comerce.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "555520472127",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:555520472127:web:2f7fed0decad122a92748a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TLW35VD3PV",
};

// Log Firebase API Key source (environment or hardcoded)
const apiKeySource = import.meta.env.VITE_FIREBASE_API_KEY
  ? "environment"
  : "hardcoded";
console.log(`[Firebase] Initialized with API Key from ${apiKeySource} source`);

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "[Firebase] Invalid configuration: Missing API Key or Project ID",
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set session persistence for authentication
try {
  setPersistence(auth, browserSessionPersistence).catch((error) => {
    console.warn("[Firebase] Failed to set session persistence:", error);
    // App will still work with default persistence
  });
} catch (error) {
  console.warn("[Firebase] Error setting persistence:", error);
}

// Enable emulators in development (optional, uncomment if needed)
// const isDev = import.meta.env.DEV;
// if (isDev) {
//   try {
//     connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
//     connectFirestoreEmulator(db, "localhost", 8080);
//     connectStorageEmulator(storage, "localhost", 9199);
//   } catch (error) {
//     // Emulators already connected
//   }
// }

export default app;
