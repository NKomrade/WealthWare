// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyA57-V-nLcWKjhea-Bi56qSeAvP8sofhXI",
  authDomain: "wealth-ware-login.firebaseapp.com",
  projectId: "wealth-ware-login",
  storageBucket: "wealth-ware-login.appspot.com",
  messagingSenderId: "521106456764",
  appId: "1:521106456764:web:a13ea51e406038910a90b9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); 

export { auth, db, storage }; 