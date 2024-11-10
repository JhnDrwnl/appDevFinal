import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAE4txySzwhcxMKBCs7GVSpxPfNoS6GlmA",
    authDomain: "supreme-fc19a.firebaseapp.com",
    projectId: "supreme-fc19a",
    storageBucket: "supreme-fc19a.firebasestorage.app",
    messagingSenderId: "826952004781",
    appId: "1:826952004781:web:b8a12d1119491fea0bc224",
    measurementId: "G-JXH1K704LS"
  };
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
export { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };