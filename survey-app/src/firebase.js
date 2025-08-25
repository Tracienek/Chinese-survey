import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCgYs_iFu0CqpOdS1spQOLL1mK5I7BHBBI",
  authDomain: "chinese-survey.firebaseapp.com",
  projectId: "chinese-survey",
  storageBucket: "chinese-survey.firebasestorage.app",
  messagingSenderId: "124708827553",
  appId: "1:124708827553:web:686d7ca08f04c310751be0",
  measurementId: "G-NFZCPLN05B",
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
