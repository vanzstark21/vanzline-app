import React, { useRef } from 'react';
import { useStore, THEMES, Theme } from '../store/useStore';

export function Settings() {
  const { theme, setTheme, logo, setLogo, setSidebarOpen, appName, appCaption } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setLogo(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => setLogo('');

  return (
    <div className="page active">
      <div className="page-head">
        <div className="page-head-left"><div className="page-head-icon">⚙️</div>
          <div><h1>Pengaturan</h1><p>Sesuaikan tampilan dan konfigurasi sistem.</p></div></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="mb-4">Tampilan & Tema</h3>
          <p className="text-sm text-slate mb-4">Pilih tema warna aplikasi. Perubahan akan langsung diterapkan ke seluruh komponen.</p>
          
          <div className="grid-2">
            {THEMES.map(t => (
              <div key={t.key} className={`theme-card ${theme === t.key ? 'active' : ''}`} onClick={() => setTheme(t.key as Theme)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div className="text-sm font-bold" style={{ color: '#1e293b' }}>{t.label}</div>
                  {theme === t.key && <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--v-from)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 10 }}>✓</div>}
                </div>
                <div className="theme-swatches">
                  <span style={{ background: t.from }}></span>
                  <span style={{ background: t.to }}></span>
                  <span style={{ background: t.text }}></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4">Branding Perusahaan</h3>
          
          <div className="form-row mb-6">
            <label className="form-label">Nama Aplikasi / Perusahaan</label>
            <input type="text" className="form-input" value={appName || ''} onChange={e => useStore.getState().setAppName(e.target.value)} />
          </div>

          <div className="form-row mb-6">
            <label className="form-label">Slogan / Keterangan Dashboard</label>
            <input type="text" className="form-input" value={appCaption || ''} onChange={e => useStore.getState().setAppCaption(e.target.value)} />
          </div>

          <p className="text-sm text-slate mb-4">Logo akan ditampilkan di sidebar dan area lain yang relevan.</p>
          
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, border: '2px dashed #cbd5e1', display: 'grid', placeItems: 'center', overflow: 'hidden', background: '#f8fafc' }}>
              {logo ? <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 24, color: '#cbd5e1' }}>🖼️</span>}
            </div>
            <div>
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleLogoUpload} />
              <button className="btn-primary mb-2" onClick={() => fileInputRef.current?.click()}>Upload Logo Baru</button>
              {logo && <div style={{ marginTop: 8 }}><button className="btn-ghost btn-rose" onClick={removeLogo}>Hapus Logo</button></div>}
              <div className="text-xs text-muted mt-2">Format: JPG, PNG, SVG (Max 2MB)</div>
            </div>
          </div>
          
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid #e2e8f0' }}>
            <h3 className="mb-4">Informasi Sistem</h3>
            <div className="form-row cols-2">
              <div><div className="text-xs text-muted">Versi</div><div className="text-sm font-bold text-slate">Vanzline v1.0.0</div></div>
              <div><div className="text-xs text-muted">Database</div><div className="text-sm font-bold text-slate">Local Storage (Zustand)</div></div>
              <div><div className="text-xs text-muted">Lisensi</div><div className="text-sm font-bold text-slate">Hak Milik Penuh</div></div>
              <div><div className="text-xs text-muted">Developer</div><div className="text-sm font-bold text-slate">Evan Aldian</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
