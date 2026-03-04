import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyALv3SPKZx61W9ODS_Bdgd0LhU6KvlCxT8",
  authDomain: "bestfolio-id.firebaseapp.com",
  projectId: "bestfolio-id",
  storageBucket: "bestfolio-id.firebasestorage.app",
  messagingSenderId: "308743787960",
  appId: "1:308743787960:web:ea5de5c09d0ec47f676b4d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
