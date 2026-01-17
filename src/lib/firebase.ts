// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA7Hb6TXFdpbKG-z-JyFFwb633p0o5fw0I",
    authDomain: "center-of-the-centers.firebaseapp.com",
    projectId: "center-of-the-centers",
    storageBucket: "center-of-the-centers.firebasestorage.app",
    messagingSenderId: "567439027424",
    appId: "1:567439027424:web:6881a22bd7df4edc34f485",
    measurementId: "G-RFE1SLJXS5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);