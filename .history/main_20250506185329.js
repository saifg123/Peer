// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgt47saNP2MY1CYZ9DKlMUIBvLODhbSoY",
  authDomain: "peer-a2a78.firebaseapp.com",
  projectId: "peer-a2a78",
  storageBucket: "peer-a2a78.firebasestorage.app",
  messagingSenderId: "366889068662",
  appId: "1:366889068662:web:ffa8754a3ce3330396d757",
  measurementId: "G-98GY2G56G4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Use the initialized auth
const analytics = getAnalytics(app);

// Google Auth provider
const provider = new GoogleAuthProvider();

// Handle Google Sign-In button click
document.getElementById("googleSignInBtn").addEventListener("click", () => {
  sign
