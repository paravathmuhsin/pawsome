// Content validation utilities to prevent phishing
export const BLOCKED_DOMAINS = [
  // Common phishing/malicious domains
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'short.link',
  // Add any suspicious domains found in abuse reports
];

export const SUSPICIOUS_KEYWORDS = [
  'verify', 'confirm', 'suspend', 'urgent', 'click here', 'login now',
  'account locked', 'security alert', 'update payment', 'claim reward',
  'limited time', 'act now', 'winner', 'congratulations'
];

export const validateImageUrl = (url: string): boolean => {
  if (!url) return true; // Empty URLs are allowed
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Block known malicious domains
    if (BLOCKED_DOMAINS.some(domain => hostname.includes(domain))) {
      return false;
    }
    
    // Only allow HTTPS for external URLs
    if (urlObj.protocol !== 'https:' && !hostname.includes('localhost')) {
      return false;
    }
    
    // Only allow image file extensions
    const pathname = urlObj.pathname.toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    if (!allowedExtensions.some(ext => pathname.endsWith(ext)) && 
        !hostname.includes('firebasestorage.googleapis.com')) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

export const validateTextContent = (text: string): boolean => {
  if (!text) return true;
  
  const lowerText = text.toLowerCase();
  return !SUSPICIOUS_KEYWORDS.some(keyword => lowerText.includes(keyword));
};

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove potential script tags and dangerous content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};
