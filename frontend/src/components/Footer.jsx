import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '40px 24px 24px',
      color: 'var(--text-muted)',
      fontSize: '0.875rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldAlert size={16} />
        <span>CyberShield Sandbox Environment. Powered by MERN.</span>
      </div>
      <p>© {new Date().getFullYear()} CyberShield. Designed for proactive threat mitigation.</p>
    </footer>
  );
}
