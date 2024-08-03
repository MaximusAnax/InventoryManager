// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1q2nAoLfwa0V221Zz0jyORlFH9_ioLAk",
  authDomain: "inventory-management-10820.firebaseapp.com",
  projectId: "inventory-management-10820",
  storageBucket: "inventory-management-10820.appspot.com",
  messagingSenderId: "130669568278",
  appId: "1:130669568278:web:327b198bbf7a7a443bf037",
  measurementId: "G-Q8E6REZS9L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app)

export {firestore}