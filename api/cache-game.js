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

  const { gameLink, gameTitle } = request.body;

  if (!gameLink || !gameTitle) {
    return response.status(400).json({ message: 'gameLink and gameTitle are required' });
  }

  try {
    const folder = gameLink.replace(/^cyan-assets\//, '').replace(/\/[^/]+$/, '');
    const allFiles = await getAllFiles(folder);
    console.log(`Loaded files for ${gameTitle}:`, allFiles);

    const htmlPath = gameLink;
    const htmlResponse = await fetch(`https://cyan-assets.vercel.app/${htmlPath}`);
    if (!htmlResponse.ok) {
      throw new Error('Failed to fetch HTML');
    }

    let htmlContent = await htmlResponse.text();

    // Modify HTML to use absolute URLs for relative paths
    htmlContent = htmlContent.replace(/(src|href)="([^"]*)"/g, (match, attr, url) => {
      if (url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) {
        return match;
      }
      const absoluteUrl = `https://cyan-assets.vercel.app/${folder}/${url}`;
      return `${attr}="${absoluteUrl}"`;
    });

    return response.status(200).json({ htmlContent, assets: allFiles });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Error loading game' });
  }
}

async function getAllFiles(path) {
  const url = `https://api.github.com/repos/MemeCake789/cyan-assets/contents/${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch contents for ${path}`);
  }

  const items = await res.json();
  let files = [];

  for (const item of items) {
    if (item.type === 'file') {
      files.push(item.path);
    } else if (item.type === 'dir') {
      const subFiles = await getAllFiles(item.path);
      files = files.concat(subFiles);
    }
  }

  return files;
}