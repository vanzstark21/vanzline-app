
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'ocean' | 'sunset' | 'forest' | 'royal' | 'blossom';

export const THEMES = [
  {key:'ocean',label:'Ocean Breeze',from:'#38bdf8',to:'#2dd4bf',soft:'#ecfeff',softer:'#f0fdfa',text:'#0e7490',ring:'#a5f3fc',bgA:'#f0f9ff',bgB:'#ecfeff',bgC:'#f0fdf4',emoji:''},
  {key:'sunset',label:'Sunset Glow',from:'#fb923c',to:'#f43f5e',soft:'#fff7ed',softer:'#fff1f2',text:'#c2410c',ring:'#fed7aa',bgA:'#fff7ed',bgB:'#fffbeb',bgC:'#fff1f2',emoji:'🌅'},
  {key:'forest',label:'Forest Mist',from:'#34d399',to:'#a3e635',soft:'#f0fdf4',softer:'#f7fee7',text:'#15803d',ring:'#bbf7d0',bgA:'#f0fdf4',bgB:'#ecfccb',bgC:'#f7fee7',emoji:'🌿'},
  {key:'royal',label:'Royal Indigo',from:'#818cf8',to:'#a78bfa',soft:'#eef2ff',softer:'#f5f3ff',text:'#4338ca',ring:'#c7d2fe',bgA:'#eef2ff',bgB:'#f5f3ff',bgC:'#faf5ff',emoji:'👑'},
  {key:'blossom',label:'Blossom Pink',from:'#f472b6',to:'#fb7185',soft:'#fdf2f8',softer:'#fff1f2',text:'#be185d',ring:'#fbcfe8',bgA:'#fdf2f8',bgB:'#fce7f3',bgC:'#fff1f2',emoji:'🌸'}
];

function applyTheme(t: any) {
  const r = document.documentElement.style;
  r.setProperty('--v-from', t.from); r.setProperty('--v-to', t.to);
  r.setProperty('--v-soft', t.soft); r.setProperty('--v-softer', t.softer);
  r.setProperty('--v-text', t.text); r.setProperty('--v-ring', t.ring);
  r.setProperty('--v-bg-a', t.bgA); r.setProperty('--v-bg-b', t.bgB); r.setProperty('--v-bg-c', t.bgC);
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const T = today();

const initialTasks = [
  {id:uid(),name:'Analisis Kebutuhan Sistem',startDate:addDays(T,-10),durationDays:5,deadline:addDays(T,-3),kendala:'',status:'selesai',actualProgress:100,actualStartDate:addDays(T,-10),createdAt:T},
  {id:uid(),name:'Desain UI/UX Dashboard',startDate:addDays(T,-6),durationDays:7,deadline:addDays(T,5),kendala:'Menunggu approval mockup',status:'on_progress',actualProgress:55,actualStartDate:addDays(T,-5),createdAt:T},
  {id:uid(),name:'Pengembangan API Backend',startDate:addDays(T,-3),durationDays:10,deadline:addDays(T,14),kendala:'',status:'on_progress',actualProgress:30,actualStartDate:addDays(T,-2),createdAt:T},
  {id:uid(),name:'Integrasi Payment Gateway',startDate:addDays(T,2),durationDays:6,deadline:addDays(T,12),kendala:'Menunggu kredensial sandbox',status:'tertunda',actualProgress:0,actualStartDate:null,createdAt:T},
  {id:uid(),name:'Pengujian & QA',startDate:addDays(T,7),durationDays:5,deadline:addDays(T,16),kendala:'',status:'on_progress',actualProgress:0,actualStartDate:null,createdAt:T},
];

const initialProgress = [
  {id:uid(),taskName:'Analisis Kebutuhan Sistem',percent:50,logDate:addDays(T,-9),pic:'Evan A.',note:'Wawancara stakeholder selesai'},
  {id:uid(),taskName:'Analisis Kebutuhan Sistem',percent:100,logDate:addDays(T,-5),pic:'Evan A.',note:'Dokumen SRS final'},
  {id:uid(),taskName:'Desain UI/UX Dashboard',percent:25,logDate:addDays(T,-4),pic:'Rina P.',note:'Wireframe low-fidelity'},
  {id:uid(),taskName:'Desain UI/UX Dashboard',percent:60,logDate:addDays(T,-1),pic:'Rina P.',note:'High-fidelity 8 layar'},
  {id:uid(),taskName:'Pengembangan API Backend',percent:15,logDate:addDays(T,-2),pic:'Dimas S.',note:'Setup repo & auth'},
  {id:uid(),taskName:'Pengembangan API Backend',percent:35,logDate:T,pic:'Dimas S.',note:'Endpoint tasks & progress'},
  {id:uid(),taskName:'Integrasi Payment Gateway',percent:0,logDate:T,pic:'Sari W.',note:'Menunggu kredensial'},
];

const initialMaterials = [
  {id:uid(),projectName:'Gedung A Lantai 3',itemName:'Kabel NYM 3x2.5mm',qty:250,unit:'meter',neededDate:addDays(T,5),priority:'high',status:'approved',notes:'Merek Supreme/Tranka, warna putih',photoBase64:null,createdAt:T},
  {id:uid(),projectName:'Gedung A Lantai 3',itemName:'MCB 2P 10A',qty:24,unit:'pcs',neededDate:addDays(T,5),priority:'normal',status:'ordered',notes:'Schneider/ABB',photoBase64:null,createdAt:T},
  {id:uid(),projectName:'Renovasi Kantor Pusat',itemName:'Cat Dinding Interior',qty:40,unit:'kg',neededDate:addDays(T,10),priority:'low',status:'pending',notes:'Warna putih tulang, anti jamur',photoBase64:null,createdAt:T},
  {id:uid(),projectName:'Proyek Jalan Sektor 7',itemName:'Pipa HDPE 4 inch',qty:120,unit:'meter',neededDate:addDays(T,3),priority:'urgent',status:'pending',notes:'PN10, saluran utama',photoBase64:null,createdAt:T},
  {id:uid(),projectName:'Gedung A Lantai 3',itemName:'Stop Kontak Inbow',qty:60,unit:'pcs',neededDate:addDays(T,7),priority:'normal',status:'received',notes:'',photoBase64:null,createdAt:T},
];

const initialPersonnel = [
  {id:uid(),fullName:'Evan Aldian',phone:'081234567890',email:'evan@vanzline.id',role:'Project Manager',statusToday:'hadir',notes:'Lead developer',createdAt:T},
  {id:uid(),fullName:'Rina Pratiwi',phone:'081298765432',email:'rina@vanzline.id',role:'UI/UX Designer',statusToday:'hadir',notes:'',createdAt:T},
  {id:uid(),fullName:'Dimas Saputra',phone:'081311122233',email:'dimas@vanzline.id',role:'Backend Engineer',statusToday:'hadir',notes:'',createdAt:T},
  {id:uid(),fullName:'Sari Wulandari',phone:'081344455566',email:'sari@vanzline.id',role:'Finance & Procurement',statusToday:'ijin',notes:'Keperluan keluarga',createdAt:T},
  {id:uid(),fullName:'Budi Santoso',phone:'081377788899',email:'budi@vanzline.id',role:'Site Supervisor',statusToday:'sakit',notes:'Demam, istirahat 2 hari',createdAt:T},
  {id:uid(),fullName:'Andi Firmansyah',phone:'081400011122',email:'andi@vanzline.id',role:'QA Engineer',statusToday:'hadir',notes:'',createdAt:T},
  {id:uid(),fullName:'Maya Anggraini',phone:'081433344455',email:'maya@vanzline.id',role:'Admin Proyek',statusToday:'cuti',notes:'Cuti tahunan s/d akhir minggu',createdAt:T},
  {id:uid(),fullName:'Rizky Hidayat',phone:'081466677788',email:'rizky@vanzline.id',role:'Teknisi Lapangan',statusToday:'hadir',notes:'',createdAt:T},
];

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  logo: string | null;
  setLogo: (logo: string | null) => void;
  appName: string;
  setAppName: (name: string) => void;
  appCaption: string;
  setAppCaption: (caption: string) => void;
  youtubeEmbedSrc: string | null;
  setYoutubeEmbedSrc: (src: string | null) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  
  tasks: any[];
  setTasks: (tasks: any[]) => void;
  progress: any[];
  setProgress: (progress: any[]) => void;
  materials: any[];
  setMaterials: (materials: any[]) => void;
  personnel: any[];
  setPersonnel: (personnel: any[]) => void;
}



let isSyncing = false;
let isInitialized = false;

export const initFirebaseSync = () => {
  if (isInitialized) return;
  isInitialized = true;
  
  const docRef = doc(db, 'vanzline_data', 'main');
  
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

export const useStore = create<AppState>()(
  persist(
    (set) => {
      // Apply initial theme immediately
      const initialTheme = THEMES[0];
      if (typeof document !== 'undefined') {
        applyTheme(initialTheme);
      }

      return {
        theme: 'ocean',
        setTheme: (theme) => {
          set({ theme });
          const t = THEMES.find(x => x.key === theme);
          if (t && typeof document !== 'undefined') {
            applyTheme(t);
          }
        },
        logo: null,
        setLogo: (logo) => set({ logo }),
        appName: 'Vanzline',
        setAppName: (appName) => set({ appName }),
        appCaption: 'Ringkasan proyek, cuaca, dan aktivitas tim hari ini.',
        setAppCaption: (appCaption) => set({ appCaption }),
        youtubeEmbedSrc: null,
        setYoutubeEmbedSrc: (youtubeEmbedSrc) => set({ youtubeEmbedSrc }),
        isSidebarOpen: true,
        toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
        setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
        
        tasks: initialTasks,
        setTasks: (tasks) => set({ tasks }),
        progress: initialProgress,
        setProgress: (progress) => set({ progress }),
        materials: initialMaterials,
        setMaterials: (materials) => set({ materials }),
        personnel: initialPersonnel,
        setPersonnel: (personnel) => set({ personnel }),
      };
    },
    {
      name: 'vanzline-storage',
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== 'undefined') {
          const t = THEMES.find(x => x.key === state.theme);
          if (t) applyTheme(t);
        }
      },
    }
  )
);

