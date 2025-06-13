// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvjyZwkwPj6k0p657C3lfj5JZY4kigvbU",
  authDomain: "b-tech-notes-e18ee.firebaseapp.com",
  projectId: "b-tech-notes-e18ee",
  storageBucket: "b-tech-notes-e18ee.appspot.com",
  messagingSenderId: "131972653185",
  appId: "1:131972653185:web:221a3d190ad178f5652d80",
  measurementId: "G-ZKT810SVM9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize analytics only in browser environments
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
export default app;
