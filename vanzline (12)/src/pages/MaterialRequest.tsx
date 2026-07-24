import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, X, Upload } from 'lucide-react';

const fmtDate = (s: string) => { if (!s) return '—'; const d = new Date(s + 'T00:00:00'); return d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][d.getMonth()] + ' ' + d.getFullYear(); };
const fmtMoney = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export function MaterialRequest() {
  const { materials, setMaterials } = useStore();
  const [filter, setFilter] = useState('');
  const [statusF, setStatusF] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedMat, setSelectedMat] = useState<any>(null);

  const [formData, setFormData] = useState({
    projectName: '', itemName: '', qty: '', unit: 'pcs', estPrice: '', neededDate: '', status: 'draft', notes: '', photoBase64: ''
  });

  const filtered = materials.filter(m => 
    (statusF === 'all' || m.status === statusF) &&
    (m.itemName.toLowerCase().includes(filter.toLowerCase()) || m.projectName.toLowerCase().includes(filter.toLowerCase()))
  );

  const stats = {
    total: materials.length,
    pending: materials.filter(m => m.status === 'pending').length,
    approved: materials.filter(m => m.status === 'approved').length,
    ordered: materials.filter(m => m.status === 'ordered').length,
    cost: materials.reduce((s, m) => s + (m.estPrice || 0) * m.qty, 0)
  };

  const stMap: any = { draft: ['bg-slate-100 text-slate-600', 'Draft'], pending: ['bg-amber-100 text-amber-700', 'Pending'], approved: ['bg-sky-100 text-sky-700', 'Disetujui'], ordered: ['bg-indigo-100 text-indigo-700', 'Dipesan'], received: ['bg-emerald-100 text-emerald-700', 'Diterima'], rejected: ['bg-rose-100 text-rose-600', 'Ditolak'] };

  const handleOpenModal = (mode: 'create' | 'edit', mat: any = null) => {
    setModalMode(mode);
    setSelectedMat(mat);
    if (mode === 'edit' && mat) {
      setFormData({
        projectName: mat.projectName, itemName: mat.itemName, qty: mat.qty.toString(), unit: mat.unit, 
        estPrice: mat.estPrice ? mat.estPrice.toString() : '', neededDate: mat.neededDate || '', 
        status: mat.status, notes: mat.notes || '', photoBase64: mat.photoBase64 || ''
      });
    } else {
      setFormData({
        projectName: '', itemName: '', qty: '', unit: 'pcs', estPrice: '', neededDate: '', status: 'draft', notes: '', photoBase64: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.itemName || !formData.projectName) return alert('Nama barang dan proyek harus diisi');
    const updated = {
      ...formData,
      qty: parseFloat(formData.qty) || 0,
      estPrice: parseFloat(formData.estPrice) || 0,
      id: modalMode === 'edit' ? selectedMat.id : Date.now().toString(),
      reqDate: modalMode === 'edit' ? selectedMat.reqDate : new Date().toISOString().slice(0, 10)
    };
    
    if (modalMode === 'edit') {
      setMaterials(materials.map(m => m.id === selectedMat.id ? updated : m));
    } else {
      setMaterials([updated, ...materials]);
    }
    setIsModalOpen(false);
  };

  const updateStatus = (id: string, newStatus: string) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, status: newStatus } : m));
    if (selectedMat && selectedMat.id === id) {
      setSelectedMat({ ...selectedMat, status: newStatus });
      setFormData(prev => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="page active">
      <div className="page-head">
        <div className="page-head-left"><div className="page-head-icon">📦</div>
          <div><h1>Material Request</h1><p>Manajemen pengajuan dan status pengadaan material.</p></div></div>
        <button className="btn-primary" onClick={() => handleOpenModal('create')}><Plus size={16} /> Buat Request</button>
      </div>

      <div className="grid-5 mb-4">
        <div className="card kpi"><div className="kpi-icon">📝</div><div className="kpi-val">{stats.total}</div><div className="kpi-label">Total Request</div></div>
        <div className="card kpi"><div className="kpi-icon">⏳</div><div className="kpi-val">{stats.pending}</div><div className="kpi-label">Menunggu</div></div>
        <div className="card kpi"><div className="kpi-icon">✅</div><div className="kpi-val">{stats.approved}</div><div className="kpi-label">Disetujui</div></div>
        <div className="card kpi"><div className="kpi-icon">🚚</div><div className="kpi-val">{stats.ordered}</div><div className="kpi-label">Dipesan</div></div>
        <div className="card kpi"><div className="kpi-icon">💰</div><div className="kpi-val text-sm mt-2">{fmtMoney(stats.cost)}</div><div className="kpi-label">Est. Biaya</div></div>
      </div>

      <div className="card mb-4">
        <div className="form-row cols-3 mb-0">
          <div><label className="form-label">Cari Material</label><input type="text" className="form-input" placeholder="Ketik nama barang..." value={filter || ''} onChange={e => setFilter(e.target.value)} /></div>
          <div><label className="form-label">Status</label><select className="form-input" value={statusF || ''} onChange={e => setStatusF(e.target.value)}><option value="all">Semua Status</option><option value="draft">Draft</option><option value="pending">Pending</option><option value="approved">Disetujui</option><option value="ordered">Dipesan</option><option value="received">Diterima</option><option value="rejected">Ditolak</option></select></div>
        </div>
      </div>

      <div className="grid-4">
        {filtered.length === 0 ? <div className="card" style={{ gridColumn: '1 / -1' }}><div className="empty">Tidak ada material request yang sesuai.</div></div> :
          filtered.map((m, i) => {
            const st = stMap[m.status] || stMap.draft;
            const progressSteps = ['draft','pending','approved','ordered','received'];
            const curIdx = progressSteps.indexOf(m.status);
            return (
              <div className="mat-card" key={m.id}>
                <div className="mat-card-img">
                  {m.photoBase64 ? <img src={m.photoBase64} alt=""/> : <div className="placeholder">📦</div>}
                </div>
                <div className="mat-card-body">
                  <div className="flex-between mb-2">
                    <span className={`pill ${st[0]}`}>{st[1]}</span>
                    <span className="text-xs text-muted font-bold">{fmtDate(m.reqDate)}</span>
                  </div>
                  <h3 className="truncate mb-1">{m.itemName}</h3>
                  <div className="text-xs text-slate mb-3 truncate">📍 {m.projectName}</div>
                  
                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 12, marginBottom: 12 }}>
                    <div className="flex-between text-xs mb-1"><span className="text-muted">Jumlah:</span><span className="font-bold">{m.qty} {m.unit}</span></div>
                    <div className="flex-between text-xs"><span className="text-muted">Est. Harga:</span><span className="font-bold">{fmtMoney(m.estPrice || 0)}</span></div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 4, height: 4, borderRadius: 2, overflow: 'hidden', background: '#f1f5f9' }}>
                    {progressSteps.map((_, i) => (
                      <div key={i} style={{ flex: 1, background: curIdx === -1 && m.status === 'rejected' ? (i===0?'#f43f5e':'transparent') : i <= curIdx ? 'var(--v-from)' : 'transparent' }}></div>
                    ))}
                  </div>
                  
                  <div className="grid-2 mt-4">
                    <button className="btn-ghost btn-sky" style={{ width: '100%' }} onClick={() => handleOpenModal('edit', m)}>Detail & Edit</button>
                    {m.status === 'pending' && <button className="btn-ghost" style={{ background: '#dcfce7', color: '#166534', width: '100%' }} onClick={() => updateStatus(m.id, 'approved')}>Setujui</button>}
                    {m.status === 'approved' && <button className="btn-ghost" style={{ background: '#e0e7ff', color: '#4338ca', width: '100%' }} onClick={() => updateStatus(m.id, 'ordered')}>Pesan</button>}
                    {m.status === 'ordered' && <button className="btn-ghost" style={{ background: '#d1fae5', color: '#059669', width: '100%' }} onClick={() => updateStatus(m.id, 'received')}>Terima</button>}
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>

      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`}>
        <div className="modal-box">
          <div className="modal-head">
            <h2>{modalMode === 'create' ? 'Buat Material Request' : 'Detail Material Request'}</h2>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={18} /></button>
          </div>
          
          <div className="form-row cols-2">
            <div><label className="form-label">Nama Barang</label><input type="text" className="form-input" value={formData.itemName || ''} onChange={e => setFormData({...formData, itemName: e.target.value})} /></div>
            <div><label className="form-label">Nama Proyek</label><input type="text" className="form-input" value={formData.projectName || ''} onChange={e => setFormData({...formData, projectName: e.target.value})} /></div>
          </div>
          
          <div className="form-row cols-3">
            <div><label className="form-label">Jumlah</label><input type="number" className="form-input" value={formData.qty || ''} onChange={e => setFormData({...formData, qty: e.target.value})} /></div>
            <div><label className="form-label">Satuan</label><input type="text" className="form-input" value={formData.unit || ''} onChange={e => setFormData({...formData, unit: e.target.value})} /></div>
            <div><label className="form-label">Tgl Dibutuhkan</label><input type="date" className="form-input" value={formData.neededDate || ''} onChange={e => setFormData({...formData, neededDate: e.target.value})} /></div>
          </div>
          
          <div className="form-row cols-2">
            <div><label className="form-label">Estimasi Harga Total (Rp)</label><input type="number" className="form-input" value={formData.estPrice || ''} onChange={e => setFormData({...formData, estPrice: e.target.value})} /></div>
            <div><label className="form-label">Status</label>
              <select className="form-input" value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Disetujui</option>
                <option value="ordered">Dipesan</option>
                <option value="received">Diterima</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div><label className="form-label">Catatan</label><textarea className="form-input" rows={3} value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',gap:12,marginTop:24}}>
            <button className="btn-ghost" onClick={() => setIsModalOpen(false)}>Batal</button>
            {modalMode === 'edit' && <button className="btn-ghost btn-rose" onClick={() => { setMaterials(materials.filter(m => m.id !== selectedMat.id)); setIsModalOpen(false); }}>Hapus</button>}
            <button className="btn-primary" onClick={handleSave}>Simpan Request</button>
          </div>
        </div>
      </div>
    </div>
  );
}
