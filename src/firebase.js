import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Our Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "bc-library-catalog.firebaseapp.com",
  projectId: "bc-library-catalog",
  storageBucket: "bc-library-catalog.firebasestorage.app",
  messagingSenderId: "140596257352",
  appId: "1:140596257352:web:f74c058407986fd0816e7d",
  measurementId: "G-PXG53KNDT2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

// Google provider
export const googleProvider = new GoogleAuthProvider();

// Optional: Hint to show @bc.edu first
googleProvider.setCustomParameters({
  hd: "bc.edu",
  prompt: "select_account",
});
