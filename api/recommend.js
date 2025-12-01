import { put } from '@vercel/blob';

// Helper to parse body if needed (for local dev)
const parseBody = async (req) => {
  if (req.body) return req.body;
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
};

export default async function (req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  try {
    const body = await parseBody(req);
    const { gameName } = body;

    if (!gameName) {
      res.status(400).json({ message: 'Game name is required' });
      return;
    }

    const filename = `recommendations/${Date.now()}-${gameName.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    await put(filename, `Game recommended: ${gameName}`, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    res.status(200).json({ message: 'Game recommended successfully!' });
  } catch (error) {
    console.error('Error recommending game:', error);
    res.status(500).json({ message: 'Failed to recommend game.' });
  }
}