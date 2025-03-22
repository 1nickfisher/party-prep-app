import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCVa9SG70yUA9V_z7aMNPWu_wYcmY0LgIQ",
  authDomain: "onyx-party.firebaseapp.com",
  projectId: "onyx-party",
  storageBucket: "onyx-party.firebasestorage.app",
  messagingSenderId: "817491067824",
  appId: "1:817491067824:web:c2e1303c1673bc77b0cc75",
  measurementId: "G-694CB16P2G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth, analytics }; 