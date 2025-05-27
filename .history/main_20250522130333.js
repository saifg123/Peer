
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent form from refreshing the page

  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User signed up:", user.email);
      localStorage.setItem("user", JSON.stringify(user));
      window.location.href = "app.html"; // Redirect to your app
    })
    .catch((error) => {
      console.error("Signup error:", error.message);
      alert("Signup failed: " + error.message);
    });
});
  

const firebaseConfig = {
  apiKey: "AIzaSyDgt47saNP2MY1CYZ9DKlMUIBvLODhbSoY",
  authDomain: "peer-a2a78.firebaseapp.com",
  projectId: "peer-a2a78",
  storageBucket: "peer-a2a78.firebasestorage.app",
  messagingSenderId: "366889068662",
  appId: "1:366889068662:web:ffa8754a3ce3330396d757",
  measurementId: "G-98GY2G56G4"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);


const provider = new GoogleAuthProvider();

document.getElementById("googleSignInBtn").addEventListener("click", () => {
    signInWithPopup(auth, provider) 
      .then((result) => {
        console.log("Signed in as:", result.user.displayName);
        localStorage.setItem("user",JSON.stringify(result.user));
        window.location.href = "app.html"
      })
      .catch((error) => {
        console.error("Google sign-in error:", error);
      });
  });

