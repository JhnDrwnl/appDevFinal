// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  sendEmailVerification,
  applyActionCode,
  isSignInWithEmailLink,
  signInWithEmailLink,
  confirmPasswordReset // Added this line
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAE4txySzwhcxMKBCs7GVSpxPfNoS6GlmA',
  authDomain: 'supreme-fc19a.firebaseapp.com',
  projectId: 'supreme-fc19a',
  storageBucket: 'supreme-fc19a.firebasestorage.app',
  messagingSenderId: '826952004781',
  appId: '1:826952004781:web:b8a12d1119491fea0bc224',
  measurementId: 'G-JXH1K704LS',
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  sendEmailVerification,
  applyActionCode,
  isSignInWithEmailLink,
  signInWithEmailLink,
  confirmPasswordReset // Added this line
};