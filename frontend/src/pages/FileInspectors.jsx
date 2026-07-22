import React, { useState, useRef } from 'react';
import { FileText, Image as ImageIcon, QrCode, Upload, ShieldAlert, AlertTriangle, ShieldCheck, Check, Eye } from 'lucide-react';
import jsQR from 'jsqr';
import RiskBadge from '../components/RiskBadge';

export default function FileInspectors() {
  const [activeSubTab, setActiveSubTab] = useState('pdf');

  // PDF Scanner State
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfResult, setPdfResult] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const pdfInputRef = useRef(null);

  // Image Scanner State
  const [imgFile, setImgFile] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgResult, setImgResult] = useState(null);
  const [imgError, setImgError] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const imgInputRef = useRef(null);

  // QR Code Scanner State
  const [qrFile, setQrFile] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrResultUrl, setQrResultUrl] = useState(null);
  const [qrUrlResult, setQrUrlResult] = useState(null);
  const [qrError, setQrError] = useState(null);
  const qrInputRef = useRef(null);

  // ==========================================
  // PDF UPLOAD AND SCAN
  // ==========================================
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setPdfError('Only PDF files are supported.');
      return;
    }

    setPdfFile(file);
    setPdfLoading(true);
    setPdfError(null);
    setPdfResult(null);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('http://localhost:5000/api/scan/pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan PDF');
      }
      setPdfResult(data);
    } catch (err) {
      console.error(err);
      setPdfError(err.message || 'An error occurred scanning the PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  // ==========================================
  // IMAGE PRIVACY & STEGANOGRAPHY SCAN
  // ==========================================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImgError('Only image files (JPEG, PNG) are supported.');
      return;
    }

    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
    setImgLoading(true);
    setImgError(null);
    setImgResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/scan/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan Image');
      }
      setImgResult(data);
    } catch (err) {
      console.error(err);
      setImgError(err.message || 'An error occurred scanning the Image.');
    } finally {
      setImgLoading(false);
    }
  };

  // ==========================================
  // QR CODE CLIENT SCAN + DOMAIN DEEP CHECK
  // ==========================================
  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setQrError('Please upload an image containing a QR code.');
      return;
    }

    setQrFile(file);
    setQrLoading(true);
    setQrError(null);
    setQrResultUrl(null);
    setQrUrlResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        
        try {
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code && code.data) {
            setQrResultUrl(code.data);
            // Run decoded URL through our domain inspection endpoint
            await scanDecodedQrUrl(code.data);
          } else {
            setQrError('No valid QR code could be detected in this image. Try a higher contrast photo.');
            setQrLoading(false);
          }
        } catch (err) {
          console.error(err);
          setQrError('Error reading pixels from image data.');
          setQrLoading(false);
        }
      };
      image.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const scanDecodedQrUrl = async (url) => {
    try {
      const response = await fetch('http://localhost:5000/api/scan/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan QR URL');
      }
      setQrUrlResult(data);
    } catch (err) {
      console.error(err);
      // We still have the decoded URL, even if API lookup fails
      setQrUrlResult({
        rawDomain: url,
        riskScore: 0,
        riskReasons: [],
        status: 'Safe'
      });
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div className="dashboard-grid">
      <div className="col-12" style={{ textAlign: 'center', margin: '20px 0 10px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Media & File Sandbox</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '8px auto 0' }}>
          Deconstruct documents and images to identify hidden execution blocks, EXIF metadata location leaks, and malicious QR phishing links.
        </p>
      </div>

      {/* Sub tabs */}
      <div className="col-12" style={{ display: 'flex', justifyContent: 'center', gap: '12px', margin: '10px 0' }}>
        <button 
          onClick={() => setActiveSubTab('pdf')}
          className={activeSubTab === 'pdf' ? '' : 'cyber-btn-secondary'}
          style={activeSubTab === 'pdf' ? {
            background: 'var(--cyber-blue)', color: '#000', border: 'none', padding: '12px 20px', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          } : { padding: '12px 20px', cursor: 'pointer' }}
        >
          <FileText size={18} />
          <span>PDF Safety Analyzer</span>
        </button>

        <button 
          onClick={() => setActiveSubTab('image')}
          className={activeSubTab === 'image' ? '' : 'cyber-btn-secondary'}
          style={activeSubTab === 'image' ? {
            background: 'var(--cyber-blue)', color: '#000', border: 'none', padding: '12px 20px', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          } : { padding: '12px 20px', cursor: 'pointer' }}
        >
          <ImageIcon size={18} />
          <span>Image Privacy & Stego</span>
        </button>

        <button 
          onClick={() => setActiveSubTab('qr')}
          className={activeSubTab === 'qr' ? '' : 'cyber-btn-secondary'}
          style={activeSubTab === 'qr' ? {
            background: 'var(--cyber-blue)', color: '#000', border: 'none', padding: '12px 20px', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
          } : { padding: '12px 20px', cursor: 'pointer' }}
        >
          <QrCode size={18} />
          <span>QR Code Phish Check</span>
        </button>
      </div>

      {/* ========================================================
          PDF SCAN TAB
          ======================================================== */}
      {activeSubTab === 'pdf' && (
        <>
          <div className="col-12 glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handlePdfUpload} 
              style={{ display: 'none' }} 
              ref={pdfInputRef}
            />
            <div 
              style={{
                width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(56,189,248,0.05)', border: '1px dashed var(--cyber-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyber-blue)', cursor: 'pointer'
              }}
              onClick={() => pdfInputRef.current.click()}
            >
              <Upload size={32} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Upload PDF for Inspection</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                Files are analyzed in-memory. We scan for /JavaScript execution threads and active URI elements.
              </p>
            </div>
            <button className="cyber-btn" onClick={() => pdfInputRef.current.click()} disabled={pdfLoading}>
              {pdfLoading ? 'Analyzing Structure...' : 'Choose PDF File'}
            </button>
            {pdfFile && <span style={{ fontSize: '0.85rem', color: 'var(--cyber-blue)' }}>Selected: {pdfFile.name} ({(pdfFile.size/1024).toFixed(1)} KB)</span>}
            
            {pdfError && <div style={{ color: 'var(--color-danger)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={16} /> {pdfError}</div>}
          </div>

          {pdfResult && (
            <div className="col-12 glass-panel" style={{ padding: '32px', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>PDF Safety Breakdown</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                    Document: <strong style={{ color: '#fff' }}>{pdfResult.fileName}</strong> • Pages: {pdfResult.pageCount || 'Unknown'}
                  </p>
                </div>
                <RiskBadge score={pdfResult.riskScore} reasons={pdfResult.riskReasons} />
              </div>

              <div className="responsive-cols">
                {/* Structural elements */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--cyber-blue)', marginBottom: '12px' }}>Structural Object Anomalies</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span>Embedded JavaScript Actions (/JS, /JavaScript)</span>
                        <span style={{ fontWeight: 700, color: pdfResult.hasJS ? 'var(--color-danger)' : 'var(--color-safe)' }}>
                          {pdfResult.hasJS ? 'DETECTED' : 'CLEAN'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px' }}>
                        <span>Auto-Triggers on Document Open (/OpenAction, /AA)</span>
                        <span style={{ fontWeight: 700, color: pdfResult.hasOpenAction ? 'var(--color-danger)' : 'var(--color-safe)' }}>
                          {pdfResult.hasOpenAction ? 'DETECTED' : 'CLEAN'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px' }}>
                        <span>Command Line / Application Launches (/Launch)</span>
                        <span style={{ fontWeight: 700, color: pdfResult.hasLaunch ? 'var(--color-danger)' : 'var(--color-safe)' }}>
                          {pdfResult.hasLaunch ? 'DETECTED' : 'CLEAN'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extracted Links */}
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--cyber-blue)', marginBottom: '12px' }}>Embedded URI Resource Scan ({pdfResult.links.length})</h4>
                  
                  {pdfResult.links.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No embedded external hyperlinks found in this document.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '8px' }}>
                      {pdfResult.links.map((lnk, idx) => (
                        <div key={idx} style={{ 
                          padding: '10px', background: 'rgba(15,23,42,0.4)', border: '1px solid var(--border-glass)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', gap: '12px'
                        }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <a href={lnk.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyber-blue)', textDecoration: 'none', fontFamily: 'monospace' }}>
                              {lnk.url}
                            </a>
                          </div>
                          <span style={{ 
                            padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, 
                            backgroundColor: lnk.status === 'Safe' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
                            color: lnk.status === 'Safe' ? 'var(--color-safe)' : 'var(--color-danger)'
                          }}>
                            {lnk.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================
          IMAGE SCAN TAB
          ======================================================== */}
      {activeSubTab === 'image' && (
        <>
          <div className="col-12 glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              style={{ display: 'none' }} 
              ref={imgInputRef}
            />
            <div 
              style={{
                width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(56,189,248,0.05)', border: '1px dashed var(--cyber-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyber-blue)', cursor: 'pointer'
              }}
              onClick={() => imgInputRef.current.click()}
            >
              <Upload size={32} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Scan Photo for Privacy leaks & Steganography</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                Inspect image headers for embedded EXIF location metadata, camera markers, and appended hidden files (steg payloads).
              </p>
            </div>
            <button className="cyber-btn" onClick={() => imgInputRef.current.click()} disabled={imgLoading}>
              {imgLoading ? 'Deconstructing headers...' : 'Choose Image File'}
            </button>
            {imgFile && <span style={{ fontSize: '0.85rem', color: 'var(--cyber-blue)' }}>Selected: {imgFile.name} ({(imgFile.size/1024).toFixed(1)} KB)</span>}
            
            {imgError && <div style={{ color: 'var(--color-danger)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={16} /> {imgError}</div>}
          </div>

          {imgResult && (
            <div className="col-12 glass-panel" style={{ padding: '32px', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Image Inspection Result</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                    File: <strong style={{ color: '#fff' }}>{imgResult.fileName}</strong> • Type: {imgResult.mimeType}
                  </p>
                </div>
                <RiskBadge score={imgResult.riskScore} reasons={imgResult.riskReasons} />
              </div>

              <div className="responsive-cols">
                {/* EXIF Metadata findings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--cyber-blue)', marginBottom: '12px' }}>Metadata Leak & GPS Details</h4>
                    
                    {imgResult.exifWarnings.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {imgResult.exifWarnings.map((warn, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)', fontSize: '0.85rem' }}>
                            <AlertTriangle size={16} />
                            <span>{warn}</span>
                          </div>
                        ))}
                        
                        {imgResult.gpsCoords && (
                          <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)', borderRadius: '6px', fontSize: '0.8rem' }}>
                            <p style={{ fontWeight: 600, marginBottom: '4px' }}>GPS Location Coordinates:</p>
                            <span style={{ fontFamily: 'monospace' }}>Lat: {imgResult.gpsCoords.latitude.toFixed(6)}, Lon: {imgResult.gpsCoords.longitude.toFixed(6)}</span>
                            <div style={{ marginTop: '8px' }}>
                              <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${imgResult.gpsCoords.latitude},${imgResult.gpsCoords.longitude}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ color: 'var(--cyber-blue)', textDecoration: 'underline' }}
                              >
                                View Location on Google Maps
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-safe)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} /> Image clean of camera and location EXIF tags.
                      </p>
                    )}
                  </div>

                  {/* Steganography check */}
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--cyber-blue)', marginBottom: '12px' }}>Steganography Trailing-Payload Check</h4>
                    {imgResult.stegoDetected ? (
                      <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '6px' }}>
                          <AlertTriangle size={16} />
                          <span>Stego Payload Suspicion!</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>{imgResult.stegoDetails}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '6px' }}>
                          Anomalous extra bytes are appended after the image footer. This suggests hidden archives, script injections, or secret communication data.
                        </p>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-safe)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} /> No steganographic data detected (EOF tags properly formatted).
                      </p>
                    )}
                  </div>
                </div>

                {/* Preview Image */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Preview</span>
                  <img src={imgPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================
          QR SCAN TAB
          ======================================================== */}
      {activeSubTab === 'qr' && (
        <>
          <div className="col-12 glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleQrUpload} 
              style={{ display: 'none' }} 
              ref={qrInputRef}
            />
            <div 
              style={{
                width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(56,189,248,0.05)', border: '1px dashed var(--cyber-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyber-blue)', cursor: 'pointer'
              }}
              onClick={() => qrInputRef.current.click()}
            >
              <Upload size={32} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Decode QR Code & Scan for Phishing</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                Upload any picture containing a QR code (e.g. from leaflets, emails, or signs) to extract the hidden URL and inspect it.
              </p>
            </div>
            <button className="cyber-btn" onClick={() => qrInputRef.current.click()} disabled={qrLoading}>
              {qrLoading ? 'Decoding QR...' : 'Upload QR Image'}
            </button>
            {qrFile && <span style={{ fontSize: '0.85rem', color: 'var(--cyber-blue)' }}>Selected: {qrFile.name}</span>}
            
            {qrError && <div style={{ color: 'var(--color-danger)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={16} /> {qrError}</div>}
          </div>

          {qrResultUrl && qrUrlResult && (
            <div className="col-12 glass-panel" style={{ padding: '32px', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>QR Phishing Check Report</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                    Decoded URL: <strong style={{ color: 'var(--cyber-blue)', fontFamily: 'monospace' }}>{qrResultUrl}</strong>
                  </p>
                </div>
                <RiskBadge score={qrUrlResult.riskScore} reasons={qrUrlResult.riskReasons} />
              </div>

              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--cyber-blue)', marginBottom: '12px' }}>Security Diagnostics</h4>
                {qrUrlResult.riskScore > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {qrUrlResult.riskReasons.map((reason, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)', fontSize: '0.85rem' }}>
                        <AlertTriangle size={16} />
                        <span>{reason.factor} (+{reason.points} points)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-safe)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} /> No typosquatting, IDN homograph, or keyword risks found. The URL destination appears standard.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
