

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

//ACTUAL SCRIPT START   


const auth = getAuth();
const provider = new GoogleAuthProvider();

document.getElementById("googleSignInBtn").addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Signed in as:", result.user.displayName);
      // Redirect or update UI
    })
    .catch((error) => {
      console.error("Google sign-in error:", error);
    });
});
