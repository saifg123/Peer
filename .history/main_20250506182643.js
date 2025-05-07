import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider} from "firebase/auth"

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
const analytics = getAnalytics(app);

//ACTUAL SCRIPT START   

const provider = new GoogleAithProvider();
const googleSignInBtn = document.getElementById("googleSignInBtn");

googleSignInBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
    .then((result) => {
        const user = result.user;
        console.log("Signed in with Google as:", user.displayName, user.email);
        alert("Welcomem" + user.displayName);
    })
})
.catch((error) => {
    console.error("Google Sign-In error:", error.code, error.message);
    alert("Google Sign")
})