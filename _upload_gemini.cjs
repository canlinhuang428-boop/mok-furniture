const admin = require('firebase-admin/app');
const { initializeApp, cert } = admin;
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('./firebase-admin.json', 'utf8'));

if (!initializeApp.apps.length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'th-mok.firebasestorage.app'
  });
}

const bucket = getStorage().bucket();
const destFileName = `product-images/${Date.now()}-y06e.jpg`;

async function upload() {
  await bucket.upload('/tmp/y06e_ref.jpg', {
    destination: destFileName,
    metadata: { contentType: 'image/jpeg' }
  });
  await bucket.file(destFileName).makePublic();
  const url = `https://storage.googleapis.com/${bucket.name}/${destFileName}`;
  console.log('URL:', url);
}

upload().catch(err => console.error('Error:', err.message));
