import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useStore, THEMES } from '../store/useStore';
import { cn } from '../lib/utils';
import { Menu, LayoutDashboard, BarChart3, CalendarDays, Package, Users, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dashboard } from '../pages/Dashboard';





export function Sidebar() {
  const { logo, theme, isSidebarOpen, setSidebarOpen, appName } = useStore();
  const currentTheme = THEMES.find(t => t.key === theme) || THEMES[0];

  return (
    <>
      <div className={cn("sidebar-overlay", isSidebarOpen && "open")} onClick={() => setSidebarOpen(false)}></div>
      <aside className={cn("sidebar", isSidebarOpen ? "open" : "collapsed")}>
        <div className="sidebar-inner">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <img src={logo || '/vanzline-logo.png'} alt="V" onError={(e) => { (e.target as HTMLImageElement).src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%23ecfeff' stroke='%2338bdf8' stroke-width='3'/><text x='50' y='60' text-anchor='middle' font-size='32' fill='%230e7490' font-weight='900'>V</text></svg>`; }} />
            </div>
            <div className="sidebar-brand-text">
              <div className="name"><span className="v-grad-text">{appName.slice(0, 4)}</span><span style={{color:'#1e293b'}}>{appName.slice(4)}</span></div>
              <div className="tag">Project Suite</div>
            </div>
          </div>
          <div className="sidebar-divider"></div>
          <div className="sidebar-nav-title">Menu Utama</div>
          <nav className="sidebar-nav">
            <NavLink to="/" className={({ isActive }) => cn("nav-item", isActive && "active")} end>
              <span className="nav-icon"><LayoutDashboard size={20} /></span>
              <div className="nav-label">Dashboard<div className="nav-sub">Ringkasan keseluruhan</div></div>
            </NavLink>
            <NavLink to="/progress" className={({ isActive }) => cn("nav-item", isActive && "active")}>
              <span className="nav-icon"><BarChart3 size={20} /></span>
              <div className="nav-label">Progress<div className="nav-sub">Chart & log progres</div></div>
            </NavLink>
            <NavLink to="/timeline" className={({ isActive }) => cn("nav-item", isActive && "active")}>
              <span className="nav-icon"><CalendarDays size={20} /></span>
              <div className="nav-label">Timeline<div className="nav-sub">Gantt chart interaktif</div></div>
            </NavLink>
            <NavLink to="/material" className={({ isActive }) => cn("nav-item", isActive && "active")}>
              <span className="nav-icon"><Package size={20} /></span>
              <div className="nav-label">Material Request<div className="nav-sub">Pengadaan material</div></div>
            </NavLink>
            <NavLink to="/personil" className={({ isActive }) => cn("nav-item", isActive && "active")}>
              <span className="nav-icon"><Users size={20} /></span>
              <div className="nav-label">Personil<div className="nav-sub">Daftar & kehadiran</div></div>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => cn("nav-item", isActive && "active")}>
              <span className="nav-icon"><Settings size={20} /></span>
              <div className="nav-label">Pengaturan<div className="nav-sub">Tema & profil aplikasi</div></div>
            </NavLink>
          </nav>
          
          <div className="sidebar-footer">
            <div className="line"><span className="dot"></span>System Online</div>
            <div className="slogan">Track your plan,<br/>follow the line.</div>
          </div>
        </div>
        <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </aside>
    </>
  );
}

export function Layout() {
  const { isSidebarOpen, setSidebarOpen, backgroundImage } = useStore();
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <div className="app" style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {}}>
      <button className="mobile-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
        <Menu className="w-5 h-5 text-gray-700" />
      </button>
      <Sidebar />
      <main className="main">
        <div style={{ 
          position: isDashboard ? 'relative' : 'absolute',
          visibility: isDashboard ? 'visible' : 'hidden',
          opacity: isDashboard ? 1 : 0,
          left: isDashboard ? 0 : -9999,
          pointerEvents: isDashboard ? 'auto' : 'none',
          width: '100%',
          height: '100%'
        }}>
          <Dashboard />
        </div>
        {!isDashboard && <Outlet />}
      </main>
    </div>
  );
}
