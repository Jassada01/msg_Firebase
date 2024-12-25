import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIa_sQ8TnjGO72ra239qSbDn0mi5ptKp4",
  authDomain: "msgproject-6bb1b.firebaseapp.com",
  projectId: "msgproject-6bb1b",
  storageBucket: "msgproject-6bb1b.firebasestorage.app",
  messagingSenderId: "415306949299",
  appId: "1:415306949299:web:a51d0732bad68442a0c6c6"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
