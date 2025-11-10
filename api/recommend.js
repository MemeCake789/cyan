import { put } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function POST(request) {
  const { gameName } = await request.json();
  const blob = await put(gameName, `Game recommended: ${gameName}`, { access: 'public' });
  return new Response(JSON.stringify({ message: 'Game recommended successfully!' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}