const { Redis } = require('@upstash/redis');
const { put } = require('@vercel/blob');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const REPO = 'MemeCake789/cyan-assets';

async function fetchFolderContents(folderPath) {
  const url = `https://api.github.com/repos/${REPO}/contents/${folderPath}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
  return response.json();
}

async function cacheFile(filePath, downloadUrl) {
  // Check if already uploaded
  const existingUrl = await redis.get(`blob:${REPO}:${filePath}`);
  if (existingUrl) return existingUrl;

  const response = await fetch(downloadUrl);
  if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`);
  const buffer = await response.arrayBuffer();
  const { url } = await put(filePath, buffer, { access: 'public' });
  await redis.set(`blob:${REPO}:${filePath}`, url);
  return url;
}

async function loadAndCacheFolder(folderPath) {
  const contents = await fetchFolderContents(folderPath);
  for (const item of contents) {
    if (item.type === 'file') {
      await cacheFile(item.path, item.download_url);
    } else if (item.type === 'dir') {
      // Recursive
      await loadAndCacheFolder(item.path);
    }
  }
  // Mark folder as cached
  await redis.set(`folder:${REPO}:${folderPath}`, 'cached');
}

module.exports = async function handler(request) {
  const url = new URL(request.url);
  const link = url.searchParams.get('link');
  if (!link) return new Response('Missing link param', { status: 400 });

  const folder = link.substring(0, link.lastIndexOf('/')); // Remove file part
  const htmlPath = link;

  // Check if folder is cached
  const cached = await redis.get(`folder:${REPO}:${folder}`);
  if (!cached) {
    try {
      await loadAndCacheFolder(folder);
    } catch (error) {
      console.error('Error caching folder:', error);
      return new Response('Error loading game', { status: 500 });
    }
  }

  // Get HTML content from GitHub
  const htmlResponse = await fetch(`https://raw.githubusercontent.com/${REPO}/main/${htmlPath}`);
  if (!htmlResponse.ok) return new Response('HTML not found', { status: 404 });
  const htmlContent = await htmlResponse.text();

  // Modify HTML to replace relative URLs with Blob URLs
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
        const blobUrl = await redis.get(`blob:${REPO}:${fullPath}`);
        if (blobUrl) {
          tag.attr(attr, blobUrl);
        }
      }
    }
  }

  return new Response($.html(), { headers: { 'Content-Type': 'text/html' } });
}