import React, { useState, useEffect } from 'react';
import { AlertOctagon, Send, Filter, CheckCircle2, CircleDot, AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react';

export default function IncidentPortal() {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({ total: 0, categories: {}, priorities: {}, statuses: {} });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'Phishing Link', priority: 'Medium', targetUrl: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/incidents');
      const data = await res.json();
      setIncidents(data);
      
      const statsRes = await fetch('http://localhost:5000/api/incidents/stats');
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return;
    
    setFormLoading(true);
    setFormMessage(null);

    try {
      const res = await fetch('http://localhost:5000/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed to submit report');

      setForm({ title: '', description: '', category: 'Phishing Link', priority: 'Medium', targetUrl: '' });
      setFormMessage({ type: 'success', text: 'Incident successfully filed. Security administrators have been queued.' });
      fetchIncidents();
    } catch (err) {
      console.error(err);
      setFormMessage({ type: 'error', text: 'Failed to submit report. Please try again.' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchIncidents();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteIncident = async (id) => {
    if (!window.confirm('Are you sure you want to delete this incident report?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/incidents/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchIncidents();
    } catch (err) {
      console.error('Error deleting incident:', err);
    }
  };

  return (
    <div className="dashboard-grid">
      <div className="col-12" style={{ textAlign: 'center', margin: '20px 0 10px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Incident Reporting & Analytics</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '8px auto 0' }}>
          File suspect links or anomalies and track the containment response status on our active security intelligence board.
        </p>
      </div>

      {/* Stats Board */}
      <div className="col-12 glass-panel" style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Active Incidents</h4>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--cyber-blue)', display: 'block', marginTop: '8px' }}>{stats.total}</span>
        </div>

        {/* Priority breakdown (pure CSS bars) */}
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Priority Breakdown</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Critical', 'High', 'Medium', 'Low'].map(prio => {
              const count = stats.priorities[prio] || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              const color = prio === 'Critical' ? 'var(--color-danger)' : prio === 'High' ? '#f97316' : prio === 'Medium' ? 'var(--color-warning)' : 'var(--color-safe)';
              return (
                <div key={prio} style={{ fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 500 }}>{prio}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: color, transition: 'width 0.4s ease-out' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Containment Status</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Open', 'Investigating', 'Resolved'].map(st => {
              const count = stats.statuses[st] || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              const color = st === 'Open' ? 'var(--color-danger)' : st === 'Investigating' ? 'var(--color-warning)' : 'var(--color-safe)';
              return (
                <div key={st} style={{ fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 500 }}>{st}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: color, transition: 'width 0.4s ease-out' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Submission */}
      <div className="col-4 glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertOctagon size={20} color="var(--cyber-blue)" /> Report Incident
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Incident Summary Title *</label>
            <input type="text" className="glass-input" name="title" required value={form.title} onChange={handleInputChange} placeholder="e.g. Received Phishing Email mimicking Netflix" />
          </div>

          <div className="form-group">
            <label>Detailed Description *</label>
            <textarea 
              rows={4} 
              className="glass-input" 
              name="description" 
              required 
              value={form.description} 
              onChange={handleInputChange} 
              placeholder="Provide details: content details, what happened, or suspicious indicators."
              style={{ resize: 'none', fontFamily: 'inherit' }}
            />
          </div>

          <div className="form-group">
            <label>Threat Category</label>
            <select className="glass-input" name="category" value={form.category} onChange={handleInputChange}>
              <option value="Phishing Link">Phishing Link</option>
              <option value="Malicious File">Malicious File</option>
              <option value="Data Leak / Privacy">Data Leak / Privacy</option>
              <option value="Identity Theft">Identity Theft</option>
              <option value="Typosquatting">Typosquatting</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Priority Severity</label>
            <select className="glass-input" name="priority" value={form.priority} onChange={handleInputChange}>
              <option value="Low">Low (General Query)</option>
              <option value="Medium">Medium (Suspicious URL/File)</option>
              <option value="High">High (Spoofed Internal Service)</option>
              <option value="Critical">Critical (Active Breach/Compromise)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Associated URL (Optional)</label>
            <input type="text" className="glass-input" name="targetUrl" value={form.targetUrl} onChange={handleInputChange} placeholder="e.g. http://secure-netflix-login.com" />
          </div>

          <button type="submit" className="cyber-btn" style={{ width: '100%', marginTop: '10px' }} disabled={formLoading}>
            {formLoading ? 'Filing Report...' : 'File Incident Report'}
            <Send size={16} />
          </button>
        </form>

        {formMessage && (
          <div style={{ 
            marginTop: '16px', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem',
            background: formMessage.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${formMessage.type === 'success' ? 'var(--color-safe)' : 'var(--color-danger)'}`,
            color: formMessage.type === 'success' ? 'var(--color-safe)' : 'var(--color-danger)'
          }}>
            {formMessage.text}
          </div>
        )}
      </div>

      {/* Incident List */}
      <div className="col-8 glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Active Security Feed</h3>
        
        {loading && incidents.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading feeds...</p>
        ) : incidents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <ShieldCheck size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ fontSize: '0.9rem' }}>All quiet. No security incidents reported yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '550px', overflowY: 'auto', paddingRight: '8px' }}>
            {incidents.map(inc => {
              const statusColor = inc.status === 'Open' ? 'var(--color-danger)' : inc.status === 'Investigating' ? 'var(--color-warning)' : 'var(--color-safe)';
              const priorityBg = inc.priority === 'Critical' ? 'rgba(239,68,68,0.1)' : inc.priority === 'High' ? 'rgba(249,115,22,0.1)' : inc.priority === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)';
              const priorityText = inc.priority === 'Critical' ? 'var(--color-danger)' : inc.priority === 'High' ? '#f97316' : inc.priority === 'Medium' ? 'var(--color-warning)' : 'var(--color-safe)';
              
              return (
                <div key={inc._id} style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: '1rem' }}>{inc.title}</h4>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{inc.category}</span>
                        <span>•</span>
                        <span>{new Date(inc.reportedAt).toLocaleString()}</span>
                        {inc.targetUrl && (
                          <>
                            <span>•</span>
                            <span style={{ fontFamily: 'monospace', color: 'var(--cyber-blue)' }}>{inc.targetUrl}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: priorityBg, color: priorityText, textTransform: 'uppercase' }}>
                        {inc.priority}
                      </span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor, display: 'inline-block' }}></span>
                        <select 
                          value={inc.status} 
                          onChange={(e) => handleUpdateStatus(inc._id, e.target.value)}
                          style={{ background: 'transparent', border: 'none', color: statusColor, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}
                        >
                          <option value="Open" style={{ background: '#0f172a', color: 'var(--color-danger)' }}>Open</option>
                          <option value="Investigating" style={{ background: '#0f172a', color: 'var(--color-warning)' }}>Investigating</option>
                          <option value="Resolved" style={{ background: '#0f172a', color: 'var(--color-safe)' }}>Resolved</option>
                        </select>
                      </div>

                      <button 
                        onClick={() => handleDeleteIncident(inc._id)} 
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignSelf: 'center', marginLeft: '6px' }}
                        title="Delete Report"
                      >
                        <Trash2 size={15} onMouseEnter={(e) => e.target.style.color = 'var(--color-danger)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'} />
                      </button>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '4px' }}>
                    {inc.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
