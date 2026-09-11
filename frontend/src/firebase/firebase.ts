import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDlDbQYIX9JolK27GsEbFaoVUqNPXbmfuI",
  authDomain: "podsphere-ai.firebaseapp.com",
  projectId: "podsphere-ai",
  storageBucket: "podsphere-ai.firebasestorage.app",
  messagingSenderId: "134671742374",
  appId: "1:134671742374:web:241ba95e844f206d72cb67",
  measurementId: "G-XESFKFJGWF"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();