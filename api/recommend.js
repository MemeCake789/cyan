
import { put } from '@vercel/blob';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const { gameName } = request.body;

  if (!gameName) {
    return response.status(400).json({ message: 'Game name is required' });
  }

  try {
    const { url } = await put(`recommendations/${gameName}.txt`, gameName, { access: 'public' });
    return response.status(200).json({ message: 'Recommendation received!', url });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Error saving recommendation' });
  }
}
