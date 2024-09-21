// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA57-V-nLcWKjhea-Bi56qSeAvP8sofhXI",
  authDomain: "wealth-ware-login.firebaseapp.com",
  projectId: "wealth-ware-login",
  storageBucket: "wealth-ware-login.appspot.com",
  messagingSenderId: "521106456764",
  appId: "1:521106456764:web:a13ea51e406038910a90b9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db}; // Export storage