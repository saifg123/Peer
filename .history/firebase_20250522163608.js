// Frontend use (runs in the browser)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgt47saNP2MY1CYZ9DKlMUIBvLODhbSoY",
  authDomain: "peer-a2a78.firebaseapp.com",
  databaseURL: "https://peer-a2a78-default-rtdb.firebaseio.com",
  projectId: "peer-a2a78",
  storageBucket: "peer-a2a78.firebasestorage.app",
  messagingSenderId: "366889068662",
  appId: "1:366889068662:web:ffa8754a3ce3330396d757",
  measurementId: "G-98GY2G56G4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
