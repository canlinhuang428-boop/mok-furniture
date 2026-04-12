const CF_EMAIL = "canlinhuang428@gmail.com";
const CF_KEY = "cfk_d53KTxXxdrsrxwiXVMrjWXtVPa6LH7c77iNkrbha5648611d";
const ACCOUNT_ID = "6fec257ce1fa5321a4fa21e2d8e87438";

const workerScript = `addEventListener("fetch", e => e.respondWith(new Response("hello mkimg", {headers:{"Content-Type":"text/plain"}})));`;

async function main() {
  const scriptName = "mkimg";
  const putResp = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/scripts/${scriptName}`,
    {
      method: "PUT",
      headers: {
        "X-Auth-Key": CF_KEY,
        "X-Auth-Email": CF_EMAIL,
        "Content-Type": "application/javascript",
      },
      body: workerScript,
    }
  );
  console.log("Deploy mkimg:", putResp.status, putResp.status === 200 ? "✅" : "❌");
  if (putResp.status !== 200) {
    console.log(await putResp.text().then(t => t.substring(0, 200)));
  } else {
    await new Promise(r => setTimeout(r, 3000));
    const r = await fetch("https://mkimg.canlinhuang428.workers.dev/");
    const text = await r.text();
    console.log("mkimg.canlinhuang428.workers.dev status:", r.status, "| body:", text.substring(0, 100));
    
    // Also test the original mok-images
    const r2 = await fetch("https://mok-images.canlinhuang428.workers.dev/test");
    const t2 = await r2.text();
    console.log("mok-images.canlinhuang428.workers.dev status:", r2.status, "| body:", t2.substring(0, 100));
  }
}

main().catch(console.error);
