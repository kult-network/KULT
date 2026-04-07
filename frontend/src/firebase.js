import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
 
const firebaseConfig = {
  apiKey: "AIzaSyCu-UbJIIkHJpJVqA_zWZfPxyMdVm3JRcs",
  projectId: "kult-e9a2a",
  storageBucket: "kult-e9a2a.firebasestorage.app",
  messagingSenderId: "1080960407908",
  appId: "1:1080960407908:web:c85eb3b0d807cf21708271",
  authDomain: "kult-nine.vercel.app",
  measurementId: "G-9L1MNVBNJV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;