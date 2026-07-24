import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "rosy-radar-2s7sz",
  appId: "1:714301869483:web:89e0b951e25e89ff27d6ee",
  apiKey: "AIzaSyDOAX-GVIkwU5eIAg38n11fONGhWhQR4UA",
  authDomain: "rosy-radar-2s7sz.firebaseapp.com",
  storageBucket: "rosy-radar-2s7sz.firebasestorage.app",
  messagingSenderId: "714301869483",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, 'ai-studio-vanzline-c092a11a-7550-4744-8d2a-253ee415040d');
