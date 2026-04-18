import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./firebase-admin.json'));

if (!initializeApp.apps.length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'th-mok.firebasestorage.app'
  });
}

const bucket = getStorage().bucket();
const destFileName = `product-images/${Date.now()}.jpg`;
await bucket.upload('/tmp/y06e_ref.jpg', { destination: destFileName, public: true });
const [url] = await bucket.file(destFileName).getPublicUrl();
console.log(url);
