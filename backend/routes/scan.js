import express from 'express';
import multer from 'multer';
import exifParser from 'exif-parser';
import pdfParse from 'pdf-parse';
import dns from 'dns/promises';
import { analyzeDomain } from '../utils/homoglyph.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// @route   POST api/scan/url
// @desc    Analyze a URL for typosquatting, homoglyphs, and keywords
router.post('/url', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL query is required' });
  }

  const result = analyzeDomain(url);
  if (!result.isValid) {
    return res.status(400).json({ error: result.error });
  }

  return res.json(result);
});

// @route   POST api/scan/image
// @desc    Scan uploaded image for EXIF privacy leaks and trailing-payload steganography
router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload an image file' });
  }

  const buffer = req.file.buffer;
  const fileName = req.file.originalname;
  const fileSize = req.file.size;
  const mimeType = req.file.mimetype;

  let exif = null;
  let hasExif = false;
  let exifWarnings = [];
  let gpsCoords = null;

  // Try to parse EXIF (usually JPEGs)
  try {
    const parser = exifParser.create(buffer);
    const parsed = parser.parse();
    if (parsed && parsed.tags) {
      exif = parsed.tags;
      hasExif = Object.keys(exif).length > 0;
      
      if (hasExif) {
        if (exif.GPSLatitude || exif.GPSLongitude) {
          gpsCoords = {
            latitude: exif.GPSLatitude,
            longitude: exif.GPSLongitude,
          };
          exifWarnings.push('Sensitive GPS Coordinates found (Location leak).');
        }
        if (exif.Make || exif.Model) {
          exifWarnings.push(`Camera manufacturer/model leaked: ${exif.Make || ''} ${exif.Model || ''}`);
        }
        if (exif.DateTimeOriginal || exif.CreateDate) {
          const creation = new Date((exif.DateTimeOriginal || exif.CreateDate) * 1000);
          exifWarnings.push(`Original photo capture timestamp leaked: ${creation.toLocaleString()}`);
        }
      }
    }
  } catch (error) {
    // EXIF parsing failed (not a JPEG or no metadata readable)
  }

  // Steganography check: Scan for trailing bytes after image EOF markers
  let stegoDetected = false;
  let trailingBytesCount = 0;
  let stegoDetails = '';

  if (mimeType === 'image/jpeg' || fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg')) {
    // JPEG EOF: FF D9
    // Find index of the last FF D9
    let lastEofIndex = -1;
    for (let i = buffer.length - 2; i >= 0; i--) {
      if (buffer[i] === 0xFF && buffer[i + 1] === 0xD9) {
        lastEofIndex = i;
        break;
      }
    }

    if (lastEofIndex !== -1 && lastEofIndex < buffer.length - 2) {
      trailingBytesCount = buffer.length - (lastEofIndex + 2);
      // We allow a small tolerance of 10 bytes for padding
      if (trailingBytesCount > 10) {
        stegoDetected = true;
        stegoDetails = `Detected ${trailingBytesCount} trailing bytes appended after the JPEG End-of-File marker (FF D9).`;
      }
    }
  } else if (mimeType === 'image/png' || fileName.toLowerCase().endsWith('.png')) {
    // PNG EOF: IEND chunk signature followed by 4 bytes CRC (usually ends with 'IEND' + 4 CRC bytes)
    // Find position of "IEND" ASCII characters in binary buffer
    const iendPattern = Buffer.from([0x49, 0x45, 0x4E, 0x44]); // "IEND"
    const iendIndex = buffer.lastIndexOf(iendPattern);

    if (iendIndex !== -1) {
      const eofOffset = iendIndex + 8; // "IEND" is 4 bytes + 4 bytes CRC
      if (eofOffset < buffer.length) {
        trailingBytesCount = buffer.length - eofOffset;
        if (trailingBytesCount > 10) {
          stegoDetected = true;
          stegoDetails = `Detected ${trailingBytesCount} trailing bytes appended after the PNG End-of-File (IEND) marker.`;
        }
      }
    }
  }

  // Calculate image risk score
  let riskScore = 0;
  const riskReasons = [];

  if (gpsCoords) {
    riskScore += 30;
    riskReasons.push({ factor: 'GPS Coordinates embedded (leaks precise location)', severity: 'High', points: 30 });
  } else if (hasExif) {
    riskScore += 10;
    riskReasons.push({ factor: 'Camera EXIF metadata available (leaks device info)', severity: 'Low', points: 10 });
  }

  if (stegoDetected) {
    riskScore += 50;
    riskReasons.push({ factor: 'Potential Steganography Payload (hidden data at end of file)', severity: 'Critical', points: 50 });
  }

  const status = riskScore >= 50 ? 'Critical' : (riskScore > 0 ? 'Suspicious' : 'Safe');

  return res.json({
    fileName,
    fileSize,
    mimeType,
    hasExif,
    exifTags: exif,
    exifWarnings,
    gpsCoords,
    stegoDetected,
    trailingBytesCount,
    stegoDetails,
    riskScore,
    riskReasons,
    status
  });
});

// @route   POST api/scan/pdf
// @desc    Scan uploaded PDF structure for malicious JS, OpenAction triggers, and analyze URLs
router.post('/pdf', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a PDF file' });
  }

  const buffer = req.file.buffer;
  const fileName = req.file.originalname;
  const fileSize = req.file.size;

  let pageCount = 0;
  let textSample = '';
  let metadata = {};

  try {
    const data = await pdfParse(buffer);
    pageCount = data.numpages;
    textSample = data.text ? data.text.substring(0, 1000) : '';
    metadata = data.info || {};
  } catch (error) {
    console.error('pdf-parse failed, falling back to manual structure check:', error);
  }

  // Scan PDF buffer for structural anomalies (JavaScript, Auto-actions, etc.)
  const content = buffer.toString('binary');
  
  // PDF objects are written in plain text-like entries: /JavaScript, /JS, /OpenAction, /AA, /Launch
  const hasJS = /\/JS\b|\/JavaScript\b/i.test(content);
  const hasOpenAction = /\/OpenAction\b|\/AA\b/i.test(content);
  const hasLaunch = /\/Launch\b/i.test(content);

  // Extract embedded URL links
  const uriRegex = /\/URI\s*\(([^)]+)\)/g;
  const linksFound = [];
  let match;
  while ((match = uriRegex.exec(content)) !== null) {
    linksFound.push(match[1]);
  }

  // Fallback regex to find URLs in text buffer
  const urlRegex = /(https?:\/\/[^\s)\"\'\>]+)/g;
  const textUrls = content.match(urlRegex) || [];
  
  const allUrls = Array.from(new Set([...linksFound, ...textUrls])).filter(url => {
    // simple URL sanity check
    return url.startsWith('http://') || url.startsWith('https://');
  });

  // Check extracted links for safety
  const checkedLinks = allUrls.map(url => {
    const analysis = analyzeDomain(url);
    return {
      url,
      domain: analysis.rawDomain,
      riskScore: analysis.riskScore,
      status: analysis.status,
      isPunycode: analysis.isPunycode,
      containsHomoglyphs: analysis.containsHomoglyphs
    };
  });

  // Calculate PDF risk score
  let riskScore = 0;
  const riskReasons = [];

  if (hasJS) {
    riskScore += 45;
    riskReasons.push({ factor: 'Embedded JavaScript detected (/JS, /JavaScript elements)', severity: 'High', points: 45 });
  }
  if (hasOpenAction) {
    riskScore += 35;
    riskReasons.push({ factor: 'Auto-Trigger execution detected (/OpenAction, /AA actions)', severity: 'High', points: 35 });
  }
  if (hasLaunch) {
    riskScore += 30;
    riskReasons.push({ factor: 'Launch Command detected (/Launch action to run files)', severity: 'High', points: 30 });
  }

  const badLinks = checkedLinks.filter(lnk => lnk.riskScore > 0);
  if (badLinks.length > 0) {
    const highestRiskLink = Math.max(...badLinks.map(l => l.riskScore));
    riskScore += Math.floor(highestRiskLink * 0.5); // Add half of the worst link risk
    riskReasons.push({ 
      factor: `Contains ${badLinks.length} suspicious/phishing URLs inside the document`, 
      severity: 'Medium', 
      points: Math.floor(highestRiskLink * 0.5) 
    });
  }

  riskScore = Math.min(riskScore, 100);
  const status = riskScore >= 70 ? 'Critical' : (riskScore > 0 ? 'Suspicious' : 'Safe');

  return res.json({
    fileName,
    fileSize,
    pageCount,
    metadata,
    hasJS,
    hasOpenAction,
    hasLaunch,
    links: checkedLinks,
    riskScore,
    riskReasons,
    status
  });
});

// @route   POST api/scan/dns
// @desc    Perform live DNS MX, SPF, and DMARC lookup to assess domain spoofability
router.post('/dns', async (req, res) => {
  const { domain } = req.body;
  if (!domain) {
    return res.status(400).json({ error: 'Domain/URL is required' });
  }

  // Clean domain name representation
  let cleanDomain = domain.trim().toLowerCase();
  cleanDomain = cleanDomain.replace(/^(https?:\/\/)?(www\.)?/, '');
  cleanDomain = cleanDomain.split('/')[0].split('?')[0];

  try {
    let mxRecords = [];
    let txtRecords = [];
    let dmarcRecords = [];

    // 1. Resolve MX
    try {
      mxRecords = await dns.resolveMx(cleanDomain);
    } catch (e) {
      // MX lookup empty or failed
    }

    // 2. Resolve TXT
    try {
      const lists = await dns.resolveTxt(cleanDomain);
      txtRecords = lists.map(l => l.join(' '));
    } catch (e) {
      // TXT lookup empty or failed
    }

    // 3. Resolve DMARC at _dmarc.domain
    try {
      const lists = await dns.resolveTxt(`_dmarc.${cleanDomain}`);
      dmarcRecords = lists.map(l => l.join(' '));
    } catch (e) {
      // DMARC lookup empty or failed
    }

    // Parse SPF
    const spfRecord = txtRecords.find(rec => rec.startsWith('v=spf1')) || null;
    let spfPolicy = 'none';
    let spfSecurity = 'Critical';
    let spfExplanation = 'No SPF record found. Imposters can send emails mimicking this domain unchecked.';

    if (spfRecord) {
      if (spfRecord.endsWith('-all')) {
        spfPolicy = 'fail';
        spfSecurity = 'Safe';
        spfExplanation = 'Strict policy (-all) detected. Unauthorized mail servers are failed and rejected.';
      } else if (spfRecord.endsWith('~all')) {
        spfPolicy = 'softfail';
        spfSecurity = 'Moderate';
        spfExplanation = 'Softfail policy (~all) detected. Unauthorized mail will land in Spam but not rejected.';
      } else if (spfRecord.endsWith('?all') || spfRecord.endsWith('+all')) {
        spfPolicy = 'neutral/allow';
        spfSecurity = 'Dangerous';
        spfExplanation = 'Weak policy (?all or +all) detected. Unauthorized servers are neutral or permitted.';
      } else {
        spfPolicy = 'custom';
        spfSecurity = 'Moderate';
        spfExplanation = 'SPF record exists but uses complex mechanisms without standard final exclusions.';
      }
    }

    // Parse DMARC
    const dmarcRecord = dmarcRecords.find(rec => rec.startsWith('v=DMARC1')) || null;
    let dmarcPolicy = 'none';
    let dmarcSecurity = 'Critical';
    let dmarcExplanation = 'No DMARC record discovered. Receiver servers will not block or report spoofed emails.';

    if (dmarcRecord) {
      const matchPolicy = dmarcRecord.match(/\bp=([^;\s]+)/i);
      const policyVal = matchPolicy ? matchPolicy[1].toLowerCase() : 'none';

      if (policyVal === 'reject') {
        dmarcPolicy = 'reject';
        dmarcSecurity = 'Safe';
        dmarcExplanation = 'Reject policy (p=reject) detected. Unauthorized spoofed emails are blocked outright.';
      } else if (policyVal === 'quarantine') {
        dmarcPolicy = 'quarantine';
        dmarcSecurity = 'Good';
        dmarcExplanation = 'Quarantine policy (p=quarantine) detected. Spoofed mails are routed directly to Spam.';
      } else {
        dmarcPolicy = 'none';
        dmarcSecurity = 'Weak';
        dmarcExplanation = 'DMARC is set to monitoring (p=none). Fake emails are not blocked, but aggregate logs are tracked.';
      }
    }

    // Calculate spoofability risk index
    let riskScore = 0;
    const riskReasons = [];

    if (!spfRecord) {
      riskScore += 50;
      riskReasons.push({ factor: 'Missing SPF Record (domain fails to whitelist authorized IP relays)', severity: 'Critical', points: 50 });
    } else if (spfPolicy === 'neutral/allow') {
      riskScore += 35;
      riskReasons.push({ factor: 'Weak SPF filter rules (?all / +all permits unauthorized delivery)', severity: 'High', points: 35 });
    } else if (spfPolicy === 'softfail') {
      riskScore += 15;
      riskReasons.push({ factor: 'SPF policy set to softfail (~all permits spam-box delivery)', severity: 'Medium', points: 15 });
    }

    if (!dmarcRecord) {
      riskScore += 50;
      riskReasons.push({ factor: 'Missing DMARC authentication policy (unauthorized mail cannot be contained)', severity: 'Critical', points: 50 });
    } else if (dmarcPolicy === 'none') {
      riskScore += 25;
      riskReasons.push({ factor: 'DMARC policy set to none (monitors only, does not filter fake emails)', severity: 'Medium', points: 25 });
    } else if (dmarcPolicy === 'quarantine') {
      riskScore += 10;
      riskReasons.push({ factor: 'DMARC policy set to quarantine (spam box routing instead of complete block)', severity: 'Low', points: 10 });
    }

    riskScore = Math.min(riskScore, 100);
    const status = riskScore >= 70 ? 'Critical' : (riskScore >= 30 ? 'Suspicious' : 'Safe');

    return res.json({
      domain: cleanDomain,
      mxRecords,
      spf: {
        record: spfRecord,
        policy: spfPolicy,
        security: spfSecurity,
        explanation: spfExplanation
      },
      dmarc: {
        record: dmarcRecord,
        policy: dmarcPolicy,
        security: dmarcSecurity,
        explanation: dmarcExplanation
      },
      riskScore,
      riskReasons,
      status
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: `DNS scanning failed: ${error.message}` });
  }
});

export default router;
