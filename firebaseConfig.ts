// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDZbKEAaeNGtWzhXJ_4tmo_IJgLxHRXdAI",
  authDomain: "management-f84f9.firebaseapp.com",
  projectId: "management-f84f9",
  storageBucket: "management-f84f9.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Export Auth và Firestore để dùng trong app
export const auth = getAuth(app);
export const db = getFirestore(app);
