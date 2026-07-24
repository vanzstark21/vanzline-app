import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler } from 'chart.js';
import { Plus, X } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler);

const fmtDate = (s: string) => { if (!s) return '—'; const d = new Date(s + 'T00:00:00'); return d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()] + ' ' + d.getFullYear(); };

export function Progress() {
  const { tasks, progress, setProgress } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const [formData, setFormData] = useState({
    taskName: '', percent: 0, logDate: new Date().toISOString().slice(0, 10), pic: '', note: ''
  });

  const taskNames = [...new Set(tasks.map(t => t.name))];
  const latest: any = {};
  progress.forEach(p => { if (p.percent > (latest[p.taskName] || 0)) latest[p.taskName] = p.percent; });
  const avg = taskNames.length ? Math.round((Object.values(latest).reduce((a: any, b: any) => a + b, 0) as number) / Object.values(latest).length) : 0;

  // Trend data
  const dateMap: any = {};
  progress.forEach(p => {
    if (!dateMap[p.logDate]) dateMap[p.logDate] = { sum: 0, n: 0 };
    dateMap[p.logDate].sum += p.percent; dateMap[p.logDate].n++;
  });
  const trend = Object.entries(dateMap).sort(([a], [b]) => a.localeCompare(b)).map(([d, v]: [string, any]) => ({ date: fmtDate(d).slice(0, 6), avg: Math.round(v.sum / v.n) }));

  const trendData = {
    labels: trend.map(t => t.date),
    datasets: [{ data: trend.map(t => t.avg), borderColor: '#fff', borderWidth: 2.5, fill: true, backgroundColor: 'rgba(255,255,255,0.2)', tension: 0.4, pointRadius: 0 }]
  };

  const barRaw = taskNames.map(n => ({ name: n.length > 18 ? n.slice(0, 18) + '…' : n, value: latest[n] || 0 })).sort((a, b) => b.value - a.value).slice(0, 8);
  const barColors = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316', '#eab308'];
  const barData = {
    labels: barRaw.map(d => d.name),
    datasets: [{ data: barRaw.map(d => d.value), backgroundColor: barRaw.map((_, i) => barColors[i % barColors.length]), borderRadius: 6, borderSkipped: false }]
  };

  const buckets = [{ name: '0–25%', range: [0, 25], value: 0, color: '#f87171' }, { name: '26–50%', range: [26, 50], value: 0, color: '#fbbf24' }, { name: '51–75%', range: [51, 75], value: 0, color: '#38bdf8' }, { name: '76–99%', range: [76, 99], value: 0, color: '#34d399' }, { name: '100%', range: [100, 100], value: 0, color: '#10b981' }];
  Object.values(latest).forEach((p: any) => { const b = buckets.find(x => p >= x.range[0] && p <= x.range[1]); if (b) b.value++; });
  const bd = buckets.filter(b => b.value > 0);
  const pieData = {
    labels: bd.map(b => b.name),
    datasets: [{ data: bd.map(b => b.value), backgroundColor: bd.map(b => b.color), borderWidth: 0, borderRadius: 4, spacing: 3 }]
  };

  const handleOpenModal = (mode: 'create' | 'edit', log: any = null) => {
    setModalMode(mode);
    setSelectedLog(log);
    if (mode === 'edit' && log) {
      setFormData({
        taskName: log.taskName, percent: log.percent, logDate: log.logDate, pic: log.pic || '', note: log.note || ''
      });
    } else {
      setFormData({
        taskName: taskNames[0] || '', percent: 0, logDate: new Date().toISOString().slice(0, 10), pic: '', note: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.taskName) return alert('Pilih pekerjaan terlebih dahulu');
    const updated = {
      ...formData,
      percent: parseInt(formData.percent.toString(), 10) || 0,
      id: modalMode === 'edit' ? selectedLog.id : Date.now().toString()
    };
    
    if (modalMode === 'edit') {
      setProgress(progress.map(p => p.id === selectedLog.id ? updated : p));
    } else {
      setProgress([updated, ...progress]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus log progress ini?')) {
      setProgress(progress.filter(p => p.id !== id));
    }
  };

  return (
    <div className="page active">
      <div className="page-head">
        <div className="page-head-left"><div className="page-head-icon">📊</div>
          <div><h1>Progress Pekerjaan</h1><p>Pantau persentase pelaksanaan dan tren harian.</p></div></div>
        <button className="btn-primary" onClick={() => handleOpenModal('create')}><Plus size={16} /> Catat Progress</button>
      </div>
      <div className="card mb-4" style={{ backgroundImage: 'linear-gradient(135deg,var(--v-from),var(--v-to))', color: '#fff', padding: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.8 }}>Rata-rata Progress Keseluruhan</div>
            <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>{avg}%</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{taskNames.length} pekerjaan · {progress.length} log tercatat</div>
          </div>
          <div style={{ height: 100, width: 240, flexShrink: 0 }}>
            {trend.length > 0 && <Line data={trendData} options={{ responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 9 } }, grid: { display: false }, border: { display: false } }, y: { min: 0, max: 100, ticks: { color: 'rgba(255,255,255,0.7)', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.15)' }, border: { display: false } } }, plugins: { legend: { display: false } } }} />}
          </div>
        </div>
      </div>
      <div className="grid-2 mb-4">
        <div className="card">
          <h3 className="mb-4">Progress per Pekerjaan (terakhir)</h3>
          <div style={{ height: 220 }}>
            {barRaw.length > 0 ? <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y', scales: { x: { max: 100, grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { font: { size: 10 } } }, y: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 } } } }, plugins: { legend: { display: false } } }} /> : <div className="empty">Belum ada data</div>}
          </div>
        </div>
        <div className="card">
          <h3 className="mb-4">Distribusi Rentang Progress</h3>
          <div style={{ height: 220 }}>
            {bd.length > 0 ? <Doughnut data={pieData} options={{ responsive: true, maintainAspectRatio: false, cutout: '55%', plugins: { legend: { position: 'right', labels: { font: { size: 11 }, padding: 8 } } } }} /> : <div className="empty">Belum ada data</div>}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="flex-between mb-4"><h3>Log Progress</h3><span className="text-xs text-muted">{progress.length} entri</span></div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl"><thead><tr><th>Pekerjaan</th><th>Tanggal</th><th>PIC</th><th>Progress</th><th>Catatan</th><th className="text-right">Aksi</th></tr></thead>
            <tbody>{progress.length === 0 ? <tr><td colSpan={6} className="empty">Belum ada log. Klik ＋ Catat Progress.</td></tr> :
              progress.map((p, i) => <tr key={p.id}>
                <td style={{ fontWeight: 700, color: '#334155' }}>{p.taskName}</td>
                <td>{fmtDate(p.logDate)}</td>
                <td>{p.pic || '—'}</td>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="pbar" style={{ width: 80 }}><div className="pbar-fill v" style={{ width: `${p.percent}%` }}></div></div><span style={{ fontSize: 12, fontWeight: 700 }} className="v-text">{p.percent}%</span></div></td>
                <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.note || '—'}</td>
                <td className="text-right">
                  <button className="btn-ghost btn-sky" onClick={() => handleOpenModal('edit', p)}>Edit</button> 
                  <button className="btn-ghost btn-rose" onClick={() => handleDelete(p.id)}>Hapus</button>
                </td>
              </tr>)}
            </tbody></table>
        </div>
      </div>

      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`}>
        <div className="modal-box">
          <div className="modal-head">
            <h2>{modalMode === 'create' ? 'Catat Progress' : 'Edit Log Progress'}</h2>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={18} /></button>
          </div>
          
          <div className="form-row">
            <div><label className="form-label">Pekerjaan</label>
              <select className="form-input" value={formData.taskName || ''} onChange={e => setFormData({...formData, taskName: e.target.value})}>
                {taskNames.map(t => <option key={t} value={t}>{t}</option>)}
                {taskNames.length === 0 && <option value="">Buat pekerjaan di Timeline dulu</option>}
              </select>
            </div>
          </div>
          
          <div className="form-row cols-2">
            <div><label className="form-label">Progress (%)</label><input type="number" min="0" max="100" className="form-input" value={formData.percent ?? 0} onChange={e => setFormData({...formData, percent: parseInt(e.target.value)})} /></div>
            <div><label className="form-label">Tanggal Log</label><input type="date" className="form-input" value={formData.logDate || ''} onChange={e => setFormData({...formData, logDate: e.target.value})} /></div>
          </div>
          
          <div className="form-row">
            <div><label className="form-label">PIC (Penanggung Jawab)</label><input type="text" className="form-input" value={formData.pic || ''} onChange={e => setFormData({...formData, pic: e.target.value})} /></div>
          </div>
          
          <div className="form-row">
            <div><label className="form-label">Catatan</label><textarea className="form-input" rows={3} value={formData.note || ''} onChange={e => setFormData({...formData, note: e.target.value})} /></div>
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',gap:12,marginTop:24}}>
            <button className="btn-ghost" onClick={() => setIsModalOpen(false)}>Batal</button>
            <button className="btn-primary" onClick={handleSave}>Simpan Log</button>
          </div>
        </div>
      </div>
    </div>
  );
}
