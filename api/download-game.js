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
      const cdnUrl = `https://cdn.jsdelivr.net/gh/MemeCake789/cyan-assets@main/${path}`;
     console.log('Fetching from CDN:', cdnUrl);

     const response = await fetch(cdnUrl);
     if (!response.ok) {
       throw new Error(`Failed to fetch from CDN: ${response.status} for URL: ${cdnUrl}`);
     }

      const isHtml = decodedGamePath.endsWith('.html');
      if (isHtml) {
        // Serve HTML with inlined assets
        const content = await response.text();
        const folder = decodedGamePath.substring(0, decodedGamePath.lastIndexOf('/') + 1);
        let modifiedContent = content;

        // Inline scripts
        const scriptMatches = [...content.matchAll(/<script[^>]*src="([^"]*)"[^>]*><\/script>/g)];
        for (const match of scriptMatches) {
          let src = match[1];
          if (!src.startsWith('http') && !src.startsWith('//')) {
            if (src.startsWith('/')) src = src.substring(1); // Make absolute paths relative
            try {
              const assetPath = folder + src.split('?')[0];
              const assetUrl = `https://cdn.jsdelivr.net/gh/MemeCake789/cyan-assets@main/${assetPath}`;
              const assetResponse = await fetch(assetUrl);
              if (assetResponse.ok) {
                const assetContent = await assetResponse.text();
                modifiedContent = modifiedContent.replace(match[0], `<script>${assetContent}</script>`);
              }
            } catch {}
          }
        }

        // Inline styles
        const styleMatches = [...content.matchAll(/<link[^>]*href="([^"]*\.css[^"]*)"[^>]*>/g)];
        for (const match of styleMatches) {
          let href = match[1];
          if (!href.startsWith('http') && !href.startsWith('//')) {
            if (href.startsWith('/')) href = href.substring(1); // Make absolute paths relative
            try {
              const assetPath = folder + href.split('?')[0];
              const assetUrl = `https://cdn.jsdelivr.net/gh/MemeCake789/cyan-assets@main/${assetPath}`;
              const assetResponse = await fetch(assetUrl);
              if (assetResponse.ok) {
                const assetContent = await assetResponse.text();
                modifiedContent = modifiedContent.replace(match[0], `<style>${assetContent}</style>`);
              }
            } catch {}
          }
        }

        // Inline images
        const imgMatches = [...content.matchAll(/<img[^>]*src="([^"]*)"[^>]*>/g)];
        for (const match of imgMatches) {
          let src = match[1];
          if (!src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
            if (src.startsWith('/')) src = src.substring(1); // Make absolute paths relative
            try {
              const assetPath = folder + src.split('?')[0];
              const assetUrl = `https://cdn.jsdelivr.net/gh/MemeCake789/cyan-assets@main/${assetPath}`;
              const assetResponse = await fetch(assetUrl);
              if (assetResponse.ok) {
                const buffer = await assetResponse.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const mime = assetResponse.headers.get('content-type') || 'image/png';
                modifiedContent = modifiedContent.replace(match[0], match[0].replace(match[1], `data:${mime};base64,${base64}`));
              }
            } catch {}
          }
        }

        // Make any remaining absolute paths relative
        modifiedContent = modifiedContent.replace(/src="\/([^"]*)"/g, 'src="$1"');
        modifiedContent = modifiedContent.replace(/href="\/([^"]*\.css[^"]*)"/g, 'href="$1"');
        modifiedContent = modifiedContent.replace(/src="\/([^"]*)"/g, 'src="$1"'); // for images

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
