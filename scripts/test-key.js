const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const firstEq = trimmed.indexOf('=');
    if (firstEq === -1) return;
    const key = trimmed.substring(0, firstEq).trim();
    const val = trimmed.substring(firstEq + 1).trim();
    process.env[key] = val;
  });
}

const key = process.env.FIREBASE_PRIVATE_KEY;
console.log('Key exists:', !!key);
if (key) {
  console.log('Key length:', key.length);
  const formatted = key.replace(/\\n/g, '\n').replace(/^"/, '').replace(/"$/, '');
  console.log('Formatted starts with "-----BEGIN PRIVATE KEY-----":', formatted.startsWith('-----BEGIN PRIVATE KEY-----'));
  console.log('Formatted ends with "-----END PRIVATE KEY-----":', formatted.endsWith('-----END PRIVATE KEY-----'));
  console.log('Contains literal \\n:', key.includes('\\n'));
  console.log('Contains actual newline:', key.includes('\n'));
  
  // Log key info
  console.log('Formatted length:', formatted.length);
  console.log('Last 30 chars:', JSON.stringify(formatted.slice(-30)));
  console.log('First 30 chars:', JSON.stringify(formatted.slice(0, 30)));
  
  // Try parsing the private key using crypto to see if it's valid
  const crypto = require('crypto');
  try {
    crypto.createSign('RSA-SHA256').update('test').sign(formatted);
    console.log('Key is valid RSA private key!');
  } catch (err) {
    console.error('Crypto error:', err.message);
  }
}
