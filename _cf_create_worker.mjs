const CF_EMAIL = "canlinhuang428@gmail.com";
const CF_KEY = "cfk_d53KTxXxdrsrxwiXVMrjWXtVPa6LH7c77iNkrbha5648611d";
const ACCOUNT_ID = "624d271534a836f9b85c3211a7e705ab";

async function cfApi(path, method, body, extraHeaders) {
  const resp = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      "X-Auth-Key": CF_KEY,
      "X-Auth-Email": CF_EMAIL,
      "Content-Type": "application/json",
      ...(extraHeaders || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: resp.status, body: await resp.json() };
}

async function main() {
  // 1. Create a Workers API Token using the Global Key
  console.log("=== Creating Workers API Token ===");
  const token = await cfApi("/user/tokens", "POST", {
    name: "mok-furniture-worker",
    policies: [
      {
        effect: "allow",
        resources: {
          [`com.cloudflare.account.${ACCOUNT_ID}`]: {
            "reqFilters.workers.bridge": {},
          }
        },
        permission_groups: [
          { id: "53a5d0f8-1b37-11ec-8f6d-8f6b00f68c11" } // Workers Scripts Edit
        ]
      },
      {
        effect: "allow",
        resources: { [`com.cloudflare.account.${ACCOUNT_ID}`]: {} },
        permission_groups: [
          { id: "c8b9c3a8-1b37-11ec-8f6d-8f6b00f68c11" } // Workers Routes Edit
        ]
      }
    ]
  });
  console.log("Create token status:", token.status);
  console.log("Result:", JSON.stringify(token.body).substring(0, 300));

  if (!token.body.success) {
    // Try a different approach - use the permission by name
    console.log("\n=== Trying zone-based permission ===");
    const token2 = await cfApi("/user/tokens", "POST", {
      name: "mok-furniture-worker-v2",
      policies: [
        {
          effect: "allow",
          resources: { "com.cloudflare.account.*": {} },
          permission_groups: [
            { id: "53a5d0f8-1b37-11ec-8f6d-8f6b00f68c11" }
          ]
        }
      ]
    });
    console.log("Token v2 status:", token2.status);
    console.log("Result:", JSON.stringify(token2.body).substring(0, 300));
  }
}

main().catch(console.error);
