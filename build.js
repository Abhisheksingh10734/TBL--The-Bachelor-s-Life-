// build.js
const fs = require('fs');
const path = require('path');

// Load .env file
require('dotenv').config();

// Read all env vars we care about
const env = {
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || '',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || '',
  FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID || '',

  EMAILJS_PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY || '',
  EMAILJS_SERVICE_ID: process.env.EMAILJS_SERVICE_ID || '',
  EMAILJS_TEMPLATE_WELCOME: process.env.EMAILJS_TEMPLATE_WELCOME || '',
  EMAILJS_TEMPLATE_ADMIN: process.env.EMAILJS_TEMPLATE_ADMIN || '',
  EMAILJS_ADMIN_EMAIL: process.env.EMAILJS_ADMIN_EMAIL || '',

  ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  SITE_NAME: process.env.SITE_NAME || "The Bachelor's Life",

  ADMIN_USERNAME: process.env.ADMIN_USERNAME || '',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || ''
};

// Validate — warn if any key is empty
const missing = Object.entries(env).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.warn('⚠️  Missing env vars:', missing.join(', '));
}

// Generate scripts/env.js — this file is what your browser loads
const output = `/* AUTO-GENERATED — DO NOT EDIT — run: node build.js */
window.__TBL_ENV__ = ${JSON.stringify(env, null, 2)};
`;

fs.mkdirSync('scripts', { recursive: true });
fs.writeFileSync(path.join('scripts', 'env.js'), output, 'utf8');

console.log('✅ Built scripts/env.js with', Object.keys(env).length, 'variables.');