
// Firebase configuration
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXH7JgXIWzi9RiG-PG6Vrh9P8xtNxwqeI",
  authDomain: "vikas-fabrication-app.firebaseapp.com",
  projectId: "vikas-fabrication-app",
  storageBucket: "vikas-fabrication-app.appspot.com",
  messagingSenderId: "712567386453",
  appId: "1:712567386453:web:b4e3a21d3b6c56a3c0f377",
  measurementId: "G-8V3PY8S2MT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
