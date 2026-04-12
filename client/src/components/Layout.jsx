import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, LogOut, GraduationCap, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'AD';

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={16} />, label: 'Dashboard', end: true },
    { to: '/students', icon: <Users size={16} />, label: 'Students' },
    { to: '/tasks', icon: <ClipboardList size={16} />, label: 'Tasks & Assignments' },
  ];

  return (
    <div className="layout">
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">🎓</div>
          <div>
            <div className="logo-text">EduAdmin</div>
            <div className="logo-sub">SCHOOL MANAGEMENT</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">Administrator</div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleLogout}
              title="Logout"
              style={{ padding: '6px' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <button
            className="btn btn-ghost"
            style={{ display: 'none' }}
            id="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <span className="topbar-title">
            <GraduationCap size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: 'var(--accent)' }} />
            School Management System
          </span>
          <div className="topbar-right">
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Welcome, <span style={{ color: 'var(--text)', fontWeight: 600 }}>{user?.name}</span>
            </div>
          </div>
        </header>

        <div className="page">
          <Outlet />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}