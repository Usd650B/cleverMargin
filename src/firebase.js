import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCkS7bkwmLDAB4OF3SyXOBUbws2ixUE09o",
  authDomain: "studio-5840185257-ab19c.firebaseapp.com",
  databaseURL: "https://studio-5840185257-ab19c-default-rtdb.firebaseio.com",
  projectId: "studio-5840185257-ab19c",
  storageBucket: "studio-5840185257-ab19c.firebasestorage.app",
  messagingSenderId: "824069388690",
  appId: "1:824069388690:web:85a7b579b8be1dfab7e94b",
  measurementId: "G-3SLJKPZ82Z"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

export { app, analytics, auth, db, storage, provider, firebaseConfig };
