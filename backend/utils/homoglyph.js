import punycode from 'punycode';

// Map of common Cyrillic/Greek characters that look like Latin characters
const homoglyphMap = {
  'а': { latin: 'a', name: 'Cyrillic Small Letter A', code: 'U+0430' },
  'с': { latin: 'c', name: 'Cyrillic Small Letter Es', code: 'U+0441' },
  'е': { latin: 'e', name: 'Cyrillic Small Letter Ie', code: 'U+0435' },
  'і': { latin: 'i', name: 'Cyrillic Small Letter Byelorussian-Ukrainian I', code: 'U+0456' },
  'ј': { latin: 'j', name: 'Cyrillic Small Letter Je', code: 'U+0458' },
  'о': { latin: 'o', name: 'Cyrillic Small Letter O', code: 'U+043E' },
  'р': { latin: 'p', name: 'Cyrillic Small Letter Er', code: 'U+0440' },
  'ѕ': { latin: 's', name: 'Cyrillic Small Letter Dze', code: 'U+0455' },
  'у': { latin: 'y', name: 'Cyrillic Small Letter U', code: 'U+0443' },
  'х': { latin: 'x', name: 'Cyrillic Small Letter Ha', code: 'U+0445' },
  'ԁ': { latin: 'd', name: 'Cyrillic Small Letter Dd', code: 'U+0401' },
  'ѕ': { latin: 's', name: 'Cyrillic Small Letter Dze', code: 'U+0455' },
  'Ь': { latin: 'b', name: 'Cyrillic Capital Letter Soft Sign', code: 'U+042C' },
  'һ': { latin: 'h', name: 'Cyrillic Small Letter Shha', code: 'U+04BB' },
  'т': { latin: 'm', name: 'Cyrillic Small Letter Te', code: 'U+0442' },
  'п': { latin: 'n', name: 'Cyrillic Small Letter Pe', code: 'U+043F' },
  'q': { latin: 'q', name: 'Latin Small Letter Q', code: 'U+0071' }, // not homoglyph but standard
};

const POPULAR_BRANDS = [
  'google.com', 'youtube.com', 'facebook.com', 'amazon.com', 'apple.com',
  'netflix.com', 'microsoft.com', 'paypal.com', 'instagram.com', 'twitter.com',
  'linkedin.com', 'wikipedia.org', 'github.com', 'reddit.com', 'ebay.com',
  'zoom.us', 'spotify.com', 'dropbox.com', 'slack.com', 'chase.com',
  'bankofamerica.com', 'wellsfargo.com', 'walmart.com', 'target.com', 'gmail.com'
];

function getLevenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Extract clean domain (e.g. "google.com" from "https://sub.google.com/path?query")
export function extractDomain(inputStr) {
  let cleaned = inputStr.trim().toLowerCase();
  
  // Remove protocol
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?/, '');
  
  // Remove path, query, fragment
  cleaned = cleaned.split('/')[0];
  cleaned = cleaned.split('?')[0];
  cleaned = cleaned.split('#')[0];
  
  return cleaned;
}

export function analyzeDomain(inputUrl) {
  const rawDomain = extractDomain(inputUrl);
  if (!rawDomain) {
    return {
      isValid: false,
      error: 'Invalid URL/Domain'
    };
  }

  // Punycode conversion
  const unicodeDomain = punycode.toUnicode(rawDomain);
  const asciiDomain = punycode.toASCII(rawDomain);
  const isPunycode = asciiDomain.startsWith('xn--');

  // Check for homoglyphs
  const homoglyphsFound = [];
  let containsHomoglyphs = false;
  
  for (let i = 0; i < unicodeDomain.length; i++) {
    const char = unicodeDomain[i];
    if (homoglyphMap[char]) {
      containsHomoglyphs = true;
      homoglyphsFound.push({
        char,
        index: i,
        replaces: homoglyphMap[char].latin,
        name: homoglyphMap[char].name,
        code: homoglyphMap[char].code
      });
    }
  }

  // Check for typosquatting against popular brands
  let typosquattingMatch = null;
  let minDistance = 999;
  
  // Also check similarity on the ascii version and unicode version
  for (const brand of POPULAR_BRANDS) {
    const distAscii = getLevenshteinDistance(asciiDomain, brand);
    const distUnicode = getLevenshteinDistance(unicodeDomain, brand);
    const distance = Math.min(distAscii, distUnicode);
    
    if (distance > 0 && distance <= 2) {
      if (distance < minDistance) {
        minDistance = distance;
        typosquattingMatch = {
          brand,
          distance
        };
      }
    }
  }

  // Suspicious keywords in domain (e.g. "login-google.com", "secure-paypal.com")
  const phishingKeywords = ['login', 'secure', 'signin', 'verify', 'update', 'account', 'banking', 'support', 'billing', 'free', 'gift', 'prize'];
  const suspiciousKeywordsFound = [];
  
  for (const kw of phishingKeywords) {
    if (asciiDomain.includes(kw)) {
      suspiciousKeywordsFound.push(kw);
    }
  }

  // Calculate risk score (0 - 100)
  let riskScore = 0;
  const riskReasons = [];

  if (isPunycode) {
    riskScore += 30;
    riskReasons.push({ factor: 'Punycode/IDN Encoded Domain', severity: 'Medium', points: 30 });
  }

  if (containsHomoglyphs) {
    riskScore += 45;
    riskReasons.push({ factor: 'Unicode Homoglyphs Detected (Lookalike characters)', severity: 'High', points: 45 });
  }

  if (typosquattingMatch) {
    const pts = typosquattingMatch.distance === 1 ? 60 : 40;
    riskScore += pts;
    riskReasons.push({ 
      factor: `Typosquatting Attempt (Very similar to official brand "${typosquattingMatch.brand}")`, 
      severity: typosquattingMatch.distance === 1 ? 'Critical' : 'High', 
      points: pts 
    });
  }

  if (suspiciousKeywordsFound.length > 0) {
    const pts = Math.min(suspiciousKeywordsFound.length * 15, 30);
    riskScore += pts;
    riskReasons.push({ 
      factor: `Contains phishing-related keywords: ${suspiciousKeywordsFound.join(', ')}`, 
      severity: 'Medium', 
      points: pts 
    });
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  // Status mapping
  let status = 'Safe';
  if (riskScore >= 70) {
    status = 'Critical';
  } else if (riskScore > 0) {
    status = 'Suspicious';
  }

  return {
    isValid: true,
    rawDomain,
    asciiDomain,
    unicodeDomain,
    isPunycode,
    containsHomoglyphs,
    homoglyphsFound,
    typosquattingMatch,
    suspiciousKeywordsFound,
    riskScore,
    riskReasons,
    status
  };
}
