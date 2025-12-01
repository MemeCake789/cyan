import { put } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function POST(request) {
  try {
    const { gameName } = await request.json();
    if (!gameName) {
      return new Response(JSON.stringify({ message: 'Game name is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const filename = `recommendations/${Date.now()}-${gameName.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    await put(filename, `Game recommended: ${gameName}`, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return new Response(JSON.stringify({ message: 'Game recommended successfully!' }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error recommending game:', error);
    return new Response(JSON.stringify({ message: 'Failed to recommend game.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function OPTIONS(request) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}