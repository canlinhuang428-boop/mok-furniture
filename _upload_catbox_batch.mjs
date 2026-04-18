import fs from 'fs';

const images = [
  'products/MR01_1.jpg',
  'products/MR01_2.jpg',
  'products/MR01_3.jpg',
  'products/Y06A_1.jpg',
  'products/Y06A_2.jpg',
  'products/Y06A_3.jpg',
  'products/Y06A_4.jpg',
  'products/Y08B_1.jpg',
  'products/Y08B_2.jpg',
  'products/logo.jpg',
];

const base = '/Users/huangcanlin/mok-furniture/product-images';
const results = {};

for (const img of images) {
  const file = img.replace('products/', '');
  const path = `${base}/${file}`;
  console.log(`Uploading ${file}...`);
  try {
    const { execSync } = await import('child_process');
    const cmd = `curl -s -F "reqtype=fileupload" -F "fileToUpload=@${path}" https://catbox.moe/user/api.php`;
    const url = execSync(cmd, { encoding: 'utf8' }).trim();
    results[img] = url;
    console.log(`  → ${url}`);
  } catch (e) {
    console.error(`  ✗ Failed: ${e.message}`);
    results[img] = null;
  }
}

fs.writeFileSync('/Users/huangcanlin/mok-furniture/catbox_uploaded.json', JSON.stringify(results, null, 2));
console.log('\nDone. Results saved to catbox_uploaded.json');
