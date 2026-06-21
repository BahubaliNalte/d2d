/*
Migration script: migrate usage counts from Users/{uid}/{predictorUsage, collegeExplorerUsage}
into Usage/{feature}/{uid}. Run from project root with Node.js and a service account or
Application Default Credentials set.

Usage:
  NODE_ENV=production node scripts/migrate-usage.js --remove-old

Options:
  --remove-old    Remove the old keys under Users/{uid} after copying

Requirements:
  - Install firebase-admin: `npm install firebase-admin`
  - Provide service account via GOOGLE_APPLICATION_CREDENTIALS env var or use
    application default credentials.
*/

const admin = require('firebase-admin');
const argv = require('minimist')(process.argv.slice(2));

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: process.env.FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } catch (err) {
    console.error('Failed to initialize firebase-admin:', err);
    process.exit(1);
  }
}

const db = admin.database();
const removeOld = !!argv['remove-old'];

async function migrate() {
  console.log('Starting usage migration. removeOld=', removeOld);
  const usersRef = db.ref('Users');
  const snap = await usersRef.once('value');
  if (!snap.exists()) {
    console.log('No Users node found. Nothing to migrate.');
    return;
  }
  const users = snap.val();
  const updates = {};
  let count = 0;
  for (const uid of Object.keys(users)) {
    const u = users[uid] || {};
    if (u.predictorUsage != null) {
      updates[`Usage/predictor/${uid}`] = u.predictorUsage;
      count++;
    }
    if (u.collegeExplorerUsage != null) {
      updates[`Usage/collegeExplorer/${uid}`] = u.collegeExplorerUsage;
      count++;
    }
    if (removeOld) {
      updates[`Users/${uid}/predictorUsage`] = null;
      updates[`Users/${uid}/collegeExplorerUsage`] = null;
    }
  }

  if (Object.keys(updates).length === 0) {
    console.log('No usage keys to migrate.');
    return;
  }

  console.log('Writing', Object.keys(updates).length, 'paths...');
  await db.ref().update(updates);
  console.log('Migration complete. migrated entries:', count);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(2);
});
