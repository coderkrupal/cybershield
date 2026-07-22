import React, { useState } from 'react';
import { CheckCircle, XCircle, Award, RefreshCw, ChevronRight, HelpCircle, Eye, EyeOff } from 'lucide-react';

const ACADEMY_DATA = [
  {
    category: 'Secure Domain Navigation',
    dos: [
      { rule: 'Look for Punycode indicators (e.g. xn--) in the URL bar when entering banking websites.', detail: 'Browsers translate IDN lookalikes. Our inspector exposes homoglyph conversions.' },
      { rule: 'Verify exact spelling letter-by-letter of critical corporate brands.', detail: 'Watch out for substitution typos (e.g. paypa1.com vs paypal.com).' }
    ],
    donts: [
      { rule: 'Never click links inside emails or SMS messages expecting security log-ins.', detail: 'Always bookmark official URLs or type them in manually.' },
      { rule: 'Don\'t trust lock padlock icons (SSL) as a symbol of safety.', detail: 'Phishing websites can acquire SSL certificates easily; HTTPS only guarantees encryption, not authenticity.' }
    ]
  },
  {
    category: 'Document & Image Hygiene',
    dos: [
      { rule: 'Strip GPS coordinates and camera metadata (EXIF) from images before posting.', detail: 'EXIF leaks can pinpoint your residential location or device details to bad actors.' },
      { rule: 'Sanitize PDFs using scanners if they contain embedded hyperlinks or script triggers.', detail: 'Intruders insert /JS triggers that launch commands on document load.' }
    ],
    donts: [
      { rule: 'Don\'t open PDFs from unverified senders that immediately request browser permission access.', detail: 'They may contain automatic actions triggering malicious endpoints.' },
      { rule: 'Never download unsolicited attachments that claim to be standard images but are abnormally large.', detail: 'They might contain hidden zip archives or steganographic payloads.' }
    ]
  },
  {
    category: 'QR Code Scanning',
    dos: [
      { rule: 'Use preview checkers or inspect decrypted links before clicking QR code destinations.', detail: 'QR codes are unreadable to human eyes, making them excellent vectors for phishing.' },
      { rule: 'Check physical QR code stickers on flyers or public parking meters to see if they were pasted over.', detail: 'Attackers regularly paste malicious codes over official billing codes.' }
    ],
    donts: [
      { rule: 'Don\'t scan random QR codes promising rewards, discounts, or cryptocurrency prizes.', detail: 'These usually redirect to credentials-stealing sites.' },
      { rule: 'Never enter log-in details or financial info on a site accessed via a public QR code.', detail: 'Always access transactional systems through official mobile apps or bookmarked portals.' }
    ]
  }
];

const QUIZ_QUESTIONS = [
  {
    question: 'You receive an invoice PDF. When opened, it triggers a warning: "This document contains embedded scripts." What is the safest action?',
    options: [
      'Ignore the warning, as PDFs cannot run executable scripts.',
      'Allow it, as modern invoices require scripts to calculate totals.',
      'Close the file immediately and run it through a structural scanner. Embedded PDF JavaScript (/JS) is a major vector for payload delivery.'
    ],
    correctAnswer: 2,
    explanation: 'PDF files support scripting interfaces (like /JS or /JavaScript). Malicious documents use scripts to download payloads or exploit client vulnerabilities. Safe document workflows parse and strip active actions.'
  },
  {
    question: 'You notice a domain address in an email looks like "gооgle.com", but our inspector converts it to Punycode: "xn--ggle-p50aa.com". What threat does this represent?',
    options: [
      'Standard server load-balancing redirection.',
      'An IDN Homograph Phishing Attack. The domain replaces Latin letters with identical-looking Cyrillic characters to spoof the brand.',
      'An expired domain SSL certificate renewal indicator.'
    ],
    correctAnswer: 1,
    explanation: 'This is an IDN homograph attack. The characters resemble Latin "o" but are Cyrillic. In Punycode format ("xn--..."), the browser resolves it to a completely different server registered by the attacker.'
  },
  {
    question: 'You upload a profile photo and see GPS coordinates in the EXIF readout. Why does this represent a security risk?',
    options: [
      'GPS tags corrupt the image quality on servers.',
      'EXIF tags leak private location metadata (geotags) which allows strangers to map your home or location history.',
      'GPS data makes the image incompatible with web browsers.'
    ],
    correctAnswer: 2,
    explanation: 'EXIF tags are automatically appended by smartphones and cameras. Unless explicitly stripped, uploading these photos online exposes your coordinates, device model, and creation times.'
  },
  {
    question: 'You generated a Canary Token (Honeytoken) tracking link. What will happen if a malicious scanner triggers this URL?',
    options: [
      'It downloads a virus to destroy the scanner.',
      'It flags the trigger event, logs the intruder\'s IP, browser metadata, referrer header, and reports it to your dashboard.',
      'It blocks the entire local internet network.'
    ],
    correctAnswer: 1,
    explanation: 'Honeytokens act as silent warning lines. By logging hits on hidden URLs/pixels, security teams track scanner agents, leaks, and potential server infiltrations.'
  }
];

export default function SafetyGuide() {
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleOptionSelect = (idx) => {
    if (showExplanation) return;
    setSelectedOption(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    if (selectedOption === QUIZ_QUESTIONS[quizIndex].correctAnswer) {
      setScore(score + 1);
    }
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (quizIndex + 1 < QUIZ_QUESTIONS.length) {
      setQuizIndex(quizIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="dashboard-grid">
      <div className="col-12" style={{ textAlign: 'center', margin: '20px 0 10px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Cyber Safety Academy</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '8px auto 0' }}>
          Learn standard safety rules for domain checks, document auditing, and test your capability using our phishing detection quiz.
        </p>
      </div>

      {/* Do's & Don'ts */}
      <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {ACADEMY_DATA.map((cat, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--cyber-blue)' }}>
              {cat.category}
            </h3>

            <div className="responsive-cols">
              {/* Do's */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-safe)', marginBottom: '12px' }}>
                  <CheckCircle size={18} /> Safety Guidelines (Do)
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {cat.dos.map((item, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                      <strong style={{ color: '#fff', display: 'block', marginBottom: '2px' }}>{item.rule}</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', marginBottom: '12px' }}>
                  <XCircle size={18} /> Common Pitfalls (Don't)
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {cat.donts.map((item, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                      <strong style={{ color: '#fff', display: 'block', marginBottom: '2px' }}>{item.rule}</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mini Quiz */}
      <div className="col-4 glass-panel" style={{ padding: '24px', alignSelf: 'flex-start' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={20} color="var(--cyber-blue)" /> Security Quiz
        </h3>

        {!quizFinished ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              <span>Question {quizIndex + 1} of {QUIZ_QUESTIONS.length}</span>
              <span>Score: {score}</span>
            </div>
            
            <p style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: '1.4', marginBottom: '16px', color: '#fff' }}>
              {QUIZ_QUESTIONS[quizIndex].question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {QUIZ_QUESTIONS[quizIndex].options.map((opt, i) => {
                let borderStyle = '1px solid var(--border-glass)';
                let bgStyle = 'rgba(255,255,255,0.01)';
                
                if (selectedOption === i) {
                  borderStyle = '1px solid var(--cyber-blue)';
                  bgStyle = 'var(--cyber-blue-glow)';
                }
                
                if (showExplanation) {
                  if (i === QUIZ_QUESTIONS[quizIndex].correctAnswer) {
                    borderStyle = '1px solid var(--color-safe)';
                    bgStyle = 'rgba(16, 185, 129, 0.08)';
                  } else if (selectedOption === i) {
                    borderStyle = '1px solid var(--color-danger)';
                    bgStyle = 'rgba(239, 68, 68, 0.08)';
                  }
                }

                return (
                  <button 
                    key={i} 
                    onClick={() => handleOptionSelect(i)}
                    style={{ 
                      padding: '12px', border: borderStyle, background: bgStyle, borderRadius: 'var(--radius-md)', 
                      fontSize: '0.8rem', color: 'var(--text-primary)', textAlign: 'left', cursor: showExplanation ? 'default' : 'pointer',
                      transition: 'var(--transition-smooth)', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                    disabled={showExplanation}
                  >
                    <ChevronRight size={14} color={selectedOption === i ? 'var(--cyber-blue)' : 'var(--text-muted)'} />
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {!showExplanation ? (
              <button 
                className="cyber-btn" 
                onClick={handleCheckAnswer} 
                disabled={selectedOption === null}
                style={{ width: '100%', marginTop: '16px' }}
              >
                Check Answer
              </button>
            ) : (
              <div style={{ marginTop: '16px', animation: 'fadeIn 0.2s ease-out' }}>
                <div style={{ 
                  padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4'
                }}>
                  <p style={{ fontWeight: 600, color: selectedOption === QUIZ_QUESTIONS[quizIndex].correctAnswer ? 'var(--color-safe)' : 'var(--color-danger)', marginBottom: '4px' }}>
                    {selectedOption === QUIZ_QUESTIONS[quizIndex].correctAnswer ? 'Correct!' : 'Incorrect.'}
                  </p>
                  {QUIZ_QUESTIONS[quizIndex].explanation}
                </div>
                <button className="cyber-btn" onClick={handleNextQuestion} style={{ width: '100%', marginTop: '12px' }}>
                  {quizIndex + 1 === QUIZ_QUESTIONS.length ? 'Finish Quiz' : 'Next Question'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Award size={48} color="var(--cyber-blue)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Quiz Completed!</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              You scored <strong style={{ color: 'var(--cyber-blue)' }}>{score}</strong> out of {QUIZ_QUESTIONS.length}
            </p>
            <div style={{ padding: '12px', background: 'rgba(16,185,129,0.05)', border: '1px solid var(--color-safe)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--color-safe)', marginBottom: '20px' }}>
              {score === QUIZ_QUESTIONS.length ? 'Perfect Score! Cyber Guard Certified.' : 'Good attempt. Keep building security awareness.'}
            </div>
            <button className="cyber-btn-secondary" onClick={resetQuiz} style={{ width: '100%' }}>
              <RefreshCw size={14} />
              <span>Retry Quiz</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
