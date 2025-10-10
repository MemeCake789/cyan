import fetch from 'node-fetch';

export default async function handler(req, res) {
  console.log('Download API called with query:', req.query);

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    console.log('Method not allowed:', req.method);
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ message: 'Method Not Allowed' }));
  }

  const { gamePath } = req.query;

  if (!gamePath) {
    console.log('No gamePath provided');
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ message: 'Game path is required' }));
  }

   try {
     const decodedGamePath = decodeURIComponent(gamePath);
     const path = decodedGamePath.split('?')[0]; // Remove query params for CDN
     console.log('Processing gamePath:', decodedGamePath, 'path:', path);

     // Use jsDelivr CDN instead of raw.githubusercontent.com
     const cdnUrl = `https://cdn.jsdelivr.net/gh/MemeCake789/cyan-assets/${path}`;
     console.log('Fetching from CDN:', cdnUrl);

     const response = await fetch(cdnUrl);
     if (!response.ok) {
       throw new Error(`Failed to fetch from CDN: ${response.status} for URL: ${cdnUrl}`);
     }

     const isHtml = decodedGamePath.endsWith('.html');
     if (isHtml) {
       // Serve modified HTML with asset paths proxied
       const content = await response.text();
       const folder = decodedGamePath.substring(0, decodedGamePath.lastIndexOf('/') + 1);
       let modifiedContent = content;

       // Modify src attributes
       modifiedContent = modifiedContent.replace(/src="([^"]*)"/g, (match, src) => {
         if (src.startsWith('http') || src.startsWith('//') || src.startsWith('data:')) return match;
         return `src="/api/download-game?gamePath=${folder + src}"`;
       });

       // Modify href for CSS
       modifiedContent = modifiedContent.replace(/href="([^"]*\.css[^"]*)"/g, (match, href) => {
         if (href.startsWith('http') || href.startsWith('//')) return match;
         return `href="/api/download-game?gamePath=${folder + href}"`;
       });

       res.statusCode = 200;
       res.setHeader('Content-Type', 'text/html');
       return res.end(modifiedContent);
     } else {
       // Serve the asset directly
       const content = await response.arrayBuffer();
       const mime = response.headers.get('content-type') || 'application/octet-stream';
       res.statusCode = 200;
       res.setHeader('Content-Type', mime);
       return res.end(Buffer.from(content));
     }

   } catch (error) {
     console.error('Error downloading game:', error);
     res.statusCode = 500;
     res.setHeader('Content-Type', 'text/html');
     return res.end(`<html><body><h1>Error Loading Game</h1><p>${error.message}</p></body></html>`);
   }
}
