import { useState } from 'react';
import { useStore } from '../store/useStore';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Plus, X, Download, FileText } from 'lucide-react';

export function Personil() {
  const { personnel, setPersonnel } = useStore();
  const [filter, setFilter] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'attendance'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPerson, setSelectedPerson] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: '', role: '', phone: '', email: '', statusToday: 'hadir', notes: '',
    attendance: { mon: 'hadir', tue: 'hadir', wed: 'hadir', thu: 'hadir', fri: 'hadir', sat: '-', sun: '-' }
  });

  const filtered = personnel.filter(p => 
    (statusF === 'all' || p.statusToday === statusF) &&
    ((p.fullName || '').toLowerCase().includes(filter.toLowerCase()) || (p.role || '').toLowerCase().includes(filter.toLowerCase()))
  );

  const counts = { hadir: 0, ijin: 0, sakit: 0, absen: 0, cuti: 0, lembur: 0 };
  personnel.forEach(p => { counts[p.statusToday as keyof typeof counts] = (counts[p.statusToday as keyof typeof counts] || 0) + 1; });

  const stMap: any = { hadir: ['bg-emerald-100 text-emerald-700', 'Hadir'], ijin: ['bg-sky-100 text-sky-700', 'Ijin'], sakit: ['bg-amber-100 text-amber-700', 'Sakit'], absen: ['bg-rose-100 text-rose-600', 'Absen'], cuti: ['bg-purple-100 text-purple-700', 'Cuti'], lembur: ['bg-indigo-100 text-indigo-700', 'Lembur'], '-': ['bg-slate-100 text-slate-500', '-'] };

  const getWeekDates = () => {
    const curr = new Date();
    const currentDay = curr.getDay() || 7; 
    const first = curr.getDate() - currentDay + 1;
    
    const dates = [];
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr);
      d.setDate(first + i);
      const formatted = `${dayNames[i]}, ${d.getDate()} ${['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][d.getMonth()]} ${d.getFullYear()}`;
      const shortLabel = `${dayNames[i]}\n${d.getDate()} ${['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][d.getMonth()]} ${d.getFullYear()}`;
      dates.push({ key: days[i], label: formatted, shortLabel });
    }
    return dates;
  };
  const weekDates = getWeekDates();

  const handleOpenModal = (mode: 'create' | 'edit', p: any = null) => {
    setModalMode(mode);
    setSelectedPerson(p);
    if (mode === 'edit' && p) {
      setFormData({
        fullName: p.fullName, role: p.role, phone: p.phone || '', email: p.email || '', 
        statusToday: p.statusToday, notes: p.notes || '',
        attendance: p.attendance || { mon: 'hadir', tue: 'hadir', wed: 'hadir', thu: 'hadir', fri: 'hadir', sat: '-', sun: '-' }
      });
    } else {
      setFormData({
        fullName: '', role: '', phone: '', email: '', statusToday: 'hadir', notes: '',
        attendance: { mon: 'hadir', tue: 'hadir', wed: 'hadir', thu: 'hadir', fri: 'hadir', sat: '-', sun: '-' }
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.fullName || !formData.role) return alert('Nama dan jabatan harus diisi');
    const updated = {
      ...formData,
      id: modalMode === 'edit' ? selectedPerson.id : Date.now().toString(),
      createdAt: modalMode === 'edit' ? selectedPerson.createdAt : new Date().toISOString().slice(0, 10)
    };
    if (modalMode === 'edit') setPersonnel(personnel.map(p => p.id === selectedPerson.id ? updated : p));
    else setPersonnel([updated, ...personnel]);
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (confirm('Hapus personil ini?')) {
      setPersonnel(personnel.filter(p => p.id !== selectedPerson.id));
      setIsModalOpen(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.text('Laporan Rekap Kehadiran Mingguan', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);
    
    const tableColumn = ["Nama Personil", "Jabatan", ...weekDates.map(w => w.label)];
    const tableRows: any[] = [];

    personnel.forEach(p => {
      const att = p.attendance || { mon: '-', tue: '-', wed: '-', thu: '-', fri: '-', sat: '-', sun: '-' };
      const rowData = [
        p.fullName,
        p.role,
        (att.mon || '-').toUpperCase(),
        (att.tue || '-').toUpperCase(),
        (att.wed || '-').toUpperCase(),
        (att.thu || '-').toUpperCase(),
        (att.fri || '-').toUpperCase(),
        (att.sat || '-').toUpperCase(),
        (att.sun || '-').toUpperCase()
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      startY: 35,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [14, 116, 144] },
      styles: { fontSize: 9, cellPadding: 4 }
    });

    doc.save('Rekap_Kehadiran_Vanzline.pdf');
  };

  const updateAttendance = (id: string, day: string, val: string) => {
    setPersonnel(personnel.map(p => {
      if (p.id === id) {
        const att = p.attendance ? { ...p.attendance } : { mon: '-', tue: '-', wed: '-', thu: '-', fri: '-', sat: '-', sun: '-' };
        (att as any)[day] = val;
        return { ...p, attendance: att };
      }
      return p;
    }));
  };

  return (
    <div className="page active">
      <div className="page-head">
        <div className="page-head-left"><div className="page-head-icon">👥</div>
          <div><h1>Data Personil</h1><p>Daftar tim dan status kehadiran harian.</p></div></div>
        <div style={{ display: 'flex', gap: 12 }}>
          {activeTab === 'attendance' && <button className="btn-ghost" style={{ background: '#fff', border: '1px solid #e2e8f0' }} onClick={downloadPDF}><Download size={16} style={{marginRight:6}}/> Unduh PDF</button>}
          <button className="btn-primary" onClick={() => handleOpenModal('create')}><Plus size={16} /> Tambah Personil</button>
        </div>
      </div>

      <div className="card mb-4" style={{ padding: 0, display: 'flex', overflow: 'hidden' }}>
        <button onClick={() => setActiveTab('list')} style={{ flex: 1, padding: '12px 20px', fontSize: 13, fontWeight: 700, background: activeTab === 'list' ? '#f1f5f9' : 'transparent', color: activeTab === 'list' ? '#0f172a' : '#64748b', borderBottom: activeTab === 'list' ? '2px solid var(--v-from)' : '2px solid transparent' }}>Daftar Personil</button>
        <button onClick={() => setActiveTab('kehadiran')} style={{ flex: 1, padding: '12px 20px', fontSize: 13, fontWeight: 700, background: activeTab === 'kehadiran' ? '#f1f5f9' : 'transparent', color: activeTab === 'kehadiran' ? '#0f172a' : '#64748b', borderBottom: activeTab === 'kehadiran' ? '2px solid var(--v-from)' : '2px solid transparent' }}>Kehadiran</button>
        <button onClick={() => setActiveTab('attendance')} style={{ flex: 1, padding: '12px 20px', fontSize: 13, fontWeight: 700, background: activeTab === 'attendance' ? '#f1f5f9' : 'transparent', color: activeTab === 'attendance' ? '#0f172a' : '#64748b', borderBottom: activeTab === 'attendance' ? '2px solid var(--v-from)' : '2px solid transparent' }}>Rekap Mingguan</button>
      </div>

      {activeTab === 'list' && (
        <>
          <div className="grid-6 mb-4">
            <div className="card kpi" onClick={() => setStatusF('all')} style={statusF==='all'?{borderColor:'var(--v-from)',boxShadow:'0 0 0 1px var(--v-from)'}:{}}><div className="kpi-icon">👥</div><div className="kpi-val">{personnel.length}</div><div className="kpi-label">Total</div></div>
            <div className="card kpi" onClick={() => setStatusF('hadir')} style={statusF==='hadir'?{borderColor:'var(--v-from)',boxShadow:'0 0 0 1px var(--v-from)'}:{}}><div className="kpi-icon">✅</div><div className="kpi-val">{counts.hadir}</div><div className="kpi-label">Hadir</div></div>
            <div className="card kpi" onClick={() => setStatusF('ijin')} style={statusF==='ijin'?{borderColor:'var(--v-from)',boxShadow:'0 0 0 1px var(--v-from)'}:{}}><div className="kpi-icon">ℹ️</div><div className="kpi-val">{counts.ijin}</div><div className="kpi-label">Ijin</div></div>
            <div className="card kpi" onClick={() => setStatusF('sakit')} style={statusF==='sakit'?{borderColor:'var(--v-from)',boxShadow:'0 0 0 1px var(--v-from)'}:{}}><div className="kpi-icon">🤒</div><div className="kpi-val">{counts.sakit}</div><div className="kpi-label">Sakit</div></div>
            <div className="card kpi" onClick={() => setStatusF('absen')} style={statusF==='absen'?{borderColor:'var(--v-from)',boxShadow:'0 0 0 1px var(--v-from)'}:{}}><div className="kpi-icon">❌</div><div className="kpi-val">{counts.absen}</div><div className="kpi-label">Absen</div></div>
            <div className="card kpi" onClick={() => setStatusF('lembur')} style={statusF==='lembur'?{borderColor:'var(--v-from)',boxShadow:'0 0 0 1px var(--v-from)'}:{}}><div className="kpi-icon">🏢</div><div className="kpi-val">{counts.lembur}</div><div className="kpi-label">Lembur</div></div>
          </div>

          <div className="card mb-4">
            <div className="form-row cols-2 mb-0">
              <div><label className="form-label">Cari Personil</label><input type="text" className="form-input" placeholder="Nama atau jabatan..." value={filter || ''} onChange={e => setFilter(e.target.value)} /></div>
              <div><label className="form-label">Filter Status Hari Ini</label><select className="form-input" value={statusF || ''} onChange={e => setStatusF(e.target.value)}><option value="all">Semua Status</option><option value="hadir">Hadir</option><option value="ijin">Ijin</option><option value="sakit">Sakit</option><option value="absen">Absen</option><option value="cuti">Cuti</option></select></div>
            </div>
          </div>

          <div className="grid-4">
            {filtered.length === 0 ? <div className="card" style={{ gridColumn: '1 / -1' }}><div className="empty">Tidak ada personil yang sesuai.</div></div> :
              filtered.map(p => {
                const st = stMap[p.statusToday] || ['bg-slate-100 text-slate-600', p.statusToday];
                return (
                  <div className="person-card" key={p.id}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {p.photoBase64 ? <img src={p.photoBase64} alt="" className="person-avatar" style={{ objectFit: 'cover' }} /> : <div className="person-avatar">{(p.fullName || 'U').charAt(0)}</div>}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="truncate font-bold text-sm" style={{ color: '#1e293b' }}>{p.fullName}</div>
                        <div className="truncate text-xs text-muted mb-1">{p.role}</div>
                        <span className={`pill ${st[0]}`}>{st[1]}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                      <button className="btn-ghost btn-sky" style={{ flex: 1, textAlign: 'center' }} onClick={() => handleOpenModal('edit', p)}>Profil & Edit</button>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </>
      )}

      {activeTab === 'kehadiran' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div style={{ width: 240, flexShrink: 0, padding: '12px 16px', fontWeight: 600, borderRight: '1px solid #e2e8f0', color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nama Personil</div>
            <div style={{ display: 'flex', flex: 1 }}>
              {weekDates.map(w => (
                <div key={w.key} style={{ flex: 1, padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, borderRight: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', lineHeight: 1.4, color: '#334155' }}>{w.shortLabel}</div>
              ))}
            </div>
          </div>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {personnel.length === 0 ? <div className="empty" style={{ padding: 32 }}>Belum ada data</div> : personnel.map(p => {
              const att = p.attendance || { mon: '-', tue: '-', wed: '-', thu: '-', fri: '-' };
              const days = weekDates.map(w => ({ key: w.key, val: (att as any)[w.key] }));
              
              const chunks: any[] = [];
              let currentChunk: any = null;
              
              days.forEach((d, i) => {
                if (d.val === '-') {
                  if (currentChunk) chunks.push(currentChunk);
                  currentChunk = null;
                  return;
                }
                
                if (!currentChunk) {
                  currentChunk = { val: d.val, startIdx: i, count: 1 };
                } else {
                  if (currentChunk.val === d.val) {
                    currentChunk.count++;
                  } else {
                    chunks.push(currentChunk);
                    currentChunk = { val: d.val, startIdx: i, count: 1 };
                  }
                }
              });
              if (currentChunk) chunks.push(currentChunk);
              
              return (
                <div key={p.id} style={{ display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 240, flexShrink: 0, padding: '12px 16px', borderRight: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
                    <div style={{ minWidth: 0 }}>
                      <div className="truncate" style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{p.fullName}</div>
                      <div className="truncate" style={{ fontSize: 11, color: '#64748b' }}>{p.role}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flex: 1, position: 'relative', height: 48, padding: '8px 0' }}>
                    {weekDates.map((w, i) => (
                      <div key={w.key} style={{ flex: 1, borderRight: i < 6 ? '1px dashed #e2e8f0' : 'none' }}></div>
                    ))}
                    
                    {chunks.map((chunk, i) => {
                      let bg = '#e2e8f0';
                      let label = chunk.val;
                      if (chunk.val === 'hadir') { bg = '#10b981'; label = 'Hadir'; }
                      if (chunk.val === 'ijin') { bg = '#0ea5e9'; label = 'Ijin'; }
                      if (chunk.val === 'sakit') { bg = '#f59e0b'; label = 'Sakit'; }
                      if (chunk.val === 'absen') { bg = '#f43f5e'; label = 'Absen'; }
                      if (chunk.val === 'cuti') { bg = '#a855f7'; label = 'Cuti'; }
                      if (chunk.val === 'lembur') { bg = '#6366f1'; label = 'Lembur'; }
                      
                      const left = `${(chunk.startIdx / 7) * 100}%`;
                      const width = `${(chunk.count / 7) * 100}%`;
                      
                      return (
                        <div key={i} style={{ position: 'absolute', top: 8, left: left, width: width, height: 32, padding: '0 4px', zIndex: 5 }}>
                          <div style={{ background: bg, height: '100%', borderRadius: 16, display: 'flex', alignItems: 'center', padding: '0 12px', color: '#fff', fontSize: 11, fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {label}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Nama Personil</th>
                  {weekDates.map(w => (
                    <th key={w.key} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{w.shortLabel}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {personnel.length === 0 ? <tr><td colSpan={8} className="empty">Belum ada personil.</td></tr> : 
                  personnel.map(p => {
                    const att = p.attendance || { mon: '-', tue: '-', wed: '-', thu: '-', fri: '-', sat: '-', sun: '-' };
                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 700, color: '#334155' }}>
                          <div>{p.fullName}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 400 }}>{p.role}</div>
                        </td>
                        {weekDates.map(w => (
                          <td key={w.key}>
                            <select className="form-input" style={{ padding: '4px 8px', fontSize: 11, width: 90 }} value={(att as any)[w.key]} onChange={e => updateAttendance(p.id, w.key, e.target.value)}>
                              <option value="-">-</option><option value="hadir">Hadir</option><option value="ijin">Ijin</option><option value="sakit">Sakit</option><option value="absen">Absen</option><option value="cuti">Cuti</option><option value="lembur">Lembur</option>
                            </select>
                          </td>
                        ))}
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`}>
        <div className="modal-box">
          <div className="modal-head">
            <h2>{modalMode === 'create' ? 'Tambah Personil' : 'Profil Personil'}</h2>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={18} /></button>
          </div>
          
          <div className="form-row cols-2">
            <div><label className="form-label">Nama Lengkap</label><input type="text" className="form-input" value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} /></div>
            <div><label className="form-label">Jabatan</label><input type="text" className="form-input" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} /></div>
          </div>
          
          <div className="form-row cols-2">
            <div><label className="form-label">No. Telepon</label><input type="text" className="form-input" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
            <div><label className="form-label">Email</label><input type="email" className="form-input" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
          </div>
          
          <div className="form-row">
            <div><label className="form-label">Status Hari Ini</label>
              <select className="form-input" value={formData.statusToday || ''} onChange={e => setFormData({...formData, statusToday: e.target.value})}>
                <option value="hadir">Hadir</option>
                <option value="ijin">Ijin</option>
                <option value="sakit">Sakit</option>
                <option value="absen">Absen</option>
                <option value="cuti">Cuti</option>
                <option value="lembur">Lembur</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div><label className="form-label">Catatan Tambahan</label><textarea className="form-input" rows={2} value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',gap:12,marginTop:24}}>
            <button className="btn-ghost" onClick={() => setIsModalOpen(false)}>Batal</button>
            {modalMode === 'edit' && <button className="btn-ghost btn-rose" onClick={handleDelete}>Hapus Data</button>}
            <button className="btn-primary" onClick={handleSave}>Simpan Profil</button>
          </div>
        </div>
      </div>
    </div>
  );
}
