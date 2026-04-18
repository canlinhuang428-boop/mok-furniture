const admin = require('firebase-admin');
const { readFileSync } = require('fs');

const serviceAccount = JSON.parse(readFileSync('./firebase-admin.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'th-mok.firebasestorage.app'
  });
}

async function upload(imagePath) {
  const bucket = admin.storage().bucket('th-mok.firebasestorage.app');
  const timestamp = Date.now();
  const filename = imagePath.split('/').pop();
  const destFileName = `products/${filename.replace(/\.[^.]+$/, '')}_${timestamp}.jpg`;
  
  const [uploadedFile] = await bucket.upload(imagePath, {
    destination: destFileName,
  });

  await uploadedFile.acl.add({ entity: 'allUsers', role: 'READER' });
  
  // GCS direct URL - works for Facebook/website
  const publicUrl = `https://storage.googleapis.com/th-mok.firebasestorage.app/${destFileName}`;
  console.log(publicUrl);
  return publicUrl;
}

upload(process.argv[2] || '/tmp/white_bg_product.jpg').catch(e => {
  console.error(e.message);
  process.exit(1);
});
