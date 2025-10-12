// public/game-worker.js

const CACHE_NAME = 'cyan-game-cache-v1';
const GITHUB_REPO = 'MemeCake789/cyan-assets';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting(); // Activate new service worker immediately
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  self.clients.claim(); // Take control of all clients immediately
});

self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'CACHE_GAME') {
    const { gameLink, gameTitle } = event.data;
    console.log(`Service Worker received message to cache game: ${gameTitle} at ${gameLink}`);

    const gameFolderPath = gameLink.substring(0, gameLink.lastIndexOf('/'));

    try {
      // 1. Get the SHA of the main branch
      const branchResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/branches/main`);
      if (!branchResponse.ok) {
        throw new Error(`GitHub Branch API error: ${branchResponse.status} - ${branchResponse.statusText}`);
      }
      const branchData = await branchResponse.json();
      const treeSha = branchData.commit.sha;

      // 2. Get the recursive tree for the entire repository
      const treeResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/git/trees/${treeSha}?recursive=1`);
      if (!treeResponse.ok) {
        throw new Error(`GitHub Tree API error: ${treeResponse.status} - ${treeResponse.statusText}`);
      }
      const treeData = await treeResponse.json();

      const filesToCache = [];
      const rawBaseUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/`;

      // 3. Filter files relevant to the game folder
      for (const item of treeData.tree) {
        if (item.type === 'blob' && item.path.startsWith(gameFolderPath)) {
          filesToCache.push({
            path: item.path,
            download_url: `${rawBaseUrl}${item.path}`,
          });
        }
      }

      // Also add the main HTML file itself if it's not already in the list
      const mainHtmlFileInTree = filesToCache.some(file => file.path === gameLink);
      if (!mainHtmlFileInTree) {
        filesToCache.push({
          path: gameLink,
          download_url: `${rawBaseUrl}${gameLink}`,
        });
      }

      const cache = await caches.open(CACHE_NAME);
      const cachePromises = filesToCache.map(async (file) => {
        const githubFileUrl = file.download_url;

        try {
          const fileResponse = await fetch(githubFileUrl);
          if (fileResponse.ok) {
            await cache.put(githubFileUrl, fileResponse);
            console.log(`Cached: ${file.path}`);
          } else {
            console.error(`Failed to cache ${file.path}: ${fileResponse.status}`);
          }
        } catch (error) {
          console.error(`Error fetching or caching ${file.path}:`, error);
        }
      });

      await Promise.all(cachePromises);
      event.source.postMessage({ type: 'GAME_CACHED', gameLink });
      console.log(`All files for ${gameTitle} cached.`);

    } catch (error) {
      console.error('Service Worker caching failed:', error);
      event.source.postMessage({ type: 'CACHE_ERROR', gameLink, error: error.message });
    }
  }
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  const origin = self.location.origin;

  // 1. Intercept the initial /cached-game/ request for the main HTML file
  if (requestUrl.pathname.startsWith('/cached-game/')) {
    const encodedGameLink = requestUrl.pathname.replace('/cached-game/', '');
    const gameLink = decodeURIComponent(encodedGameLink);
    const gameHtmlGithubUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${gameLink}`;

    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(gameHtmlGithubUrl);
        if (cachedResponse) {
          console.log('Serving main HTML from cache:', gameHtmlGithubUrl);
          const htmlText = await cachedResponse.text();

          // Rewrite relative URLs in the HTML to point to our service worker's scope
          // This is crucial for assets loaded by the iframe
          const rewrittenHtml = htmlText.replace(
            /(src|href|url)="([^'"#]+)"/g,
            (match, attr, relativePath) => {
              if (relativePath.startsWith('http') || relativePath.startsWith('//')) {
                return match; // Already absolute
              }
              // Construct the full GitHub path for the asset
              const gameFolderPath = gameLink.substring(0, gameLink.lastIndexOf('/'));
              const fullGithubAssetPath = `${gameFolderPath}/${relativePath}`.replace(/\/\.\//g, '/'); // Normalize paths
              const fullGithubAssetUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${fullGithubAssetPath}`;
              return `${attr}="${fullGithubAssetUrl}"`;
            }
          );

          return new Response(rewrittenHtml, {
            headers: { 'Content-Type': 'text/html' },
          });
        }
        // If main HTML not in cache, try network (shouldn't happen if CACHE_GAME worked)
        console.warn('Main HTML not found in cache, fetching from network:', gameHtmlGithubUrl);
        return fetch(gameHtmlGithubUrl);
      })
    );
    return;
  }

  // 2. Intercept requests for assets (images, scripts, css) that are now absolute GitHub raw URLs
  //    These requests will come from the iframe after the HTML has been rewritten.
  if (requestUrl.origin === 'https://raw.githubusercontent.com' && requestUrl.pathname.startsWith(`/${GITHUB_REPO}/main/`)) {
    event.respondWith(
      caches.match(event.request).then(async (cachedResponse) => {
        if (cachedResponse) {
          console.log('Serving asset from cache:', event.request.url);
          return cachedResponse;
        }
        // If asset not in cache (e.g., new asset or cache miss), try network
        console.log('Fetching asset from network:', event.request.url);
        return fetch(event.request);
      })
    );
    return;
  }

  // For all other requests (e.g., /games.json, external resources), go to network
  event.respondWith(fetch(event.request));
});
