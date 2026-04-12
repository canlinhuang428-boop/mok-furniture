import { S3Client, PutObjectCommand, CreateBucketCommand, ListBucketsCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

// Simpler: just try PutObject directly to the bucket with path-style
const ACCOUNT_ID = "6fec257ce1fa5321a4fa21e2d8e87438";
const ACCESS_KEY = "e7c99202612edb507480d5df24c93116";
const SECRET_KEY = "7cbfdea6356b26c02d23ce250602b21cf00665e8ef5c7d48b61cfd78b79f67ba";
const BUCKET = "mok-images";
const BASE = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;

// Test with default S3 client (no forcePathStyle)
const client1 = new S3Client({
  region: "auto",
  endpoint: BASE,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

async function test1() {
  console.log("Test 1 - default (virtual-hosted style):");
  try {
    await client1.send(new ListBucketsCommand({}));
    console.log("  ✅ ListBuckets OK");
  } catch(e) {
    console.log(`  ❌ ${e.name}: ${e.message.substring(0, 80)}`);
  }
}
await test1();

// Test with forcePathStyle
const client2 = new S3Client({
  region: "auto",
  endpoint: BASE,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
  forcePathStyle: true,
});

async function test2() {
  console.log("\nTest 2 - forcePathStyle:");
  try {
    await client2.send(new ListBucketsCommand({}));
    console.log("  ✅ ListBuckets OK");
  } catch(e) {
    console.log(`  ❌ ${e.name}: ${e.message.substring(0, 80)}`);
  }
}
await test2();

// Test PutObject with client2 (path style)
async function test3() {
  console.log("\nTest 3 - PutObject (path style):");
  try {
    await client2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: "test/hello.txt",
      Body: Buffer.from("hello"),
      ContentType: "text/plain",
    }));
    console.log("  ✅ PutObject OK");
  } catch(e) {
    console.log(`  ❌ ${e.name}: ${e.message.substring(0, 120)}`);
  }
}
await test3();

// Test CreateBucket if not exists
async function test4() {
  console.log("\nTest 4 - CreateBucket:");
  try {
    await client2.send(new CreateBucketCommand({ Bucket: "mok-images-test" }));
    console.log("  ✅ CreateBucket OK");
  } catch(e) {
    console.log(`  ❌ ${e.name}: ${e.message.substring(0, 120)}`);
  }
}
await test4();
