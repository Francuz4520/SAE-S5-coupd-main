import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCiMQX0w9x738U1bTYi75EaxncHe0BU_IY",
    authDomain: "saecoupdmain.firebaseapp.com",
    projectId: "saecoupdmain",
    storageBucket: "saecoupdmain.firebasestorage.app",
    messagingSenderId: "51236011687",
    appId: "1:51236011687:web:355ca4439aaf49f430a582"
};

// Initialisation unique
const app = initializeApp(firebaseConfig);

// Instances Firestore & Auth
export const db = getFirestore(app);
export const auth = getAuth();
