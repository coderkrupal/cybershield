import React from 'react';
import { Shield, Globe, FileText, AlertTriangle, Key, BookOpen } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Domain Scan', icon: Globe },
    { id: 'files', label: 'File Inspect', icon: FileText },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'canary', label: 'Honeytokens', icon: Key },
    { id: 'guide', label: 'Safety Academy', icon: BookOpen },
  ];

  return (
    <header className="glass-panel header-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
        <div style={{
          background: 'linear-gradient(135deg, var(--cyber-blue) 0%, var(--cyber-purple) 100%)',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
        }}>
          <Shield size={22} color="#070a13" strokeWidth={2.5} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.5px', background: 'linear-gradient(to right, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CYBER<span style={{ color: 'var(--cyber-blue)', WebkitTextFillColor: 'initial' }}>SHIELD</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '-2px' }}>Real-time Threat Intelligence</p>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={isActive ? '' : 'cyber-btn-secondary'}
              style={isActive ? {
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid var(--cyber-blue)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--cyber-blue)',
                fontWeight: 600,
                padding: '10px 18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'var(--transition-smooth)'
              } : {
                padding: '10px 18px',
                border: '1px solid transparent',
                fontSize: '0.95rem',
                fontWeight: 500
              }}
            >
              <Icon size={18} />
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
