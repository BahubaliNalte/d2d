const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  const keyLine = lines.find(l => l.startsWith('FIREBASE_PRIVATE_KEY='));
  if (keyLine) {
    const rawVal = keyLine.substring('FIREBASE_PRIVATE_KEY='.length);
    const index = rawVal.indexOf('IqIVcuWthp');
    if (index !== -1) {
      console.log('Found IqIVcuWthp at index:', index);
      console.log('Surrounding raw chars:', JSON.stringify(rawVal.substring(index - 10, index + 30)));
    } else {
      console.log('IqIVcuWthp not found in raw value');
    }
  } else {
    console.log('FIREBASE_PRIVATE_KEY line not found');
  }
}
