const fs = require('fs');
let code = fs.readFileSync('src/store/useStore.ts', 'utf8');

// We want to add Firebase sync.
// To do this safely, we can add a new function to useStore.ts
const insertPoint = code.indexOf('export const useStore = create');
const before = code.substring(0, insertPoint);
const after = code.substring(insertPoint);

const newCode = `
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

` + before + `

let isSyncing = false;
let isInitialized = false;

export const initFirebaseSync = () => {
  if (isInitialized) return;
  isInitialized = true;
  
  const docRef = doc(db, 'vanzline_data', 'main');
  
  // Listen to Firestore
  onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      isSyncing = true;
      const data = docSnap.data();
      useStore.setState({
        tasks: data.tasks || [],
        progress: data.progress || [],
        materials: data.materials || [],
        personnel: data.personnel || [],
        theme: data.theme || 'ocean',
        logo: data.logo || null,
        appName: data.appName || 'Vanzline',
        appCaption: data.appCaption || 'Ringkasan proyek, cuaca, dan aktivitas tim hari ini.'
      });
      isSyncing = false;
    } else {
      // Seed Firestore with initial data
      const state = useStore.getState();
      setDoc(docRef, {
        tasks: state.tasks,
        progress: state.progress,
        materials: state.materials,
        personnel: state.personnel,
        theme: state.theme,
        logo: state.logo,
        appName: state.appName,
        appCaption: state.appCaption
      });
    }
  });

  // Listen to local store changes and update Firestore
  useStore.subscribe((state, prevState) => {
    if (isSyncing) return;
    
    const changed = 
      state.tasks !== prevState.tasks ||
      state.progress !== prevState.progress ||
      state.materials !== prevState.materials ||
      state.personnel !== prevState.personnel ||
      state.theme !== prevState.theme ||
      state.logo !== prevState.logo ||
      state.appName !== prevState.appName ||
      state.appCaption !== prevState.appCaption;

    if (changed) {
      setDoc(docRef, {
        tasks: state.tasks,
        progress: state.progress,
        materials: state.materials,
        personnel: state.personnel,
        theme: state.theme,
        logo: state.logo,
        appName: state.appName,
        appCaption: state.appCaption
      }, { merge: true });
    }
  });
};

` + after;

fs.writeFileSync('src/store/useStore.ts', newCode);
