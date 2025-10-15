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

  const { bugDescription } = request.body;

  if (!bugDescription) {
    return response.status(400).json({ message: 'Bug description is required' });
  }

  try {
    const blob = await put(`bugs/${Date.now()}.txt`, bugDescription, { access: 'public', token: 'vercel_blob_rw_WJA6h46rd9DG68JT_sZ3r0sJ1LghydSfCs6CAm8lChSrCia' });
    return response.status(200).json({ message: 'Bug report received!', url: blob.url });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Error saving bug report' });
  }
}