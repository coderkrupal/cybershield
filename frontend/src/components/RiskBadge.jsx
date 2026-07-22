import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, HelpCircle } from 'lucide-react';

export default function RiskBadge({ score, reasons = [], customStatus = null }) {
  // Determine threat level and styles
  let status = 'Safe';
  let badgeColor = 'var(--color-safe)';
  let glowClass = 'pulse-safe';
  let Icon = ShieldCheck;
  
  if (score >= 70) {
    status = 'Critical';
    badgeColor = 'var(--color-danger)';
    glowClass = 'pulse-danger';
    Icon = ShieldX;
  } else if (score > 0) {
    status = 'Suspicious';
    badgeColor = 'var(--color-warning)';
    glowClass = 'pulse-warning';
    Icon = ShieldAlert;
  }

  // Override if custom status is supplied
  if (customStatus) {
    status = customStatus;
    if (status === 'Safe') {
      badgeColor = 'var(--color-safe)';
      glowClass = 'pulse-safe';
      Icon = ShieldCheck;
    } else if (status === 'Suspicious') {
      badgeColor = 'var(--color-warning)';
      glowClass = 'pulse-warning';
      Icon = ShieldAlert;
    } else if (status === 'Critical') {
      badgeColor = 'var(--color-danger)';
      glowClass = 'pulse-danger';
      Icon = ShieldX;
    }
  }

  return (
    <div className="tooltip-container" style={{ display: 'inline-flex', alignItems: 'center' }}>
      <div 
        className={glowClass}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 16px',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          border: `1px solid ${badgeColor}`,
          borderRadius: '24px',
          color: badgeColor,
          fontWeight: '700',
          fontSize: '0.9rem',
          letterSpacing: '0.5px',
          transition: 'var(--transition-smooth)'
        }}
      >
        <Icon size={18} />
        <span>{status.toUpperCase()}</span>
        <span style={{
          backgroundColor: badgeColor,
          color: '#070a13',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: '800',
          marginLeft: '4px'
        }}>
          {score}/100
        </span>
      </div>

      {/* Tooltip Breakdown */}
      <div className="tooltip-box" style={{ 
        width: '320px', 
        borderLeft: `4px solid ${badgeColor}`,
        bottom: '130%',
        padding: '16px'
      }}>
        <h4 style={{ 
          fontSize: '0.95rem', 
          fontWeight: 700, 
          color: '#fff', 
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          Risk Factor Breakdown
        </h4>
        
        {reasons.length === 0 ? (
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            No security threats or anomalies detected. This asset conforms to safe specifications.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reasons.map((r, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                fontSize: '0.8rem',
                borderBottom: i < reasons.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                paddingBottom: i < reasons.length - 1 ? '8px' : '0'
              }}>
                <div style={{ paddingRight: '12px' }}>
                  <span style={{ 
                    fontWeight: 600, 
                    color: r.severity === 'Critical' || r.severity === 'High' ? 'var(--color-danger)' : 'var(--color-warning)',
                    marginRight: '6px',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>
                    [{r.severity}]
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{r.factor}</span>
                </div>
                <div style={{ fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap' }}>
                  +{r.points} pts
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div style={{ 
          marginTop: '12px', 
          paddingTop: '8px', 
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontSize: '0.725rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <HelpCircle size={12} />
          <span>Scores &gt; 70 signify Critical Threat.</span>
        </div>
      </div>
    </div>
  );
}
