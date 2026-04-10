export default {
    async fetch(request, env, ctx) {
        // We clone the request because we need to modify headers
        const url = new URL(request.url);
        
        // Swap out the domain with our target
        url.hostname = env.TARGET_HOST;
        
        // Create new headers based on the original request
        const newHeaders = new Headers(request.headers);
        
        // FORCED PATCH: Add Cloudflare Access Service Token
        // These come from `wrangler secret put`
        if (env.CF_ACCESS_CLIENT_ID && env.CF_ACCESS_CLIENT_SECRET) {
            newHeaders.set('CF-Access-Client-Id', env.CF_ACCESS_CLIENT_ID);
            newHeaders.set('CF-Access-Client-Secret', env.CF_ACCESS_CLIENT_SECRET);
        } else {
            console.warn("Missing CF_ACCESS_CLIENT_ID or CF_ACCESS_CLIENT_SECRET in env.");
        }
        
        // Swap User-Agent to bypass WAF
        newHeaders.set('user-agent', env.BROWSER_UA);
        newHeaders.set('host', env.TARGET_HOST);
        
        // Remove tracking SDK headers that flag it as a bot
        newHeaders.delete('x-stainless-retry-count');
        newHeaders.delete('x-stainless-lang');
        newHeaders.delete('x-stainless-package-version');
        newHeaders.delete('x-stainless-os');
        newHeaders.delete('x-stainless-arch');
        newHeaders.delete('x-stainless-runtime');
        newHeaders.delete('x-stainless-runtime-version');

        // Create the new forwarded request
        const proxyRequest = new Request(url.toString(), {
            method: request.method,
            headers: newHeaders,
            body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
            redirect: 'follow'
        });

        try {
            const response = await fetch(proxyRequest);
            
            // Create a new response to possibly modify headers from the target before sending back
            const proxyResponse = new Response(response.body, response);
            return proxyResponse;
        } catch (error) {
            return new Response(`Bridge Error: ${error.message}`, { status: 500 });
        }
    },
};
