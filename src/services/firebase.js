
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCa0MF38J0Zyjjn26mhFEqifzHKOM2r3lI",
  authDomain: "scaner-billing.firebaseapp.com",
  projectId: "scaner-billing",
  storageBucket: "scaner-billing.appspot.com",
  messagingSenderId: "207862672282",
  appId: "1:207862672282:web:a1465f24b5c14e3a1ae823"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
auth.useDeviceLanguage();

// Firestore (🔥 FIXED for mobile, localhost, scanner)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

// Storage (for images)
export const storage = getStorage(app);
