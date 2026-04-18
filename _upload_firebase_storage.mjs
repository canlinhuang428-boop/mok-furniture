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
const destFileName = `products/white_bg_${Date.now()}.jpg`;
await bucket.upload('/tmp/white_bg_product.jpg', { destination: destFileName, public: true });
const [url] = await bucket.file(destFileName).getPublicUrl();
console.log(url);
