import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, ChevronDown, LogOut, ShieldCheck, Upload, User as UserIcon } from 'lucide-react';

const Navbar = ({ onNavigate, currentPage }) => {
  const { user, logout } = useAuth();

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(18px)', borderBottom: '1px solid var(--border-glass)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.9rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('dashboard')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div className="brand-mark">
            <ShieldCheck size={25} />
          </div>
          <div>
            <span style={{ fontSize: '1.28rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
              TrustStamp
            </span>
            <span style={{ fontSize: '1.28rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginLeft: '0.2rem' }}>
              AI
            </span>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Verify. Trust. Confidently.</div>
          </div>
        </div>

        {/* User Actions */}
        {user && (
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', minWidth: 0 }}>
            <button 
              onClick={() => onNavigate('dashboard')} 
              className="btn btn-secondary nav-dashboard-button" 
              style={{ padding: '0.55rem 1rem', fontSize: '0.9rem', borderColor: currentPage === 'dashboard' ? 'var(--primary)' : 'var(--border-glass)', color: currentPage === 'dashboard' ? 'var(--primary)' : 'var(--text-main)' }}
            >
              Dashboard
            </button>
            <button 
              onClick={() => onNavigate('upload')} 
              className="btn btn-primary" 
              style={{ padding: '0.55rem 1rem', fontSize: '0.9rem' }}
            >
              <Upload size={16} /> New Analysis
            </button>
            <button className="btn btn-secondary" title="Notifications" style={{ padding: '0.62rem', borderRadius: '999px', width: 40, height: 40 }}>
              <Bell size={17} />
            </button>

            {/* Profile Dropdown Simulation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', borderLeft: '1px solid var(--border-glass)', paddingLeft: '0.9rem', minWidth: 0 }}>
              <div className="nav-user-meta" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 0 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.full_name || user.email}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Free Plan</span>
              </div>
              <div style={{ background: '#EEF0FF', borderRadius: '9999px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-glass)' }}>
                <UserIcon size={16} color="var(--primary)" />
              </div>
              <ChevronDown size={16} color="var(--text-muted)" />
              <button 
                onClick={logout} 
                className="btn btn-danger" 
                style={{ padding: '0.5rem', borderRadius: '8px' }} 
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
