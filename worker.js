export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.replace(/^\//, "") || "test.txt";
    
    if (key === "test") {
      return new Response("Worker R2 access OK! env keys: " + Object.keys(env).join(", "));
    }
    
    try {
      const object = await env.MOK_IMAGES.get(key);
      if (!object) {
        return new Response("Not found: " + key, { status: 404 });
      }
      const data = await object.arrayBuffer();
      return new Response(data, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*",
        }
      });
    } catch(e) {
      return new Response("Error: " + e.message, { status: 502 });
    }
  }
};
