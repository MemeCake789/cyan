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
    console.log('Processing gamePath:', gamePath);

    // Use jsDelivr CDN instead of raw.githubusercontent.com
    const cdnUrl = `https://cdn.jsdelivr.net/gh/Cyanide-App/cyan-assets@main/${gamePath}`;
    console.log('Fetching from CDN:', cdnUrl);

    const response = await fetch(cdnUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from CDN: ${response.status} for URL: ${cdnUrl}`);
    }

    const content = await response.text();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    return res.end(content);

  } catch (error) {
    console.error('Error downloading game:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html');
    return res.end(`<html><body><h1>Error Loading Game</h1><p>${error.message}</p></body></html>`);
  }
}
