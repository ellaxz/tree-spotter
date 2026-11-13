import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmmRe8nq2sxUutjUuHJuACidd_36wyikE",
  authDomain: "treespotter-ella.firebaseapp.com",
  projectId: "treespotter-ella",
  storageBucket: "treespotter-ella.firebasestorage.app",
  messagingSenderId: "955107629787",
  appId: "1:955107629787:web:35228946d2a6de67964afe",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
