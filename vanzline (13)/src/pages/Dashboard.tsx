import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { cn } from '../lib/utils';
import { Calendar } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

const today = () => new Date().toISOString().slice(0, 10);
const diffDays = (a: string, b: string) => Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 864e5);
const fmtDate = (s: string) => { if (!s) return '—'; const d = new Date(s + 'T00:00:00'); return d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()] + ' ' + d.getFullYear(); };
const fmtFullDate = (s: string) => { if (!s) return ''; const d = new Date(s + 'T00:00:00'); return ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][d.getDay()] + ', ' + d.getDate() + ' ' + ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][d.getMonth()] + ' ' + d.getFullYear(); };

const HOLIDAYS = [
  // 2024
  {date:'2024-01-01',name:'Tahun Baru 2024 Masehi'}, {date:'2024-02-08',name:'Isra Mikraj Nabi Muhammad SAW'}, {date:'2024-02-10',name:'Tahun Baru Imlek 2575 Kongzili'}, {date:'2024-03-11',name:'Hari Suci Nyepi Tahun Baru Saka 1946'}, {date:'2024-03-29',name:'Wafat Isa Al Masih'}, {date:'2024-03-31',name:'Hari Paskah'}, {date:'2024-04-10',name:'Hari Raya Idul Fitri 1445 Hijriah'}, {date:'2024-04-11',name:'Hari Raya Idul Fitri 1445 Hijriah'}, {date:'2024-05-01',name:'Hari Buruh Internasional'}, {date:'2024-05-09',name:'Kenaikan Isa Al Masih'}, {date:'2024-05-23',name:'Hari Raya Waisak 2568 BE'}, {date:'2024-06-01',name:'Hari Lahir Pancasila'}, {date:'2024-06-17',name:'Hari Raya Idul Adha 1445 Hijriah'}, {date:'2024-07-07',name:'Tahun Baru Islam 1446 Hijriah'}, {date:'2024-08-17',name:'Hari Kemerdekaan Republik Indonesia'}, {date:'2024-09-16',name:'Maulid Nabi Muhammad SAW'}, {date:'2024-12-25',name:'Hari Raya Natal'},
  // 2025
  {date:'2025-01-01',name:'Tahun Baru 2025 Masehi'}, {date:'2025-01-27',name:'Isra Mikraj Nabi Muhammad SAW'}, {date:'2025-01-29',name:'Tahun Baru Imlek 2576 Kongzili'}, {date:'2025-03-29',name:'Hari Suci Nyepi (Tahun Baru Saka 1947)'}, {date:'2025-03-31',name:'Idul Fitri 1446 Hijriah'}, {date:'2025-04-01',name:'Idul Fitri 1446 Hijriah'}, {date:'2025-04-18',name:'Wafat Yesus Kristus'}, {date:'2025-04-20',name:'Kebangkitan Yesus Kristus (Paskah)'}, {date:'2025-05-01',name:'Hari Buruh Internasional'}, {date:'2025-05-12',name:'Hari Raya Waisak 2569 BE'}, {date:'2025-05-29',name:'Kenaikan Yesus Kristus'}, {date:'2025-06-01',name:'Hari Lahir Pancasila'}, {date:'2025-06-06',name:'Idul Adha 1446 Hijriah'}, {date:'2025-06-27',name:'Tahun Baru Islam 1447 Hijriah'}, {date:'2025-08-17',name:'Proklamasi Kemerdekaan RI'}, {date:'2025-09-05',name:'Maulid Nabi Muhammad SAW'}, {date:'2025-12-25',name:'Kelahiran Yesus Kristus (Natal)'},
  // 2026
  {date:'2026-01-01',name:'Tahun Baru 2026 Masehi'}, {date:'2026-01-16',name:'Isra Mikraj Nabi Muhammad SAW'}, {date:'2026-02-17',name:'Tahun Baru Imlek 2577 Kongzili'}, {date:'2026-03-18',name:'Hari Suci Nyepi (Tahun Baru Saka 1948)'}, {date:'2026-03-20',name:'Idul Fitri 1447 Hijriah'}, {date:'2026-03-21',name:'Idul Fitri 1447 Hijriah'}, {date:'2026-04-03',name:'Wafat Yesus Kristus'}, {date:'2026-04-05',name:'Kebangkitan Yesus Kristus (Paskah)'}, {date:'2026-05-01',name:'Hari Buruh Internasional'}, {date:'2026-05-14',name:'Kenaikan Yesus Kristus'}, {date:'2026-05-27',name:'Idul Adha 1447 Hijriah'}, {date:'2026-05-31',name:'Hari Raya Waisak 2570 BE'}, {date:'2026-06-01',name:'Hari Lahir Pancasila'}, {date:'2026-06-16',name:'Tahun Baru Islam 1448 Hijriah'}, {date:'2026-08-17',name:'Proklamasi Kemerdekaan RI'}, {date:'2026-08-25',name:'Maulid Nabi Muhammad SAW'}, {date:'2026-12-25',name:'Kelahiran Yesus Kristus (Natal)'},
  // Cuti Bersama 2024
  {date:'2024-02-09',name:'Cuti Bersama Tahun Baru Imlek'}, {date:'2024-03-12',name:'Cuti Bersama Hari Suci Nyepi'}, {date:'2024-04-08',name:'Cuti Bersama Idul Fitri'}, {date:'2024-04-09',name:'Cuti Bersama Idul Fitri'}, {date:'2024-04-12',name:'Cuti Bersama Idul Fitri'}, {date:'2024-04-15',name:'Cuti Bersama Idul Fitri'}, {date:'2024-05-10',name:'Cuti Bersama Kenaikan Isa Al Masih'}, {date:'2024-05-24',name:'Cuti Bersama Hari Raya Waisak'}, {date:'2024-06-18',name:'Cuti Bersama Idul Adha'}, {date:'2024-12-26',name:'Cuti Bersama Hari Raya Natal'},
  // Cuti Bersama 2025
  {date:'2025-01-28',name:'Cuti Bersama Tahun Baru Imlek'}, {date:'2025-03-28',name:'Cuti Bersama Hari Suci Nyepi'}, {date:'2025-04-02',name:'Cuti Bersama Idul Fitri'}, {date:'2025-04-03',name:'Cuti Bersama Idul Fitri'}, {date:'2025-04-04',name:'Cuti Bersama Idul Fitri'}, {date:'2025-04-07',name:'Cuti Bersama Idul Fitri'}, {date:'2025-05-13',name:'Cuti Bersama Hari Raya Waisak'}, {date:'2025-05-30',name:'Cuti Bersama Kenaikan Yesus Kristus'}, {date:'2025-06-09',name:'Cuti Bersama Idul Adha'}, {date:'2025-12-26',name:'Cuti Bersama Kelahiran Yesus Kristus'}
];

function CalendarWidget() {
  const [date, setDate] = useState(new Date());
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 is Sunday

  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  const handlePrev = () => setDate(new Date(year, month - 1, 1));
  const handleNext = () => setDate(new Date(year, month + 1, 1));

  const T = new Date().toISOString().slice(0,10);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={handlePrev} className="btn-ghost" style={{ padding: '4px 8px' }}>&lt;</button>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{monthNames[month]} {year}</div>
        <button onClick={handleNext} className="btn-ghost" style={{ padding: '4px 8px' }}>&gt;</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center', marginBottom: 8 }}>
        {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map((d, i) => (
          <div key={d} style={{ fontSize: 10, fontWeight: 700, color: i === 0 || i === 6 ? '#e11d48' : '#64748b' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {days.map((d, i) => {
          if (!d) return <div key={i}></div>;
          const currentIso = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const isToday = currentIso === T;
          const isWeekend = i % 7 === 0 || i % 7 === 6;
          const holiday = HOLIDAYS.find(h => h.date === currentIso);
          
          let bg = 'transparent';
          let color = '#334155';
          let border = '1px solid transparent';
          
          if (isToday) { bg = 'var(--v-from)'; color = '#fff'; }
          else if (holiday) { bg = '#ffe4e6'; color = '#e11d48'; border = '1px solid #fecdd3'; }
          else if (isWeekend) { color = '#e11d48'; }
          
          return (
            <div key={i} title={holiday ? holiday.name : ''} style={{
              height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: isToday || holiday ? 700 : 500, borderRadius: 8,
              background: bg, color: color, border: border, cursor: holiday ? 'help' : 'default'
            }}>
              {d}
            </div>
          )
        })}
      </div>
      {/* List holidays in this month */}
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {HOLIDAYS.filter(h => h.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`)).map(h => (
           <div key={h.date} style={{ fontSize: 10, color: '#e11d48', display: 'flex', gap: 6 }}>
             <div style={{ fontWeight: 700 }}>{parseInt(h.date.slice(-2))}</div>
             <div>{h.name}</div>
           </div>
        ))}
      </div>
    </div>
  )
}

function YoutubeWidget() {
  const [query, setQuery] = useState('');
  const { youtubeEmbedSrc, setYoutubeEmbedSrc } = useStore();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Check if direct URL
    let videoId = '';
    try {
      if (query.includes('youtu.be/')) {
        videoId = query.split('youtu.be/')[1].split('?')[0];
      } else if (query.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(query.split('?')[1]);
        videoId = urlParams.get('v') || '';
      } else if (query.length === 11 && !query.includes(' ')) {
        videoId = query; // might be video ID directly
      }
    } catch(err) {}
    
    if (videoId) {
      setErrorMsg('');
      setYoutubeEmbedSrc(`https://www.youtube.com/embed/${videoId}?autoplay=1`);
      setQuery('');
      return;
    }

    // Not a direct URL, so search
    setLoading(true);
    setErrorMsg('');
    setResults([]);
    try {
      let res;
      let endpoint = '/api/youtube?q=';
      
      if (window.location.hostname.includes('netlify.app')) {
         endpoint = '/.netlify/functions/youtube?q=';
      }
      
      // Jika mode offline, API /api/youtube pasti gagal karena menggunakan port lain atau URL file://
      if (window.location.protocol === 'file:') {
         throw new Error('offline');
      }
      
      res = await fetch(endpoint + encodeURIComponent(query));
      
      if (!res.ok) {
         throw new Error('Fetch failed');
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setResults(data);
      } else {
        setErrorMsg('Tidak ditemukan video.');
      }
    } catch(e: any) {
      console.error(e);
      if (window.location.protocol === 'file:') {
         setErrorMsg('Fitur pencarian hanyak aktif saat online dengan backend. Untuk OFFLINE, mohon copy dan paste langsung URL/Link video (contoh: https://youtube.com/watch?v=...).');
      } else {
         setErrorMsg('Pencarian gagal. Mohon pastikan aplikasi di-deploy melalui GitHub (bukan drag & drop folder) agar API Pencarian berfungsi, atau paste langsung Link/URL YouTube ke kolom pencarian.');
      }
    }
    setLoading(false);
  };

  const handlePlay = (id: string) => {
    const index = results.findIndex((r) => r.id === id);
    let url = `https://www.youtube.com/embed/${id}?autoplay=1`;
    
    // Add next videos to playlist so it plays continuously
    if (index !== -1 && index < results.length - 1) {
      const nextIds = results.slice(index + 1).map((r) => r.id).join(',');
      url += `&playlist=${nextIds}`;
    }
    
    setYoutubeEmbedSrc(url);
  };
  
  const handleNextVideo = () => {
    if (!youtubeEmbedSrc) return;
    const match = youtubeEmbedSrc.match(/embed\/([^?]+)/);
    if (match && results.length > 0) {
       const currentId = match[1];
       const idx = results.findIndex(r => r.id === currentId);
       if (idx !== -1 && idx < results.length - 1) {
          handlePlay(results[idx + 1].id);
       } else {
          handlePlay(results[0].id); // loop back
       }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 600 }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input type="text" className="form-input" placeholder="Cari / Paste Link YouTube..." value={query || ''} onChange={e => setQuery(e.target.value)} />
        <button type="submit" className="btn-primary" style={{ padding: '0 12px', borderRadius: 12, fontSize: 12 }}>Cari</button>
        
      </form>
      
      {youtubeEmbedSrc ? (
        <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', background: '#000', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#1e293b', color: 'white', alignItems: 'center' }}>
             <div style={{ fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
               <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 2s infinite' }}></div>
               Sedang Diputar
             </div>
             <div style={{ display: 'flex', gap: 8 }}>
               <button type="button" onClick={handleNextVideo} style={{ background: '#3b82f6', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 'bold' }}>Next Lagu &gt;&gt;</button>
               <button type="button" onClick={() => setYoutubeEmbedSrc(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px 8px' }}>Tutup</button>
             </div>
           </div>
          <iframe src={youtubeEmbedSrc} width="100%" height="100%" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', borderRadius: 12, padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>Mencari video...</div>
          ) : results.length > 0 ? (
            results.map((vid) => (
              <div key={vid.id} style={{ display: 'flex', gap: 12, padding: 8, background: '#fff', borderRadius: 8, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} onClick={() => handlePlay(vid.id)}>
                <div style={{ width: 120, height: 68, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#000' }}>
                  <img src={vid.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{vid.title}</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>{vid.channel}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{vid.viewCount}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: 20, textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 32 }}>🔍</div>
              <div>Ketik kata kunci pencarian lagu/video, atau paste Link/URL YouTube.</div>
              {errorMsg && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4, whiteSpace: 'pre-wrap', textAlign: 'center' }}>{errorMsg}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function Dashboard() {
  const { tasks, progress, materials, personnel, theme, logo, appName, appCaption } = useStore();
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<any>(null);
  const T = today();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [locationName, setLocationName] = useState('Jakarta, ID');

  useEffect(() => {
    const fetchWeather = (lat: number, lon: number) => {
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day`)
        .then(res => res.json())
        .then(data => setWeather(data.current))
        .catch(() => setWeather({ temperature_2m: 29, apparent_temperature: 31, relative_humidity_2m: 72, wind_speed_10m: 12, weather_code: 2, is_day: 1 }));
      
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Lokasi';
            const country = data.address.country_code ? data.address.country_code.toUpperCase() : 'ID';
            setLocationName(`${city}, ${country}`);
          }
        })
        .catch(() => {});
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(-6.2088, 106.8456)
      );
    } else {
      fetchWeather(-6.2088, 106.8456);
    }
  }, []);

  const total = tasks.length;
  const onP = tasks.filter(t => t.status === 'on_progress').length;
  const done = tasks.filter(t => t.status === 'selesai').length;
  const late = tasks.filter(t => t.status === 'tertunda').length;
  const avg = total ? Math.round(tasks.reduce((s,t) => s + t.actualProgress, 0) / total) : 0;
  const pTotal = personnel.length;
  const hadir = personnel.filter(p => p.statusToday === 'hadir').length;
  const mPend = materials.filter(m => ['draft','pending','approved','ordered'].includes(m.status)).length;
  
  const h = time.getHours();
  const greeting = h<11?'Selamat pagi':h<15?'Selamat siang':h<18?'Selamat sore':'Selamat malam';
  const upcoming = HOLIDAYS.filter(h => diffDays(T, h.date) >= 0).slice(0, 3);

  // 3D Logo Logic
  const logoRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef({ rx: 0, ry: 0 });
  const [dragging, setDragging] = useState(false);
  const prevRef = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    let animationFrameId: number;
    let localRx = rotationRef.current.rx; let localRy = rotationRef.current.ry;
    
    const autoRotate = () => {
      if (!dragging) {
        localRy += 0.15;
        localRx = Math.sin(Date.now() / 1400) * 8;
        rotationRef.current = { rx: localRx, ry: localRy };
        if (logoRef.current) logoRef.current.style.transform = `rotateX(${localRx}deg) rotateY(${localRy}deg)`;
      }
      animationFrameId = requestAnimationFrame(autoRotate);
    };
    
    if (!dragging) {
      autoRotate();
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [dragging]); // Removed rotation dependency to fix jitter

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    rotationRef.current = {
      ry: rotationRef.current.ry + e.movementX * 0.6,
      rx: Math.max(-45, Math.min(45, rotationRef.current.rx - e.movementY * 0.4))
    };
    if (logoRef.current) logoRef.current.style.transform = `rotateX(${rotationRef.current.rx}deg) rotateY(${rotationRef.current.ry}deg)`;
  };

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  const getEmoji = (code: number, isDay: boolean) => {
    const map: Record<number, any> = {0:{emoji:'☀️',ne:'🌙'},1:{emoji:'🌤️',ne:'🌙'},2:{emoji:'⛅'},3:{emoji:'☁️'},61:{emoji:'🌦️'},63:{emoji:'🌧️'},95:{emoji:'⛈️'}};
    const m = map[code] || {emoji:'🌡️'};
    return !isDay && m.ne ? m.ne : m.emoji;
  };
  
  const getDesc = (code: number, isDay: boolean) => {
    const map: Record<number, any> = {0:{d:'Cerah',n:'Cerah berbulan'},1:{d:'Cerah berawan',n:'Sedikit berawan'},2:{d:'Berawan sebagian'},3:{d:'Berawan'},61:{d:'Hujan ringan'},63:{d:'Hujan'},95:{d:'Badai petir'}};
    const m = map[code] || {d:'Tidak diketahui'};
    return !isDay && m.n ? m.n : m.d;
  };

  const donutData = {
    labels: ['On Progress','Selesai','Tertunda'],
    datasets: [{ data: [onP, done, late], backgroundColor: ['#38bdf8','#34d399','#fbbf24'], borderWidth: 0, borderRadius: 4, spacing: 3 }]
  };

  const counts = {hadir:0,ijin:0,sakit:0,absen:0,cuti:0};
  personnel.forEach(p => { counts[p.statusToday as keyof typeof counts] = (counts[p.statusToday as keyof typeof counts]||0) + 1; });
  const barData = {
    labels: ['Hadir','Ijin','Sakit','Absen','Cuti'],
    datasets: [{ data: [counts.hadir, counts.ijin, counts.sakit, counts.absen, counts.cuti], backgroundColor: ['#10b981','#0ea5e9','#f59e0b','#ef4444','#8b5cf6'], borderRadius: 8, borderSkipped: false }]
  };

  return (
    <div className="page active">
      <div className="page-head">
        <div className="page-head-left">
          <div className="page-head-icon" style={{background:'transparent',boxShadow:'none',border:'none'}}></div>
          <div><h1>{greeting}, kembali ke <span className="v-grad-text">{appName}</span></h1>
          <p>{appCaption || 'Ringkasan proyek, cuaca, dan aktivitas tim hari ini.'}</p></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '24px', marginBottom: 24 }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 650, padding: 20 }}>
            <div className="flex-between mb-4"><h3>YouTube Player</h3></div>
            <YoutubeWidget />
          </div>
          
          <div className="weather-card" style={{display:'flex',flexDirection:'column',color:'#fff'}}>
            {weather ? (
              <div style={{position:'relative',zIndex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div>
                    <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.2em',opacity:0.8}}>Cuaca Hari Ini</div>
                    <div style={{fontSize:12,fontWeight:600,opacity:0.9}}>📍 {locationName}</div>
                  </div>
                  <div className="w-emoji">{getEmoji(weather.weather_code, weather.is_day === 1)}</div>
                </div>
                <div style={{marginTop:12,display:'flex',alignItems:'baseline',gap:8}}>
                  <div className="w-temp">{Math.round(weather.temperature_2m)}&deg;</div>
                  <div className="w-desc">{getDesc(weather.weather_code, weather.is_day === 1)}</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginTop:16}}>
                  <div className="w-stat"><div className="lbl">Terasa</div><div className="val">{Math.round(weather.apparent_temperature)}&deg;</div></div>
                  <div className="w-stat"><div className="lbl">Lembab</div><div className="val">{weather.relative_humidity_2m}%</div></div>
                  <div className="w-stat"><div className="lbl">Angin</div><div className="val">{Math.round(weather.wind_speed_10m)} km/h</div></div>
                </div>
              </div>
            ) : (
              <div style={{display:'grid',placeItems:'center',height:'100%'}}>
                <div className="animate-spin" style={{width:28,height:28,border:'3px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%'}}></div>
                <div style={{fontSize:11,marginTop:8,opacity:0.7}}>Memuat cuaca...</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{position:'relative',overflow:'hidden',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'30px 20px'}}>
            <div className="logo-3d-wrap" style={{width:200,height:200}}>
              <div className="logo-halo"></div>
              <div 
                className="logo-3d" 
                ref={logoRef}
                style={{transform: `rotateX(15deg) rotateY(-25deg)`, cursor: dragging ? 'grabbing' : 'grab'}}
                onMouseDown={handleMouseDown}
              >
                <div className="logo-3d-plate"></div>
                <div className="logo-3d-glow"></div>
                <img src={logo || '/vanzline-logo.png'} alt="Vanzline" 
                  onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%23ecfeff' stroke='%2338bdf8' stroke-width='3'/><text x='50' y='60' text-anchor='middle' font-size='32' fill='%230e7490' font-weight='900'>V</text></svg>"; }} 
                />
                <div className="logo-3d-reflection">
                  <img src={logo || '/vanzline-logo.png'} alt="" 
                    onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%23ecfeff' stroke='%2338bdf8' stroke-width='3'/><text x='50' y='60' text-anchor='middle' font-size='32' fill='%230e7490' font-weight='900'>V</text></svg>"; }} 
                  />
                </div>
              </div>
            </div>
            <div style={{textAlign:'center',marginTop:16}}>
              <div style={{fontSize:20,fontWeight:900,letterSpacing:'-0.02em'}}><span className="v-grad-text">Vanz</span><span style={{color:'#1e293b'}}>line</span></div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase'}} className="v-text">Track your plan, follow the line</div>
            </div>
          </div>

          <div className="card" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1}}>
            <div className="clock-wrap">
             <svg className="clock-svg" viewBox="0 0 200 200">
               <defs>
                 <radialGradient id="cf" cx="50%" cy="40%" r="70%"><stop offset="0%" stopColor="#fff"/><stop offset="100%" stopColor="var(--v-soft)"/></radialGradient>
                 <linearGradient id="cr" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--v-from)"/><stop offset="100%" stopColor="var(--v-to)"/></linearGradient>
               </defs>
               <circle cx="100" cy="100" r="92" fill="url(#cf)" stroke="url(#cr)" strokeWidth="4"/>
               <circle cx="100" cy="100" r="82" fill="none" stroke="var(--v-ring)" strokeWidth="1" strokeDasharray="2 4" opacity="0.6"/>
               {[...Array(60)].map((_, i) => {
                 const a = (i*6-90)*Math.PI/180; const isH = i%5===0;
                 return <line key={i} x1={100+(isH?74:80)*Math.cos(a)} y1={100+(isH?74:80)*Math.sin(a)} x2={100+86*Math.cos(a)} y2={100+86*Math.sin(a)} stroke={isH?'var(--v-text)':'var(--v-ring)'} strokeWidth={isH?2:1} strokeLinecap="round"/>
               })}
               {[...Array(12)].map((_, i) => {
                 const n = i+1; const a = (n*30-90)*Math.PI/180;
                 return <text key={n} x={100+64*Math.cos(a)} y={100+64*Math.sin(a)+4} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--v-text)" style={{fontFamily:'system-ui'}}>{n}</text>
               })}
               <g transform={`rotate(${h%12 * 30 + time.getMinutes() * 0.5} 100 100)`}><line x1="100" y1="100" x2="100" y2="55" stroke="var(--v-text)" strokeWidth="5" strokeLinecap="round"/></g>
               <g transform={`rotate(${time.getMinutes() * 6 + time.getSeconds() * 0.1} 100 100)`}><line x1="100" y1="100" x2="100" y2="38" stroke="var(--v-from)" strokeWidth="3.5" strokeLinecap="round"/></g>
               <g transform={`rotate(${time.getSeconds() * 6} 100 100)`}><line x1="100" y1="110" x2="100" y2="30" stroke="var(--v-to)" strokeWidth="1.5" strokeLinecap="round"/><circle cx="100" cy="30" r="3" fill="var(--v-to)"/></g>
               <circle cx="100" cy="100" r="5" fill="url(#cr)"/><circle cx="100" cy="100" r="2" fill="#fff"/>
             </svg>
             <div className="clock-time">{time.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</div>
             <div className="clock-date">{fmtFullDate(T)}</div>
          </div>
        </div>
        </div>
      </div>

      <div className="grid-4 mb-4">
        <div className="card kpi">
          <div className="kpi-icon">📋</div><div className="kpi-val">{total}</div><div className="kpi-label">Total Tugas</div>
        </div>
        <div className="card kpi">
          <div className="kpi-icon">📈</div><div className="kpi-val">{avg}%</div><div className="kpi-label">Rata-rata Progress</div>
        </div>
        <div className="card kpi">
          <div className="kpi-icon">👥</div><div className="kpi-val">{hadir}/{pTotal}</div><div className="kpi-label">Personil Hadir</div>
        </div>
        <div className="card kpi">
          <div className="kpi-icon">📦</div><div className="kpi-val">{mPend}</div><div className="kpi-label">Material Aktif</div>
        </div>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="flex-between mb-4"><h3>Distribusi Status Tugas</h3></div>
          {total === 0 ? <div className="empty">Belum ada tugas</div> : (
            <div style={{display:'flex',gap:16,alignItems:'center'}}>
              <div style={{height:150,width:150,flexShrink:0}}>
                <Doughnut data={donutData} options={{ responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } }} />
              </div>
              <ul style={{flex:1,fontSize:12}}>
                <li style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{display:'flex',alignItems:'center'}}><span style={{display:'inline-block',width:10,height:10,borderRadius:'50%',background:'#38bdf8',marginRight:6}}></span>On Progress</span> <b>{onP}</b></li>
                <li style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{display:'flex',alignItems:'center'}}><span style={{display:'inline-block',width:10,height:10,borderRadius:'50%',background:'#34d399',marginRight:6}}></span>Selesai</span> <b>{done}</b></li>
                <li style={{display:'flex',justifyContent:'space-between'}}><span style={{display:'flex',alignItems:'center'}}><span style={{display:'inline-block',width:10,height:10,borderRadius:'50%',background:'#fbbf24',marginRight:6}}></span>Tertunda</span> <b>{late}</b></li>
              </ul>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex-between mb-4"><h3>Kehadiran Hari Ini</h3></div>
          {personnel.length === 0 ? <div className="empty">Belum ada personil</div> : (
            <div style={{height:180}}>
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, border: { display: false } }, y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } } } }} />
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="mb-4">Libur Nasional Terdekat</h3>
          <ul style={{display:'flex',flexDirection:'column',gap:8}}>
            {upcoming.map((h, i) => {
              const inDays = diffDays(T, h.date);
              return (
                <li key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',borderRadius:12,background:'var(--v-softer)',border:'1px solid var(--v-ring)'}}>
                  <div style={{fontSize:18}}>{h.name.includes('Cuti') ? '🏖️' : '🎌'}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#334155',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{h.name}</div>
                    <div style={{fontSize:10,color:'#94a3b8'}}>{fmtDate(h.date)}</div>
                  </div>
                  <span className="pill v-grad" style={{color:'#fff'}}>{inDays===0?'Hari ini':inDays+' hr'}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="grid-2 mt-4">
        <div className="card">
          <div className="flex-between mb-4"><h3>Log Progress Terbaru</h3></div>
          {progress.length === 0 ? <div className="empty">Belum ada log</div> : (
            <ul style={{display:'flex',flexDirection:'column',gap:8}}>
              {progress.slice(0,4).map((p, i) => (
                <li key={i} style={{display:'flex',gap:10,alignItems:'center',padding:8,background:'rgba(241,245,249,0.5)',borderRadius:12}}>
                  <div className="v-grad" style={{width:36,height:36,borderRadius:10,display:'grid',placeItems:'center',fontSize:11,fontWeight:900,color:'#fff'}}>{p.percent}%</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#334155',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.taskName}</div>
                    <div style={{fontSize:10,color:'#94a3b8'}}>{fmtDate(p.logDate)}{p.pic ? ' · ' + p.pic : ''}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="flex-between mb-4"><h3>Material Request Terbaru</h3></div>
          {materials.length === 0 ? <div className="empty">Belum ada material request</div> : (
            <ul style={{display:'flex',flexDirection:'column',gap:8}}>
              {materials.slice(0,4).map((m, i) => {
                const stMap: any = {draft:['bg-slate-100 text-slate-600','Draft'],pending:['bg-amber-100 text-amber-700','Pending'],approved:['bg-sky-100 text-sky-700','Disetujui'],ordered:['bg-indigo-100 text-indigo-700','Dipesan'],received:['bg-emerald-100 text-emerald-700','Diterima'],rejected:['bg-rose-100 text-rose-600','Ditolak']};
                const st = stMap[m.status] || stMap.draft;
                return (
                  <li key={i} style={{display:'flex',gap:10,alignItems:'center',padding:8,background:'rgba(241,245,249,0.5)',borderRadius:12}}>
                    <div style={{width:36,height:36,borderRadius:10,display:'grid',placeItems:'center',fontSize:18,background:'#fff',border:'1px solid #e2e8f0',overflow:'hidden'}}>
                      {m.photoBase64 ? <img src={m.photoBase64} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : '📦'}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:700,color:'#334155',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{m.itemName}</div>
                      <div style={{fontSize:10,color:'#94a3b8'}}>{m.projectName} · {m.qty} {m.unit}</div>
                    </div>
                    <span className={`pill ${st[0]}`}>{st[1]}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      <div className="grid-2 mt-4" style={{ gridTemplateColumns: '1fr' }}>
        <div className="card">
          <div className="flex-between mb-4"><h3>Kalender Bulan Ini</h3></div>
          <CalendarWidget />
        </div>
      </div>
    </div>
  );
}
