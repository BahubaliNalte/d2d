const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  let content = fs.readFileSync(envPath, 'utf8');
  console.log('Original content length:', content.length);
  
  // Find where -----END PRIVATE KEY-----\nFIREBASE_DATABASE_URL= is
  const targetStr = '-----END PRIVATE KEY-----\\nFIREBASE_DATABASE_URL=';
  const index = content.indexOf(targetStr);
  console.log('Index of target string:', index);
  
  if (index !== -1) {
    // Replace the literal \n before FIREBASE_DATABASE_URL with an actual newline
    const before = content.slice(0, index + '-----END PRIVATE KEY-----'.length);
    const databaseUrlPart = content.slice(index + '-----END PRIVATE KEY-----\\n'.length);
    
    const newContent = before + '\n' + databaseUrlPart;
    fs.writeFileSync(envPath, newContent, 'utf8');
    console.log('Successfully wrote updated .env.local!');
  } else {
    // Let's try matching with single backslash
    const targetStr2 = '-----END PRIVATE KEY-----\nFIREBASE_DATABASE_URL=';
    const index2 = content.indexOf(targetStr2);
    console.log('Index of second target:', index2);
    if (index2 !== -1) {
      // It already has a newline!
      console.log('It already has a newline, no action needed.');
    } else {
      console.log('Could not find target strings to replace.');
    }
  }
} else {
  console.log('.env.local not found');
}
