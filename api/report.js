import { put } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function POST(request) {
  const { bugDescription } = await request.json();
  const blob = await put(bugDescription, `Bug reported: ${bugDescription}`, { access: 'public' });
  return new Response(JSON.stringify({ message: 'Bug reported successfully!' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}