const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load .env.local manually
const envPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local not found');
  process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
let envKey = '';
content.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith('FIREBASE_PRIVATE_KEY=')) {
    envKey = trimmed.substring('FIREBASE_PRIVATE_KEY='.length);
  }
});

if (!envKey) {
  console.error('FIREBASE_PRIVATE_KEY not found in .env.local');
  process.exit(1);
}

const rawKey = envKey.replace(/\\n/g, '\n').replace(/^"/, '').replace(/"$/, '');
const lines = rawKey.split('\n');

// Find which lines are base64 lines (excluding header and footer)
const header = lines[0];
const footer = lines[lines.length - 1];
const base64Lines = lines.slice(1, -1);

console.log('Original lines count:', lines.length);
console.log('Base64 lines count:', base64Lines.length);

const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// We know Part 19 (index 18 in base64Lines because index 0 is first line of base64) has length 63.
// Let's find all base64Lines that don't have length 64.
const targetLineIndex = base64Lines.findIndex(l => l.length === 63);
console.log('Line with length 63 is at index:', targetLineIndex);

if (targetLineIndex === -1) {
  console.log('No line of length 63 found. Checking all lines...');
} else {
  const originalLine = base64Lines[targetLineIndex];
  console.log('Original line content:', originalLine);
  
  let found = false;
  // Try inserting each base64 char at every position (0 to 63) of the target line
  for (let pos = 0; pos <= originalLine.length; pos++) {
    for (let char of base64Chars) {
      const testLine = originalLine.slice(0, pos) + char + originalLine.slice(pos);
      
      // Reconstruct the key
      const testBase64Lines = [...base64Lines];
      testBase64Lines[targetLineIndex] = testLine;
      const testKey = [header, ...testBase64Lines, footer].join('\n');
      
      try {
        crypto.createPrivateKey({
          key: testKey,
          format: 'pem',
          type: 'pkcs8'
        });
        console.log(`\nSUCCESS! Found valid key at position ${pos} with character '${char}'`);
        console.log('Modified Line:', testLine);
        
        // Write the fixed env back to .env.local
        const updatedRawKey = [header, ...testBase64Lines, footer].join('\\n');
        // Replace in env content
        const newEnvContent = content.replace(envKey, updatedRawKey);
        fs.writeFileSync(envPath, newEnvContent, 'utf8');
        console.log('Updated .env.local successfully!');
        
        found = true;
        break;
      } catch (err) {
        // failed, continue
      }
    }
    if (found) break;
  }
  
  if (!found) {
    console.log('Brute force on the line of length 63 failed.');
  }
}
