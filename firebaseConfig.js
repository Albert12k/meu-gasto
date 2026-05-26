import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
// Alteramos aqui para importar o inicializador de cache offline do Firestore
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native"; 

const firebaseConfig = {
  apiKey: "AIzaSyCOpzBVXGDhOfaWu0NfZMYMrDNDpiW9F80",
  authDomain: "gasto-facil-6ad23.firebaseapp.com",
  projectId: "gasto-facil-6ad23",
  storageBucket: "gasto-facil-6ad23.firebasestorage.app",
  messagingSenderId: "500919294042",
  appId: "1:500919294042:web:f1f3a007beb8d0ab43e063",
  measurementId: "G-P79T47W8R5"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// 1. Correção da Autenticação (Web vs Celular) para evitar tela branca
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// 2. Melhoria de Robustez: Inicializa o Firestore com Cache Offline Ativado
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager() // Funciona tanto no Chrome quanto no celular
  })
});

export { auth, db };