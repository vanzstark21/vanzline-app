import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { Plus, X, Download } from 'lucide-react';

const fmtDate = (s: string) => { if (!s) return '—'; const d = new Date(s + 'T00:00:00'); return d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()] + ' ' + d.getFullYear(); };


const NATIONAL_HOLIDAYS = [
  '2026-01-01', '2026-02-17', '2026-03-20', '2026-03-21', 
  '2026-04-03', '2026-05-01', '2026-05-14', '2026-05-31', 
  '2026-06-01', '2026-07-25', '2026-08-17', '2026-12-25'
];

function getWorkingDays(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (start > end) return 0;
  
  let days = 0;
  let cur = new Date(start);
  while (cur <= end) {
    const dayOfWeek = cur.getDay();
    const dateString = cur.toISOString().split('T')[0];
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !NATIONAL_HOLIDAYS.includes(dateString)) {
      days++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function Timeline() {
  const { tasks, setTasks, progress } = useStore();
  const [filter, setFilter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', startDate: '', durationDays: 0, deadline: '', kendala: '', status: 'tertunda', actualProgress: 0, actualStartDate: '', pic: ''
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()));
  }, [tasks, filter]);

  const dates = useMemo(() => {
    if (filteredTasks.length === 0) return { start: new Date(), end: new Date(), list: [] };
    let start = new Date(filteredTasks[0].startDate + 'T00:00:00');
    let end = new Date(filteredTasks[0].deadline + 'T00:00:00');
    filteredTasks.forEach(t => {
      const ps = new Date(t.startDate + 'T00:00:00');
      const pe = new Date(t.deadline + 'T00:00:00');
      if (ps < start) start = ps;
      if (pe > end) end = pe;
    });
    start = new Date(start); start.setDate(start.getDate() - 3);
    end = new Date(end); end.setDate(end.getDate() + 7);
    const list = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      list.push(new Date(d));
    }
    return { start, end, list };
  }, [filteredTasks]);

  const T = new Date().toISOString().slice(0, 10);
  const TDate = new Date(T + 'T00:00:00');
  const todayIndex = dates.list.findIndex(d => d.toISOString().slice(0,10) === T);

  // Group by month
  const months: any[] = [];
  dates.list.forEach(d => {
    const m = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][d.getMonth()] + ' ' + d.getFullYear();
    const last = months[months.length - 1];
    if (last && last.name === m) last.span++;
    else months.push({ name: m, span: 1 });
  });

  const handleOpenModal = () => {
    setFormData({
      name: '', startDate: T, durationDays: 1, deadline: T, kendala: '', status: 'tertunda', actualProgress: 0, actualStartDate: '', actualEndDate: '', actualDurationDays: 0, pic: ''
    } as any);
    setIsModalOpen(true);
  };

  const handleEdit = (t: any) => {
    setFormData({ ...t });
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (!formData.id) return;
    if (confirm('Yakin ingin menghapus pekerjaan ini?')) {
      setTasks(tasks.filter(x => x.id !== (formData as any).id));
      setIsModalOpen(false);
    }
  };

  const downloadPDF = () => {
    import('jspdf').then(({ jsPDF }) => {
      import('jspdf-autotable').then((autoTableModule) => {
        const doc = new jsPDF('landscape');
        doc.setFontSize(18);
        doc.text('Timeline Proyek', 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);
        
        const tableColumn = ["Pekerjaan", "PIC", "Mulai (Plan)", "Selesai (Plan)", "Durasi", "Progress", "Status"];
        const tableRows: any[] = [];

        tasks.forEach((t) => {
          const rowData = [
            t.name,
            t.pic || '-',
            fmtDate(t.startDate),
            fmtDate(t.deadline),
            `${t.durationDays} hr`,
            `${t.actualProgress}%`,
            t.status.replace('_', ' ')
          ];
          tableRows.push(rowData);
        });

        const autoTable: any = (autoTableModule as any).default || autoTableModule;
        autoTable(doc, {
          startY: 35,
          head: [tableColumn],
          body: tableRows,
          theme: 'grid',
          headStyles: { fillColor: [14, 116, 144] },
          styles: { fontSize: 9, cellPadding: 4 }
        });

        const logColumn = ["Tanggal", "Pekerjaan", "PIC", "Progress", "Catatan"];
        const logRows: any[] = [];
        
        const sortedProgress = [...progress].sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());
        sortedProgress.forEach((p) => {
          logRows.push([
            fmtDate(p.logDate),
            p.taskName,
            p.pic || '-',
            `${p.percent}%`,
            p.note || '-'
          ]);
        });

        const finalY = (doc as any).lastAutoTable.finalY || 100;
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('Log Aktivitas Pekerja', 14, finalY + 15);
        
        autoTable(doc, {
          startY: finalY + 20,
          head: [logColumn],
          body: logRows,
          theme: 'grid',
          headStyles: { fillColor: [56, 189, 248] },
          styles: { fontSize: 9, cellPadding: 4 }
        });

        doc.save('Timeline_dan_Log_Proyek.pdf');
      });
    });
  };

  const handleSave = () => {
    if (!formData.name) return alert('Nama pekerjaan harus diisi');
    
    if ((formData as any).id) {
      setTasks(tasks.map(x => x.id === (formData as any).id ? { ...formData } : x));
    } else {
      const updated = {
        ...formData,
        durationDays: parseInt(formData.durationDays.toString(), 10) || 1,
        id: Date.now().toString(),
        createdAt: T
      };
      setTasks([...tasks, updated]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="page active">
      <div className="page-head">
        <div className="page-head-left"><div className="page-head-icon">🗓️</div>
          <div><h1>Timeline Proyek</h1><p>Gantt chart interaktif untuk melihat jadwal dan realisasi.</p></div></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-ghost" style={{ background: '#fff', border: '1px solid #e2e8f0' }} onClick={downloadPDF}><Download size={16} style={{marginRight:6}}/> Unduh PDF</button>
          <button className="btn-primary" onClick={handleOpenModal}><Plus size={16} /> Pekerjaan Baru</button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="form-row cols-3 mb-0" style={{ gap: 16 }}>
          <div><label className="form-label">Cari Pekerjaan</label><input type="text" className="form-input" placeholder="Ketik nama pekerjaan..." value={filter || ''} onChange={e => setFilter(e.target.value)} /></div>
          <div>
             <div style={{ display: 'flex', gap: 16, marginTop: 24, fontSize: 11, fontWeight: 600 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 999, background: 'linear-gradient(90deg, #7dd3fc, #38bdf8)' }}></div> Rencana</div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 999, background: 'linear-gradient(90deg, var(--v-from), var(--v-to))' }}></div> Realisasi (On Progress)</div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 999, background: 'linear-gradient(90deg, #6ee7b7, #34d399)' }}></div> Selesai</div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 999, background: 'linear-gradient(90deg, #fcd34d, #f59e0b)' }}></div> Tertunda</div>
             </div>
          </div>
        </div>
      </div>

      <div className="gantt-wrap">
        <div className="gantt-inner">
          <div className="gantt-header">
            <div style={{ display: 'flex' }}>
              <div style={{ width: 280, flexShrink: 0, padding: '10px 14px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <span>Daftar Pekerjaan</span>
                <span>Durasi</span>
              </div>
              <div style={{ flex: 1 }}>
                <div className="gantt-months">
                  {months.map((m, i) => <div key={i} style={{ width: m.span * 32 }}>{m.name}</div>)}
                </div>
                <div className="gantt-days">
                  {dates.list.map((d, i) => {
                    const isToday = d.toISOString().slice(0, 10) === T;
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    return (
                      <div key={i} className={`gantt-day ${isToday ? 'today' : isWeekend ? 'weekend' : ''}`}>
                        <div className="gantt-day-label">{['M','S','S','R','K','J','S'][d.getDay()]}</div>
                        <div className="gantt-day-num">{d.getDate()}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="gantt-body" style={{ position: 'relative' }}>
            {todayIndex >= 0 && <div className="gantt-today" style={{ left: 280 + todayIndex * 32 + 16 }}></div>}
            
            {filteredTasks.length === 0 ? <div className="empty">Tidak ada pekerjaan.</div> : 
              filteredTasks.map((t, i) => {
                const pStart = new Date(t.startDate + 'T00:00:00');
                const pEnd = new Date(t.deadline + 'T00:00:00');
                const aStart = t.actualStartDate ? new Date(t.actualStartDate + 'T00:00:00') : null;
                const aEnd = t.actualEndDate ? new Date(t.actualEndDate + 'T00:00:00') : (t.status === 'selesai' ? new Date(t.deadline + 'T00:00:00') : (t.status === 'on_progress' ? TDate : null));

                const getLeft = (d: Date) => {
                  const idx = dates.list.findIndex(x => x.getTime() === d.getTime());
                  return Math.max(0, idx * 32);
                };
                const getWidth = (d1: Date, d2: Date) => {
                  const i1 = dates.list.findIndex(x => x.getTime() === d1.getTime());
                  const i2 = dates.list.findIndex(x => x.getTime() === d2.getTime());
                  return Math.max(0, (i2 - i1 + 1) * 32);
                };

                const pL = getLeft(pStart); const pW = getWidth(pStart, pEnd);
                const aL = aStart ? getLeft(aStart) : 0; const aW = (aStart && aEnd) ? getWidth(aStart, aEnd) : 0;

                return (
                  <div className="gantt-row" key={t.id}>
                    <div className="gantt-row-label" style={{ width: 280, display: 'flex', flexDirection: 'column' }} onClick={() => handleEdit(t)}>
                      <div className="name">{t.name}</div>
                      <div className="meta" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span>{fmtDate(t.startDate)} - {fmtDate(t.deadline)}</span>
                        <span>{t.durationDays} hr{t.actualDurationDays ? ` (Aktual: ${t.actualDurationDays} hr)` : ''}</span>
                      </div>
                      <div className="meta" style={{ marginTop: 2, color: '#0ea5e9', fontWeight: 600 }}>{t.pic || 'PIC Belum diisi'}</div>
                    </div>
                    <div className="gantt-row-bars">
                      <div className="gantt-bar-plan" style={{ left: pL, width: pW }}></div>
                      {aStart && (
                        <div className={`gantt-bar-actual ${t.status}`} style={{ left: aL, width: aW }}>
                          <div style={{ position: 'absolute', right: -30, top: -2, fontSize: 10, fontWeight: 700, color: '#64748b' }}>{t.actualProgress}%</div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>

      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`}>
        <div className="modal-box">
          <div className="modal-head">
            <h2>{(formData as any).id ? 'Edit Pekerjaan' : 'Pekerjaan Baru'}</h2>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={18} /></button>
          </div>
          
          <div className="form-row">
            <div><label className="form-label">Nama Pekerjaan</label><input type="text" className="form-input" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          </div>
          
          <div className="form-row cols-2">
            <div>
              <label className="form-label">Tanggal Mulai Rencana</label>
              <input type="date" className="form-input" value={formData.startDate || ''} onChange={e => {
                const newStart = e.target.value;
                setFormData(prev => ({
                  ...prev, 
                  startDate: newStart,
                  durationDays: getWorkingDays(newStart, prev.deadline) || 1
                }));
              }} />
            </div>
            <div>
              <label className="form-label">Tenggat Waktu Rencana</label>
              <input type="date" className="form-input" value={formData.deadline || ''} onChange={e => {
                const newEnd = e.target.value;
                setFormData(prev => ({
                  ...prev, 
                  deadline: newEnd,
                  durationDays: getWorkingDays(prev.startDate, newEnd) || 1
                }));
              }} />
            </div>
          </div>

          <div className="form-row cols-2">
            <div><label className="form-label">Durasi (Hari)</label><input type="number" min="1" className="form-input" value={formData.durationDays || ''} onChange={e => setFormData({...formData, durationDays: parseInt(e.target.value) || 1})} /></div>
            <div><label className="form-label">PIC (Personil)</label><input type="text" className="form-input" placeholder="Nama penanggung jawab" value={formData.pic || ''} onChange={e => setFormData({...formData, pic: e.target.value})} /></div>
          </div>

          <div className="form-row cols-2">
            <div>
              <label className="form-label">Aktual Mulai</label>
              <input type="date" className="form-input" value={formData.actualStartDate || ''} onChange={e => {
                const newStart = e.target.value;
                setFormData(prev => ({
                  ...prev, 
                  actualStartDate: newStart,
                  actualDurationDays: prev.actualEndDate ? getWorkingDays(newStart, prev.actualEndDate) : prev.actualDurationDays
                }));
              }} />
            </div>
            <div>
              <label className="form-label">Aktual Selesai</label>
              <input type="date" className="form-input" value={formData.actualEndDate || ''} onChange={e => {
                const newEnd = e.target.value;
                setFormData(prev => ({
                  ...prev, 
                  actualEndDate: newEnd,
                  actualDurationDays: prev.actualStartDate ? getWorkingDays(prev.actualStartDate, newEnd) : prev.actualDurationDays
                }));
              }} />
            </div>
          </div>
          <div className="form-row cols-2">
            <div>
              <label className="form-label">Durasi Aktual (Hari)</label>
              <input type="number" min="1" className="form-input" value={formData.actualDurationDays || ''} onChange={e => setFormData({...formData, actualDurationDays: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <label className="form-label">Progress Aktual (%)</label>
              <input type="number" min="0" max="100" className="form-input" value={formData.actualProgress ?? 0} onChange={e => setFormData({...formData, actualProgress: parseInt(e.target.value) || 0})} />
            </div>
          </div>

          <div className="form-row">
            <div><label className="form-label">Status</label>
              <select className="form-input" value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="tertunda">Tertunda</option>
                <option value="on_progress">On Progress</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:24}}>
            <div>
              {(formData as any).id && (
                <button className="btn-ghost" style={{ color: '#e11d48' }} onClick={handleDelete}>Hapus</button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-ghost" onClick={() => setIsModalOpen(false)}>Batal</button>
              <button className="btn-primary" onClick={handleSave}>Simpan Pekerjaan</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
