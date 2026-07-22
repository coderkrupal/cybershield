import express from 'express';
import crypto from 'crypto';
import CanaryToken from '../models/CanaryToken.js';
import CanaryLog from '../models/CanaryLog.js';

const router = express.Router();

// 1x1 transparent PNG base64 representation
const PIXEL_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

// Simple User-Agent Parser to separate Browser and OS
function parseUserAgent(uaString) {
  if (!uaString) return { browser: 'Unknown', os: 'Unknown' };
  
  let browser = 'Unknown';
  let os = 'Unknown';
  const ua = uaString.toLowerCase();

  // OS Detection
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('macintosh') || ua.includes('mac os')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

  // Browser/Bot Detection
  if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider') || ua.includes('curl') || ua.includes('wget')) {
    browser = 'Bot/Crawler';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('chrome') && !ua.includes('chromium')) {
    browser = 'Chrome';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('edge') || ua.includes('edg/')) {
    browser = 'Edge';
  } else if (ua.includes('opera') || ua.includes('opr/')) {
    browser = 'Opera';
  }

  return { browser, os };
}

// Log a hit on a Canary Token
async function logCanaryHit(tokenId, req) {
  try {
    const token = await CanaryToken.findOne({ tokenId });
    if (!token) return false;

    // Increment hit count
    token.hitCount += 1;
    await token.save();

    // Parse headers & remote information
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct/No Referrer';
    const { browser, os } = parseUserAgent(userAgent);

    // Save logs in key-value structure
    const headersMap = {};
    Object.keys(req.headers).forEach(key => {
      headersMap[key] = String(req.headers[key]);
    });

    const newLog = new CanaryLog({
      tokenId,
      ip,
      userAgent,
      browser,
      os,
      referrer,
      headers: headersMap
    });

    await newLog.save();
    return true;
  } catch (error) {
    console.error('Error logging canary hit:', error);
    return false;
  }
}

// ==========================================
// CLIENT CONTROL ENDPOINTS
// ==========================================

// @route   POST api/tracker
// @desc    Generate a new Canary Token (Honeytoken)
router.post('/', async (req, res) => {
  try {
    const { title, description, tokenType } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Token label/title is required.' });
    }

    // Generate a unique token ID
    const tokenId = crypto.randomBytes(12).toString('hex');

    const newToken = new CanaryToken({
      tokenId,
      title,
      description,
      tokenType: tokenType || 'link',
    });

    const savedToken = await newToken.save();
    return res.status(201).json(savedToken);
  } catch (error) {
    console.error('Error creating canary token:', error);
    return res.status(500).json({ error: 'Server error generating token' });
  }
});

// @route   GET api/tracker
// @desc    Get all active Canary Tokens
router.get('/', async (req, res) => {
  try {
    const tokens = await CanaryToken.find().sort({ createdAt: -1 });
    return res.json(tokens);
  } catch (error) {
    console.error('Error fetching canary tokens:', error);
    return res.status(500).json({ error: 'Server error retrieving tokens' });
  }
});

// @route   GET api/tracker/:tokenId/logs
// @desc    Get hit access logs for a specific token
router.get('/:tokenId/logs', async (req, res) => {
  try {
    const logs = await CanaryLog.find({ tokenId: req.params.tokenId }).sort({ accessedAt: -1 });
    return res.json(logs);
  } catch (error) {
    console.error('Error fetching token logs:', error);
    return res.status(500).json({ error: 'Server error retrieving access logs' });
  }
});

// @route   DELETE api/tracker/:tokenId
// @desc    Delete a Canary Token and all its associated logs
router.delete('/:tokenId', async (req, res) => {
  try {
    const token = await CanaryToken.findOneAndDelete({ tokenId: req.params.tokenId });
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }
    // Delete logs
    await CanaryLog.deleteMany({ tokenId: req.params.tokenId });
    return res.json({ message: 'Canary Token and all access logs deleted' });
  } catch (error) {
    console.error('Error deleting token:', error);
    return res.status(500).json({ error: 'Server error deleting token' });
  }
});

// ==========================================
// HONEYPOT HIT ENDPOINTS (PUBLIC ROUTING)
// ==========================================

// @route   GET api/tracker/hit/:tokenId
// @desc    Honeytoken URL redirect hit handler
router.get('/hit/:tokenId', async (req, res) => {
  const { tokenId } = req.params;
  
  // Log the trigger event asynchronously
  await logCanaryHit(tokenId, req);

  // Return a safe and professional landing page layout for the intruder/scanner
  // This simulates a normal system error or confidential files block page.
  res.setHeader('Content-Type', 'text/html');
  return res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Confidential Document Access System</title>
      <style>
        body { background: #0a0e17; color: #f1f5f9; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
        .box { padding: 40px; border: 1px solid #dc2626; border-radius: 12px; background: rgba(220, 38, 38, 0.05); max-width: 500px; box-shadow: 0 0 30px rgba(220, 38, 38, 0.1); }
        h1 { color: #ef4444; font-size: 24px; margin-bottom: 10px; }
        p { color: #94a3b8; font-size: 15px; line-height: 1.5; }
        .code { font-family: monospace; background: #1e293b; padding: 4px 8px; border-radius: 4px; color: #e2e8f0; margin-top: 15px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>ACCESS RESTRICTED</h1>
        <p>You have attempted to access a confidential system resource. This request has been flagged, and security administrators have been notified.</p>
        <div class="code">ERROR_CODE: SEC_ACCESS_REVOKED_0x401</div>
      </div>
    </body>
    </html>
  `);
});

// @route   GET api/tracker/hit/:tokenId/pixel.png
// @desc    Honeytoken invisible pixel hit handler
router.get('/hit/:tokenId/pixel.png', async (req, res) => {
  const { tokenId } = req.params;
  
  // Log the trigger event asynchronously
  await logCanaryHit(tokenId, req);

  // Send 1x1 transparent PNG buffer
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': PIXEL_BUFFER.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  return res.end(PIXEL_BUFFER);
});

export default router;
