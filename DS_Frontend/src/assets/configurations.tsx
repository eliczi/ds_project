import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Your Firebase config here
const firebaseConfig = {

    apiKey: "AIzaSyA-1PSwVGZiwTo6LSNY7bzwMKG5LthG0iE",
  
    authDomain: "ds-project-55753.firebaseapp.com",
  
    databaseURL: "https://ds-project-55753-default-rtdb.europe-west1.firebasedatabase.app",
  
    projectId: "ds-project-55753",
  
    storageBucket: "ds-project-55753.firebasestorage.app",
  
    messagingSenderId: "40754659050",
  
    appId: "1:40754659050:web:c58166c2b340f5e3c82193"
  
  };
  
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
  export default db;