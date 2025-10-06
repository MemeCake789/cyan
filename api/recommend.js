
import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const { gameName } = request.body;

  if (!gameName) {
    return response.status(400).json({ message: 'Game name is required' });
  }

  try {
    await kv.lpush('game_recommendations', gameName);
    return response.status(200).json({ message: 'Recommendation received!' });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Error saving recommendation' });
  }
}
