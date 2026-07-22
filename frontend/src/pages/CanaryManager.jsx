import React, { useState, useEffect } from 'react';
import { Key, Plus, Copy, Check, RefreshCw, Globe, AlertTriangle, Eye, Trash2, ArrowRight } from 'lucide-react';

export default function CanaryManager() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeToken, setActiveToken] = useState(null);
  const [tokenLogs, setTokenLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tokenType, setTokenType] = useState('link');
  const [createdToken, setCreatedToken] = useState(null);
  const [copiedText, setCopiedText] = useState(false);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/tracker');
      const data = await res.json();
      setTokens(data);
    } catch (err) {
      console.error('Error fetching canary tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (tokenId) => {
    try {
      setLogsLoading(true);
      const res = await fetch(`http://localhost:5000/api/tracker/${tokenId}/logs`);
      const data = await res.json();
      setTokenLogs(data);
    } catch (err) {
      console.error('Error fetching token logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleCreateToken = async (e) => {
    e.preventDefault();
    if (!title) return;

    try {
      const res = await fetch('http://localhost:5000/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, tokenType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create Honeytoken');

      setCreatedToken(data);
      setTitle('');
      setDescription('');
      fetchTokens();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectToken = (token) => {
    setActiveToken(token);
    fetchLogs(token.tokenId);
  };

  const handleDeleteToken = async (tokenId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this Honeytoken and all its logs?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/tracker/${tokenId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchTokens();
        if (activeToken && activeToken.tokenId === tokenId) {
          setActiveToken(null);
          setTokenLogs([]);
        }
      }
    } catch (err) {
      console.error('Error deleting token:', err);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="dashboard-grid">
      <div className="col-12" style={{ textAlign: 'center', margin: '20px 0 10px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Honeytoken Canary Generator</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '8px auto 0' }}>
          Generate invisible tracking links and 1x1 pixels. Embed them in private folders, emails, or spreadsheets to detect intruders or data scrapers instantly.
        </p>
      </div>

      {/* Creator Form */}
      <div className="col-4 glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} color="var(--cyber-blue)" /> Generate Honeytoken
        </h3>

        <form onSubmit={handleCreateToken}>
          <div className="form-group">
            <label>Token Label / Title *</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="e.g. Secret Password Spreadsheet" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required
            />
          </div>

          <div className="form-group">
            <label>Purpose / Description</label>
            <textarea 
              rows={3} 
              className="glass-input" 
              placeholder="Where will you put this token? (e.g. desktop folder, config file)" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'none', fontFamily: 'inherit' }}
            />
          </div>

          <div className="form-group">
            <label>Token Delivery Type</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, padding: '10px', border: '1px solid var(--border-glass)', borderRadius: '6px', background: tokenType === 'link' ? 'rgba(56,189,248,0.05)' : 'transparent' }}>
                <input type="radio" name="tokenType" value="link" checked={tokenType === 'link'} onChange={() => setTokenType('link')} style={{ accentColor: 'var(--cyber-blue)' }} />
                <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>URL Link</span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Trigger on click</span>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1, padding: '10px', border: '1px solid var(--border-glass)', borderRadius: '6px', background: tokenType === 'pixel' ? 'rgba(56,189,248,0.05)' : 'transparent' }}>
                <input type="radio" name="tokenType" value="pixel" checked={tokenType === 'pixel'} onChange={() => setTokenType('pixel')} style={{ accentColor: 'var(--cyber-blue)' }} />
                <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Invisible Pixel</span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Trigger on load</span>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" className="cyber-btn" style={{ width: '100%', marginTop: '10px' }}>
            Generate Canary Token
            <Key size={16} />
          </button>
        </form>

        {createdToken && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(56,189,248,0.03)', border: '1px solid var(--cyber-blue)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--cyber-blue)', fontWeight: 600, marginBottom: '6px' }}>Canary Token Ready!</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Copy this token and place it in your honeypot files or HTML emails.
            </p>
            
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <input 
                type="text" 
                className="glass-input" 
                readOnly 
                value={createdToken.tokenType === 'link' 
                  ? `http://localhost:5000/api/tracker/hit/${createdToken.tokenId}` 
                  : `<img src="http://localhost:5000/api/tracker/hit/${createdToken.tokenId}/pixel.png" width="1" height="1" />`
                }
                style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}
              />
              <button 
                className="cyber-btn-secondary" 
                onClick={() => handleCopyToClipboard(createdToken.tokenType === 'link' 
                  ? `http://localhost:5000/api/tracker/hit/${createdToken.tokenId}` 
                  : `<img src="http://localhost:5000/api/tracker/hit/${createdToken.tokenId}/pixel.png" width="1" height="1" />`
                )}
                style={{ padding: '8px 12px' }}
                title="Copy token deployment text"
              >
                {copiedText ? <Check size={16} color="var(--color-safe)" /> : <Copy size={16} />}
              </button>
            </div>
            
            <button className="cyber-btn-secondary" onClick={() => setCreatedToken(null)} style={{ fontSize: '0.75rem', padding: '6px 12px', width: '100%' }}>
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Tokens List & Logs View */}
      <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Token Inventory */}
        <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Canary Inventory</h3>
            <button className="cyber-btn-secondary" onClick={fetchTokens} style={{ padding: '8px 14px' }}>
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>

          {tokens.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '40px 0' }}>No honeytokens generated yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
              {tokens.map(token => {
                const isSelected = activeToken && activeToken.tokenId === token.tokenId;
                return (
                  <div 
                    key={token.tokenId} 
                    onClick={() => handleSelectToken(token)}
                    className="glass-panel"
                    style={{ 
                      padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                      border: isSelected ? '1px solid var(--cyber-blue)' : '1px solid var(--border-glass)',
                      background: isSelected ? 'rgba(56,189,248,0.03)' : 'var(--bg-card)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{token.title}</span>
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                          {token.tokenType}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>{token.description || 'No description provided'}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Triggers</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: token.hitCount > 0 ? 'var(--color-danger)' : 'var(--color-safe)' }}>
                          {token.hitCount}
                        </span>
                      </div>
                      <button onClick={(e) => handleDeleteToken(token.tokenId, e)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Trash2 size={16} onMouseEnter={(e) => e.target.style.color = 'var(--color-danger)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Telemetry Logs */}
        <div className="glass-panel" style={{ padding: '24px', flex: 1.2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Telemetry Logs</h3>
              {activeToken && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Selected: <strong style={{ color: 'var(--cyber-blue)' }}>{activeToken.title}</strong></p>}
            </div>
            {activeToken && (
              <button className="cyber-btn-secondary" onClick={() => fetchLogs(activeToken.tokenId)} disabled={logsLoading} style={{ padding: '8px 14px' }}>
                <RefreshCw size={14} className={logsLoading ? 'spin-anim' : ''} />
                <span>Refresh Logs</span>
              </button>
            )}
          </div>

          {!activeToken ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '40px 0' }}>Select a Canary Token above to audit access attempts.</p>
          ) : logsLoading && tokenLogs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading access logs...</p>
          ) : tokenLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '45px 0', border: '1px dashed var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
              <Globe size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p style={{ fontSize: '0.85rem' }}>No hits detected yet. The bait is waiting...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '8px' }}>
              {tokenLogs.map(log => (
                <div key={log._id} style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-danger)' }}>{log.ip}</span>
                      <span style={{ fontSize: '0.75rem', padding: '1px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                        {log.browser} • {log.os}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Referrer: <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{log.referrer}</span>
                    </p>
                    <details style={{ marginTop: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <summary style={{ cursor: 'pointer', outline: 'none' }}>View Header Payload</summary>
                      <pre style={{ 
                        marginTop: '6px', padding: '8px', background: '#090d16', border: '1px solid var(--border-glass)', borderRadius: '4px', 
                        overflowX: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', color: 'var(--text-secondary)'
                      }}>
                        {JSON.stringify(log.headers, null, 2)}
                      </pre>
                    </details>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(log.accessedAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
