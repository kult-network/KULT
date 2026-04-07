import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCu-UbJIIkHJpJVqA_zWZfPxyMdVm3JRcs",
  authDomain: "kult-nine.vercel.app", // 🛰️ This must match your Vercel Proxy
  projectId: "kult-e9a2a",
  storageBucket: "kult-e9a2a.firebasestorage.app",
  messagingSenderId: "1080960407908",
  appId: "1:1080960407908:web:c85eb3b0d807cf21708271",
  measurementId: "G-9L1MNVBNJV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();

// 💡 This ensures the "Account Picker" always shows up on mobile
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;