import { put } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function POST(request) {
  try {
    const { bugDescription } = await request.json();
    if (!bugDescription) {
      return new Response(JSON.stringify({ message: 'Bug description is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const filename = `reports/${Date.now()}-bug.txt`;
    await put(filename, `Bug reported: ${bugDescription}`, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return new Response(JSON.stringify({ message: 'Bug reported successfully!' }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error reporting bug:', error);
    return new Response(JSON.stringify({ message: 'Failed to report bug.' }), {
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