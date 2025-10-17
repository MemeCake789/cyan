import { put, head } from '@vercel/blob';

const MESSAGES_FILE = 'messages.json';

export default async function handler(request, response) {
  // Add CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method === 'GET') {
    try {
      const blob = await head(MESSAGES_FILE);
      if (!blob) {
        return response.status(200).json({ messages: [] });
      }
      const res = await fetch(blob.url);
      const data = await res.json();
      return response.status(200).json(data);
    } catch (error) {
      console.error(error);
      return response.status(200).json({ messages: [] });
    }
  }

  if (request.method === 'POST') {
    const { message, name } = request.body;

    if (!message) {
      return response.status(400).json({ message: 'Message is required' });
    }

    const displayName = name || 'Anonymous';

    try {
      let messages = [];
      try {
        const blob = await head(MESSAGES_FILE);
        if (blob) {
          const res = await fetch(blob.url);
          messages = await res.json();
        }
      } catch {
        // File doesn't exist, start with empty array
      }

      messages.push({ message, name: displayName, timestamp: new Date().toISOString() });

      await put(MESSAGES_FILE, JSON.stringify(messages), { access: 'public' });
      return response.status(200).json({ message: 'Message added!' });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: 'Error saving message' });
    }
  }

  return response.status(405).json({ message: 'Method Not Allowed' });
}