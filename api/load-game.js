import fetch from 'node-fetch';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const cheerio = require('cheerio');

const REPO = 'MemeCake789/cyan-assets';

export default async function handler(request) {
  const url = new URL(request.url);
  const link = url.searchParams.get('link');
  if (!link) return new Response('Missing link param', { status: 400 });

  const folder = link.substring(0, link.lastIndexOf('/')); // Remove file part
  const htmlPath = link;

  // Get HTML content from GitHub
  const htmlResponse = await fetch(`https://raw.githubusercontent.com/${REPO}/main/${htmlPath}`);
  if (!htmlResponse.ok) return new Response('HTML not found', { status: 404 });
  const htmlContent = await htmlResponse.text();

  // Modify HTML to replace relative URLs with GitHub raw URLs
  const $ = cheerio.load(htmlContent);
  const elements = $('script[src], link[href], img[src]');
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const tag = $(el);
    const attr = tag.attr('src') ? 'src' : tag.attr('href') ? 'href' : null;
    if (attr) {
      const val = tag.attr(attr);
      if (val && !val.startsWith('http') && !val.startsWith('//')) {
        const fullPath = `${folder}/${val}`;
        const githubUrl = `https://raw.githubusercontent.com/${REPO}/main/${fullPath}`;
        tag.attr(attr, githubUrl);
      }
    }
  }

  return new Response($.html(), { headers: { 'Content-Type': 'text/html' } });
}