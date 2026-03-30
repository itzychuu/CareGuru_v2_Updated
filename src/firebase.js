import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC8a9cbbsOfeW5Gto61KXJr-6k7uhToANs",
  authDomain: "careguru-updated.firebaseapp.com",
  projectId: "careguru-updated",
  storageBucket: "careguru-updated.firebasestorage.app",
  messagingSenderId: "1049838951999",
  appId: "1:1049838951999:web:5ba0b10ec1878e8582a28a",
  measurementId: "G-XD13CJ50KJ"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);