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

    // Check if running in production (Vercel)
    const isProduction = process.env.VERCEL_ENV === 'production';

    if (isProduction) {
      // TODO: Implement Vercel Blob caching for production
      // For now, fall back to direct GitHub URLs
      const baseUrl = `https://raw.githubusercontent.com/Cyanide-App/cyan-assets/main/${gamePath}`;
      console.log('Production: Returning GitHub URL:', baseUrl);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        cached: false,
        url: baseUrl,
        gamePath,
        isProduction: true
      }));
    } else {
      // Local development: serve files directly from GitHub
      const baseUrl = `https://raw.githubusercontent.com/Cyanide-App/cyan-assets/main/${gamePath}`;
      console.log('Local dev: Returning baseUrl:', baseUrl);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        cached: false,
        url: baseUrl,
        gamePath,
        isLocalDev: true
      }));
    }

  } catch (error) {
    console.error('Error in download API:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ message: `Error downloading game: ${error.message}` }));
  }
}
