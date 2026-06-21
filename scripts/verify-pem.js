const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
if (key) {
  const formatted = key.replace(/\\n/g, '\n').replace(/^"/, '').replace(/"$/, '');
  console.log('Formatted Key Content:');
  console.log(formatted);
  
  const lines = formatted.split('\n');
  lines.forEach((line, i) => {
    console.log(`Line ${i}: length=${line.length}, content=${line.slice(0, 10)}...${line.slice(-10)}`);
  });
  const base64Content = lines.slice(1, -1).join('');
  console.log('Base64 content length:', base64Content.length);
} else {
  console.log('Key not found in env');
}
