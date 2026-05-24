// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBSx7mmulY6ki5gW-_Yhj31jVQSlQuci2E",
  authDomain: "spendlens-50254.firebaseapp.com",
  projectId: "spendlens-50254",
  storageBucket: "spendlens-50254.firebasestorage.app",
  messagingSenderId: "483435504269",
  appId: "1:483435504269:web:9f81de8f89256f79a3b8c4",
  measurementId: "G-N9ZKPDM7RT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);