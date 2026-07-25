import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Upload, CheckCircle, Circle, Trash2, FileSpreadsheet, ChevronDown, ChevronUp, Package } from 'lucide-react';
import * as XLSX from 'xlsx';

export function MaterialRequest() {
  const { materials, setMaterials } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      
      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      const projectId = Date.now().toString();
      let projectName = file.name.replace(/\.[^/.]+$/, "");
      
      // Extract project name from header rows if it exists
      for (let i = 0; i < Math.min(10, rawData.length); i++) {
         const row = rawData[i];
         if (!row) continue;
         for (let j = 0; j < row.length; j++) {
            const cell = String(row[j] || '').toUpperCase();
            if (cell.includes('NAMA PROJECT') || cell.includes('NAMA PROYEK')) {
               if (row[j+1]) {
                  projectName = String(row[j+1]).replace(/^:\s*/, '');
               } else if (cell.includes(':')) {
                  projectName = cell.split(':')[1].trim();
               }
            }
         }
      }
      
      // Find the actual table header row
      let headerRowIndex = -1;
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        if (row && row.some(cell => typeof cell === 'string' && cell.toUpperCase().includes('NAMA BARANG'))) {
           headerRowIndex = i;
           break;
        }
      }
      
      let parsedData: any[] = [];
      if (headerRowIndex !== -1) {
         const headers = rawData[headerRowIndex].map(h => String(h || '').trim());
         for (let i = headerRowIndex + 1; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || row.length === 0) continue;
            
            // Check if it's a subtotal or empty row
            const firstCell = String(row[0] || '').toUpperCase();
            const secondCell = String(row[1] || '').toUpperCase();
            const thirdCell = String(row[2] || '').toUpperCase();
            if (firstCell.includes('ESTIMASI') || secondCell.includes('ESTIMASI') || thirdCell.includes('ESTIMASI')) continue;
            if (!row.some(c => c)) continue; // skip completely empty rows
            
            let rowObj: any = {};
            headers.forEach((h, j) => {
               if (h && row[j] !== undefined) rowObj[h] = row[j];
               else if (h) rowObj[h] = null;
            });
            parsedData.push(rowObj);
         }
      } else {
         parsedData = XLSX.utils.sheet_to_json(ws);
      }
      
      const newItems = parsedData.map((row: any, i) => {
        const itemNameRaw = row['NAMA BARANG'] || row['Nama Barang'] || row['Item Name'] || row['Item'] || row['Barang'] || row['Material'];
        let itemName = itemNameRaw;
        
        // Fallback: try to guess the item name from first or second column if not just a number
        if (!itemName) {
           const firstVal = Object.values(row)[0];
           const secondVal = Object.values(row)[1];
           if (firstVal && !/^\d+$/.test(String(firstVal).trim())) {
              itemName = firstVal;
           } else if (secondVal && !/^\d+$/.test(String(secondVal).trim())) {
              itemName = secondVal;
           }
        }
        itemName = itemName || 'Unknown Item';

        const qty = row['QTY'] || row['Qty'] || row['Quantity'] || row['Jumlah'] || row['Kuantitas'] || 1;
        const unit = row['UNIT'] || row['Unit'] || row['Satuan'] || 'pcs';
        
        const strName = String(itemName).toLowerCase().trim();
        if (!itemName || strName === 'unknown item' || strName === 'undefined' || strName === 'null' || strName === '') return null;
        if (/^\d+$/.test(strName)) return null; // Exclude if item name is just a number
        
        if (strName.includes('dibuat oleh') || strName.includes('tanggal') || strName.includes('diperiksa') || strName.includes('disetujui') || strName.includes('diterima') || strName.includes('.........') || strName.includes('no request') || strName.includes('deadline') || strName.includes('keperluan')) return null;
        if (Number.isNaN(Number(qty)) && typeof qty !== 'number') return null; // Filter rows that don't have a valid number for QTY if possible
        
        return {
          id: projectId + '-' + i,
          projectId,
          projectName,
          itemName: String(itemName),
          qty: Number(qty) || 0,
          unit: String(unit),
          status: 'belum', // belum, pemesanan, pembelian, pengiriman, diterima, batal
          statusTimestamps: { belum: new Date().toISOString() },
          rawData: row,
          createdAt: new Date().toISOString()
        };
      }).filter(Boolean); // remove nulls

      setMaterials([...newItems, ...materials]);
      setExpandedProjects(prev => ({ ...prev, [projectId]: true }));
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleStatus = (id: string, newStatus?: string) => {
    const currentMaterials = useStore.getState().materials;
    setMaterials(currentMaterials.map((m: any) => {
      if (String(m.id) === String(id)) {
        const statusToSet = newStatus || (m.status === 'diterima' ? 'belum' : 'diterima');
        const updatedTimestamps = { ...(m.statusTimestamps || {}) };
        updatedTimestamps[statusToSet] = new Date().toISOString();
        return { ...m, status: statusToSet, statusTimestamps: updatedTimestamps };
      }
      return m;
    }));
  };

  const updateRemark = (id: string, remark: string) => {
    const currentMaterials = useStore.getState().materials;
    setMaterials(currentMaterials.map((m: any) => {
      if (String(m.id) === String(id)) {
        return { ...m, remark };
      }
      return m;
    }));
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      const currentMaterials = useStore.getState().materials;
      if (projectToDelete === 'legacy') {
        setMaterials(currentMaterials.filter((m: any) => m.projectId));
      } else {
        setMaterials(currentMaterials.filter((m: any) => String(m.projectId) !== String(projectToDelete)));
      }
      setProjectToDelete(null);
    }
  };

  const toggleExpand = (projectId: string) => {
    setExpandedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  // Group materials by projectId
  const grouped: Record<string, any[]> = {};
  materials.forEach(m => {
    const pid = m.projectId || 'legacy';
    if (!grouped[pid]) grouped[pid] = [];
    grouped[pid].push(m);
  });

  return (
    <div className="page active">
      <div className="page-head">
        <div className="page-head-left">
          <div className="page-head-icon" style={{ background: 'var(--v-soft)', color: 'var(--v-text)' }}><Package size={24} /></div>
          <div>
            <h1>Material Request</h1>
            <p>Upload Excel untuk membuat project dan track pengadaan material.</p>
          </div>
        </div>
        <div className="page-head-right">
          <input type="file" accept=".xlsx, .xls, .csv" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} />
          <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} /> Upload Excel
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {Object.keys(grouped).length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', background: '#f8fafc', borderRadius: 12, border: '2px dashed #cbd5e1' }}>
            <FileSpreadsheet size={48} style={{ margin: '0 auto 16px', color: '#94a3b8' }} />
            <h3 style={{ marginBottom: 8, color: '#334155' }}>Belum ada data material</h3>
            <p style={{ color: '#64748b', fontSize: 13, maxWidth: 400, margin: '0 auto' }}>
              Upload file Excel yang berisi daftar material atau barang yang dibutuhkan. Sistem akan otomatis membuat ringkasan.
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([pid, items]) => {
            const isLegacy = pid === 'legacy';
            const projName = isLegacy ? 'Data Lama' : items[0].projectName;
            const received = items.filter(i => i.status === 'diterima' || i.status === 'dibelikan').length;
            const total = items.length;
            const percent = total > 0 ? Math.round((received / total) * 100) : 0;
            const isExpanded = expandedProjects[pid] ?? true;

            return (
              <div key={pid} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isExpanded ? '#f8fafc' : '#fff', cursor: 'pointer', borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none' }} onClick={() => toggleExpand(pid)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--v-from)', color: '#fff', display: 'grid', placeItems: 'center' }}>
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 15, color: '#1e293b' }}>{projName}</h3>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{total} item</span>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1' }}></span>
                        <span>{received} diterima</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 150 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: percent === 100 ? '#10b981' : 'var(--v-from)', transition: 'width 0.3s' }}></div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: percent === 100 ? '#10b981' : '#64748b', width: 35 }}>{percent}%</div>
                    </div>
                    
                    {projectToDelete === pid ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: 12, color: '#ef4444', background: '#fee2e2' }} onClick={(e) => { e.stopPropagation(); confirmDelete(); }}>Ya, Hapus</button>
                        <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: 12 }} onClick={(e) => { e.stopPropagation(); setProjectToDelete(null); }}>Batal</button>
                      </div>
                    ) : (
                      <button className="btn-ghost" style={{ padding: 6 }} onClick={(e) => { e.stopPropagation(); setProjectToDelete(pid); }} title="Hapus Proyek">
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                    )}
                    {isExpanded ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
                  </div>
                </div>
                
                {isExpanded && (
                  <div style={{ padding: '0' }}>
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th style={{ width: 60, textAlign: 'center' }}>Check</th>
                          <th>Nama Barang</th>
                          <th style={{ width: 120 }}>Qty / Satuan</th>
                          <th style={{ width: 140 }}>Status</th>
                          <th style={{ width: 160 }}>Tanggal / Waktu</th>
                          <th style={{ width: 140 }}>Keterangan</th>
                          <th>Catatan (Manual)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(item => (
                          <tr key={item.id} style={{ opacity: item.status === 'diterima' || item.status === 'batal' ? 0.6 : 1 }}>
                            <td style={{ textAlign: 'center' }}>
                              <button 
                                onClick={() => toggleStatus(item.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                              >
                                {item.status === 'diterima' ? <CheckCircle size={20} color="#10b981" /> : <Circle size={20} color="#cbd5e1" />}
                              </button>
                            </td>
                            <td style={{ fontWeight: 500, textDecoration: item.status === 'diterima' || item.status === 'batal' ? 'line-through' : 'none' }}>
                              {item.itemName}
                            </td>
                            <td>
                              <span style={{ fontWeight: 700 }}>{item.qty}</span> <span style={{ fontSize: 11, color: '#64748b' }}>{item.unit}</span>
                            </td>
                            <td>
                              <select 
                                value={item.status || 'belum'} 
                                onChange={(e) => toggleStatus(item.id, e.target.value)}
                                className="form-input"
                                style={{ padding: '4px 8px', fontSize: 12, height: 'auto', minHeight: 0, borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', width: '100%' }}
                              >
                                <option value="belum">Belum</option>
                                <option value="pemesanan">Pemesanan</option>
                                <option value="pembelian">Pembelian</option>
                                <option value="pengiriman">Pengiriman</option>
                                <option value="diterima">Diterima</option>
                                <option value="batal">Batal</option>
                              </select>
                            </td>
                            <td style={{ fontSize: 11, color: '#64748b' }}>
                              {item.statusTimestamps && item.statusTimestamps[item.status] ? (
                                <div>
                                  {new Date(item.statusTimestamps[item.status]).toLocaleString('id-ID', {
                                    day: '2-digit', month: 'short', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                  })}
                                </div>
                              ) : '-'}
                              {item.status === 'pembelian' && item.statusTimestamps?.pemesanan && item.statusTimestamps?.pembelian && (
                                <div style={{ color: '#8b5cf6', marginTop: 2, fontWeight: 600 }}>
                                  ({Math.round((new Date(item.statusTimestamps.pembelian).getTime() - new Date(item.statusTimestamps.pemesanan).getTime()) / (1000 * 60 * 60 * 24))} hari dr pesan)
                                </div>
                              )}
                              {item.status === 'diterima' && item.statusTimestamps?.pembelian && item.statusTimestamps?.diterima && (
                                <div style={{ color: '#10b981', marginTop: 2, fontWeight: 600 }}>
                                  ({Math.round((new Date(item.statusTimestamps.diterima).getTime() - new Date(item.statusTimestamps.pembelian).getTime()) / (1000 * 60 * 60 * 24))} hari dr beli)
                                </div>
                              )}
                            </td>
                            <td style={{ fontSize: 12, color: '#64748b' }}>
                              {item.status === 'belum' && 'Menunggu diproses'}
                              {item.status === 'pemesanan' && 'Sedang dipesan'}
                              {item.status === 'pembelian' && 'Sedang dibeli / diproses'}
                              {item.status === 'pengiriman' && 'Dalam perjalanan'}
                              {item.status === 'diterima' && 'Telah disimpan di gudang'}
                              {item.status === 'batal' && 'Dibatalkan'}
                            </td>
                            <td>
                              <input 
                                type="text" 
                                value={item.remark || ''} 
                                onChange={(e) => updateRemark(item.id, e.target.value)}
                                placeholder="Ketik catatan..."
                                className="form-input"
                                style={{ padding: '4px 8px', fontSize: 12, height: 'auto', minHeight: 0, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', width: '100%' }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
