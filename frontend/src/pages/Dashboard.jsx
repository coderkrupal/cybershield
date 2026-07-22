import React, { useState } from 'react';
import { Globe, Clipboard, ShieldCheck, AlertCircle, HelpCircle, ArrowRight, ShieldAlert, Mail } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';

export default function Dashboard() {
  const [activeSubTab, setActiveSubTab] = useState('phish');

  // Phishing / Homoglyph Inspector States
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // DNS Spoofing Auditor States
  const [dnsInput, setDnsInput] = useState('');
  const [dnsLoading, setDnsLoading] = useState(false);
  const [dnsResult, setDnsResult] = useState(null);
  const [dnsError, setDnsError] = useState(null);

  const handleScan = async (targetUrl) => {
    if (!targetUrl || !targetUrl.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/scan/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan URL');
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during domain scanning.');
    } finally {
      setLoading(false);
    }
  };

  const handleDnsScan = async (targetDomain) => {
    if (!targetDomain || !targetDomain.trim()) return;
    setDnsLoading(true);
    setDnsError(null);
    setDnsResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/scan/dns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: targetDomain }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve DNS records');
      }

      setDnsResult(data);
    } catch (err) {
      console.error(err);
      setDnsError(err.message || 'An error occurred during DNS scanning.');
    } finally {
      setDnsLoading(false);
    }
  };

  const handleClipboardScan = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text);
        handleScan(text);
      } else {
        setError('Clipboard is empty or permissions were denied.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to read clipboard. Please paste manually or grant permissions.');
    }
  };

  return (
    <div className="dashboard-grid">
      <div className="col-12" style={{ textAlign: 'center', margin: '20px 0 10px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Domain Safety Control Center</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '8px auto 0' }}>
          Audit domain spoofability vulnerabilities in real-time or scan target URLs for typosquatting and unicode homograph attacks.
        </p>
      </div>

      {/* Sub tabs navigation */}
      <div className="col-12 glass-panel" style={{ padding: '6px', borderRadius: '12px', display: 'inline-flex', gap: '8px', maxWidth: '480px', margin: '10px auto 20px', justifyContent: 'center' }}>
        <button 
          onClick={() => setActiveSubTab('phish')}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
            background: activeSubTab === 'phish' ? 'var(--cyber-blue)' : 'transparent',
            color: activeSubTab === 'phish' ? '#070a13' : 'var(--text-secondary)',
            transition: 'var(--transition-smooth)'
          }}
        >
          URL Phish & IDN Homoglyph
        </button>
        <button 
          onClick={() => setActiveSubTab('dns')}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
            background: activeSubTab === 'dns' ? 'var(--cyber-blue)' : 'transparent',
            color: activeSubTab === 'dns' ? '#070a13' : 'var(--text-secondary)',
            transition: 'var(--transition-smooth)'
          }}
        >
          DNS Email Spoof Auditor
        </button>
      </div>

      {/* ========================================================
          SUBTAB 1: PHISHING & HOMOGLYPH CHECKER
          ======================================================== */}
      {activeSubTab === 'phish' && (
        <>
          <div className="col-12 glass-panel" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                <Globe size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="Enter domain or paste URL to inspect (e.g. paypa1.com, gооgle.com)" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  style={{ paddingLeft: '48px' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan(urlInput)}
                />
              </div>
              <button className="cyber-btn" onClick={() => handleScan(urlInput)} disabled={loading}>
                {loading ? 'Inspecting...' : 'Scan Domain'}
                <ArrowRight size={18} />
              </button>
              <button className="cyber-btn-secondary" onClick={handleClipboardScan}>
                <Clipboard size={18} />
                <span>Scan Clipboard</span>
              </button>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', marginTop: '16px', fontSize: '0.9rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {result && (
            <div className="col-12 glass-panel" style={{ padding: '32px', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Analysis Report</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                    Target: <strong style={{ color: 'var(--cyber-blue)', fontFamily: 'monospace' }}>{result.rawDomain}</strong>
                  </p>
                </div>
                <RiskBadge score={result.riskScore} reasons={result.riskReasons} />
              </div>

              <div className="responsive-cols">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--cyber-blue)', marginBottom: '12px' }}>Domain Resolution Details</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>Unicode domain:</td>
                          <td style={{ padding: '8px 0', fontWeight: 600, textAlign: 'right', fontFamily: 'monospace' }}>{result.unicodeDomain}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>ASCII / Punycode:</td>
                          <td style={{ padding: '8px 0', fontWeight: 600, textAlign: 'right', fontFamily: 'monospace', color: result.isPunycode ? 'var(--color-warning)' : 'inherit' }}>
                            {result.asciiDomain}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>IDN status:</td>
                          <td style={{ padding: '8px 0', fontWeight: 600, textAlign: 'right', color: result.isPunycode ? 'var(--color-warning)' : 'var(--color-safe)' }}>
                            {result.isPunycode ? 'Punycode Redirection' : 'Standard ASCII'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {result.containsHomoglyphs && (
                    <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-danger)', marginBottom: '8px' }}>IDN Homograph Alert (Lookalikes)</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        This domain uses visual impostor letters to spoof standard brands.
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {result.homoglyphsFound.map((glyph, index) => (
                          <div key={index} style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', fontSize: '0.8rem' }}>
                            Glyph <strong style={{ color: '#fff', fontFamily: 'monospace' }}>"{glyph.char}"</strong> replacing Latin <strong style={{ color: 'var(--cyber-blue)', fontFamily: 'monospace' }}>"{glyph.replaces}"</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--cyber-blue)', marginBottom: '12px' }}>Typosquatting Assessment</h4>
                    {result.typosquattingMatch ? (
                      <div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          Potential brand spoofing! Matches corporate brand:
                        </p>
                        <div style={{ margin: '12px 0', padding: '10px 14px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid var(--color-warning)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-warning)' }}>{result.typosquattingMatch.brand}</span>
                          <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '10px', color: 'var(--color-warning)' }}>
                            Distance: {result.typosquattingMatch.distance} edits
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-safe)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} /> No typosquatting matches detected.
                      </p>
                    )}
                  </div>

                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--cyber-blue)', marginBottom: '12px' }}>Phishing Keywords Scan</h4>
                    {result.suspiciousKeywordsFound.length > 0 ? (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {result.suspiciousKeywordsFound.map((kw, i) => (
                          <span key={i} style={{ padding: '4px 10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-warning)' }}>
                            {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-safe)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} /> No phishing indicators found.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================
          SUBTAB 2: DNS & EMAIL SPOOFING AUDITOR (NEW FEATURE)
          ======================================================== */}
      {activeSubTab === 'dns' && (
        <>
          <div className="col-12 glass-panel" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                <Mail size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="Enter corporate domain to audit spoofability (e.g. google.com, chase.com, test.com)" 
                  value={dnsInput}
                  onChange={(e) => setDnsInput(e.target.value)}
                  style={{ paddingLeft: '48px' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleDnsScan(dnsInput)}
                />
              </div>
              <button className="cyber-btn" onClick={() => handleDnsScan(dnsInput)} disabled={dnsLoading}>
                {dnsLoading ? 'Resolving records...' : 'Audit Spoofing Security'}
                <ArrowRight size={18} />
              </button>
            </div>

            {dnsError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', marginTop: '16px', fontSize: '0.9rem' }}>
                <AlertCircle size={16} />
                <span>{dnsError}</span>
              </div>
            )}
          </div>

          {dnsResult && (
            <div className="col-12 glass-panel" style={{ padding: '32px', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Spoofability Vulnerability Audit</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                    Domain under inspection: <strong style={{ color: 'var(--cyber-blue)', fontFamily: 'monospace' }}>{dnsResult.domain}</strong>
                  </p>
                </div>
                <RiskBadge score={dnsResult.riskScore} reasons={dnsResult.riskReasons} customStatus={dnsResult.status} />
              </div>

              <div className="responsive-cols">
                {/* SPF and DMARC Audit Panels */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* SPF Check Card */}
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--cyber-blue)' }}>SPF (Sender Policy Framework)</h4>
                      <span style={{ 
                        fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                        backgroundColor: dnsResult.spf.security === 'Safe' ? 'rgba(16,185,129,0.1)' : dnsResult.spf.security === 'Moderate' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                        color: dnsResult.spf.security === 'Safe' ? 'var(--color-safe)' : dnsResult.spf.security === 'Moderate' ? 'var(--color-warning)' : 'var(--color-danger)'
                      }}>
                        {dnsResult.spf.security.toUpperCase()}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '10px' }}>
                      {dnsResult.spf.explanation}
                    </p>
                    
                    <div style={{ background: '#090d16', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-glass)', fontSize: '0.75rem', fontFamily: 'monospace', overflowX: 'auto' }}>
                      {dnsResult.spf.record ? dnsResult.spf.record : 'No SPF record found in TXT lookups.'}
                    </div>
                  </div>

                  {/* DMARC Check Card */}
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--cyber-blue)' }}>DMARC Alignment Policy</h4>
                      <span style={{ 
                        fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                        backgroundColor: dnsResult.dmarc.security === 'Safe' ? 'rgba(16,185,129,0.1)' : dnsResult.dmarc.security === 'Good' ? 'rgba(56,189,248,0.1)' : 'rgba(239,68,68,0.1)',
                        color: dnsResult.dmarc.security === 'Safe' ? 'var(--color-safe)' : dnsResult.dmarc.security === 'Good' ? 'var(--cyber-blue)' : 'var(--color-danger)'
                      }}>
                        {dnsResult.dmarc.security.toUpperCase()}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '10px' }}>
                      {dnsResult.dmarc.explanation}
                    </p>

                    <div style={{ background: '#090d16', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-glass)', fontSize: '0.75rem', fontFamily: 'monospace', overflowX: 'auto' }}>
                      {dnsResult.dmarc.record ? dnsResult.dmarc.record : 'No DMARC record found at _dmarc TXT record.'}
                    </div>
                  </div>
                </div>

                {/* MX Records & Explanations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* MX Record Inventory */}
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--cyber-blue)', marginBottom: '12px' }}>Authorized Mail Relays (MX)</h4>
                    {dnsResult.mxRecords.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No MX routing records found. This domain cannot receive emails.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                        {dnsResult.mxRecords.map((mx, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '6px 10px', background: 'rgba(15,23,42,0.4)', border: '1px solid var(--border-glass)', borderRadius: '4px', fontFamily: 'monospace' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{mx.exchange}</span>
                            <span style={{ fontWeight: 600, color: 'var(--cyber-blue)' }}>Priority: {mx.priority}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Threat Context Explainer */}
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--color-warning)', padding: '4px' }}><ShieldAlert size={20} /></div>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>How do attackers exploit DNS?</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        SMTP (email protocol) allows servers to put any address in the "From" header. SPF whitelists sender IP ranges. DMARC tells receiver mail servers to enforce SPF rules and block spoofers. If DMARC or SPF is missing, any intruder can forge emails mimicking the brand name and deliver them cleanly to user inboxes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Domain security tips */}
      {!result && !dnsResult && !loading && !dnsLoading && (
        <div className="col-12 glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ padding: '10px', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '50%', color: 'var(--cyber-blue)' }}>
            <Globe size={24} />
          </div>
          <div>
            <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>Audit and Inspection Tools</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Toggle between the **URL Phish & IDN Homoglyph** scan to inspect copy-pasted web links, or the **DNS Email Spoof Auditor** to evaluate DNS record whitelisting vulnerability (MX/SPF/DMARC) in real-time. Protect your organization from visual and structural impersonation attacks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
