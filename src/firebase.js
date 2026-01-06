import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCa0MF38J0Zyjjn26mhFEqifzHKOM2r3lI",
  authDomain: "scaner-billing.firebaseapp.com",
  projectId: "scaner-billing",
  storageBucket: "scaner-billing.firebasestorage.app",
  messagingSenderId: "207862672282",
  appId: "1:207862672282:web:a1465f24b5c14e3a1ae823"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
