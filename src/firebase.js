// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes} from "firebase/storage"

import "firebase/compat/auth"
import 'firebase/compat/firestore';
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9Bj2IMUro1H6VYneu4Rig7le9YJ2lxgw",
  authDomain: "dev-auth-8c9eb.firebaseapp.com",
  projectId: "dev-auth-8c9eb",
  storageBucket: "dev-auth-8c9eb.appspot.com",
  messagingSenderId: "915506470042",
  appId: "1:915506470042:web:86cd1df140e39ff276d323",
  measurementId: "G-C91N5PX0KK"
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)
export const firestore = getFirestore(app);
export const auth = getAuth(app);
// export const fire = firebase.initializeApp(firebaseConfig)

