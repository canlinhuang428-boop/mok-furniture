const admin = require('firebase-admin');
const { readFileSync, createWriteStream } = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const serviceAccount = JSON.parse(readFileSync('./firebase-admin.json'));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount), storageBucket: 'th-mok.firebasestorage.app' });
}

const POYO_API_KEY = 'sk-ut4o6dR4AdTpk_hWnjPL_k_Y6-TPIJs0NlnYE5h_IShySKqUWii1S-0FOfhXY2';

async function uploadToFirebaseStorage(localPath, destName) {
  const bucket = admin.storage().bucket('th-mok.firebasestorage.app');
  const [uploadedFile] = await bucket.upload(localPath, { destination: destName, public: true });
  await uploadedFile.acl.add({ entity: 'allUsers', role: 'READER' });
  return `https://storage.googleapis.com/th-mok.firebasestorage.app/${destName}`;
}

async function httpGet(url, headers) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = { hostname: parsedUrl.hostname, port: parsedUrl.port, path: parsedUrl.pathname + parsedUrl.search, method: 'GET', headers };
    const req = (parsedUrl.protocol === 'https:' ? https : http).request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function httpPost(url, body, headers) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname, port: parsedUrl.port, path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }
    };
    const req = (parsedUrl.protocol === 'https:' ? https : http).request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath);
    const parsedUrl = new URL(url);
    const options = { hostname: parsedUrl.hostname, port: parsedUrl.port, path: parsedUrl.pathname + parsedUrl.search };
    const req = https.get(options, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      } else {
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    });
    req.on('error', reject);
  });
}

async function pollTask(taskId, maxWait = 180000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const r = await httpGet(`https://api.poyo.ai/api/generate/status/${taskId}`, { 'Authorization': `Bearer ${POYO_API_KEY}` });
    const data = JSON.parse(r.body);
    const status = data.data?.status;
    console.log('Status:', status);
    if (status === 'finished') return data.data;
    if (status === 'failed') throw new Error('Task failed: ' + (data.data?.error_message || ''));
    await new Promise(r => setTimeout(r, 5000));
  }
  throw new Error('Timeout waiting for task');
}

async function main() {
  const sourcePath = '/Users/huangcanlin/.openclaw/media/inbound/5b40b774-2779-4a8e-ac44-b4e0f730c068.jpg';
  const sourceName = 'sources/product_source_' + Date.now() + '.jpg';
  
  console.log('Uploading source image to Firebase Storage...');
  const sourceUrl = await uploadToFirebaseStorage(sourcePath, sourceName);
  console.log('Source URL:', sourceUrl);

  console.log('Submitting PoYo Nano Banana 2 edit task...');
  const submitBody = {
    model: 'nano-banana-2-new-edit',
    input: {
      prompt: 'Remove the background completely and replace with a pure white background. The product must be centered in the frame with exactly 8% whitespace at the top and 8% whitespace at the bottom. Keep the product exactly as it appears - same color, shape, size, material, proportions, and all details. No text, logos, watermarks, or any other elements added. High quality professional e-commerce product photo. 1:1 square format.',
      image_urls: [sourceUrl],
      size: '1:1',
      resolution: '2K'
    }
  };
  
  const r = await httpPost('https://api.poyo.ai/api/generate/submit', submitBody, { 'Authorization': `Bearer ${POYO_API_KEY}` });
  const submitData = JSON.parse(r.body);
  if (submitData.code !== 200) throw new Error('Submit failed: ' + r.body);
  
  const taskId = submitData.data.task_id;
  console.log('Task ID:', taskId);

  console.log('Waiting for generation...');
  const result = await pollTask(taskId);
  
  const outputUrl = result.files?.[0]?.file_url;
  console.log('Output URL:', outputUrl);
  
  const outPath = '/tmp/nano_banana_result.jpg';
  await downloadFile(outputUrl, outPath);
  
  const finalUrl = await uploadToFirebaseStorage(outPath, 'products/nano_banana_' + Date.now() + '.jpg');
  console.log('FINAL_URL:', finalUrl);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
