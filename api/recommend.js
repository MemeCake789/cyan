
import { put } from '@vercel/blob';

export default async function handler(request, response) {
  // Add CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  let body;
  try {
    body = JSON.parse(request.body);
  } catch (error) {
    return response.status(400).json({ message: 'Invalid JSON' });
  }
  const { gameName } = body;

  if (!gameName) {
    return response.status(400).json({ message: 'Game name is required' });
  }

  try {
    const blob = await put(`recommendations/${gameName}.txt`, gameName, { access: 'public' });
    return response.status(200).json({ message: 'Recommendation received!', url: blob.url });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Error saving recommendation' });
  }
}
