import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCOpzBVXGDhOfaWu0NfZMYMrDNDpiW9F80",
  authDomain: "gasto-facil-6ad23.firebaseapp.com",
  projectId: "gasto-facil-6ad23",
  storageBucket: "gasto-facil-6ad23.firebasestorage.app",
  messagingSenderId: "500919294042",
  appId: "1:500919294042:web:f1f3a007beb8d0ab43e063",
  measurementId: "G-P79T47W8R5"
};

// 1. Inicializa o App
const app = initializeApp(firebaseConfig);

// 2. Exporta apenas o que funciona no Mobile (Auth e DB)
// REMOVA as linhas de Analytics que estavam aqui
export const auth = getAuth(app);
export const db = getFirestore(app);