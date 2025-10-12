// public/game-worker.js

const CACHE_NAME = 'cyan-game-cache-v1';
const GITHUB_REPO = 'MemeCake789/cyan-assets';

// Helper function to determine MIME type based on file extension
function getMimeType(filePath) {
  const ext = filePath.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js': return 'application/javascript';
    case 'css': return 'text/css';
    case 'html': return 'text/html';
    case 'json': return 'application/json';
    case 'png': return 'image/png';
    case 'jpg': return 'image/jpeg';
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/svg+xml';
    case 'wasm': return 'application/wasm';
    case 'unityweb': return 'application/octet-stream'; // Unity specific binary
    case 'zip': return 'application/zip';
    // Add more as needed
    default: return 'application/octet-stream';
  }
}

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

    // Adjust gameLink to be relative to the repo root (e.g., 'HTML/Bitlife/index.html')
    const gameRepoPath = gameLink.startsWith('cyan-assets/') ? gameLink.substring('cyan-assets/'.length) : gameLink;
    const gameFolderPath = gameRepoPath.substring(0, gameRepoPath.lastIndexOf('/'));

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
            path: item.path, // This is already relative to repo root
            download_url: `${rawBaseUrl}${item.path}`,
          });
        }
      }

      // Ensure the main HTML file is in the list
      const mainHtmlFileInTree = filesToCache.some(file => file.path === gameRepoPath);
      if (!mainHtmlFileInTree) {
        filesToCache.push({
          path: gameRepoPath,
          download_url: `${rawBaseUrl}${gameRepoPath}`,
        });
      }

      const cache = await caches.open(CACHE_NAME);
      const cachePromises = filesToCache.map(async (file) => {
        const githubFileUrl = file.download_url; // This is the full raw GitHub URL

        try {
          const fileResponse = await fetch(githubFileUrl);
          if (fileResponse.ok) {
            const headers = new Headers(fileResponse.headers);
            headers.set('Content-Type', getMimeType(file.path));
            const newResponse = new Response(fileResponse.body, { headers });
            await cache.put(githubFileUrl, newResponse);
            console.log(`Cached with MIME type ${getMimeType(file.path)}: ${file.path}`);
          } else {
            console.error(`Failed to cache ${file.path}: ${fileResponse.status}`);
          }
        } catch (error) {
          console.error(`Error fetching or caching ${file.path}:`, error);
        }
      });

      await Promise.all(cachePromises);
      console.log(`All files for ${gameTitle} cached.`);

      // Now, fetch the main HTML, rewrite its URLs, and send it back to the client
      const mainHtmlResponse = await cache.match(`${rawBaseUrl}${gameRepoPath}`); // Get from cache
      if (!mainHtmlResponse) {
        throw new Error('Main HTML not found in cache after caching process.');
      }
      const htmlText = await mainHtmlResponse.text();

      // Inject a <base> tag to handle relative paths correctly.
      const baseHref = `${rawBaseUrl}${gameFolderPath}/`;

      let rewrittenHtml = htmlText;
      if (rewrittenHtml.includes('<head>')) {
        rewrittenHtml = rewrittenHtml.replace('<head>', `<head><base href="${baseHref}">`);
      } else {
        rewrittenHtml = `<head><base href="${baseHref}"></head>${rewrittenHtml}`;
      }

      // 2. Defer the UnityLoader instantiation script
      rewrittenHtml = rewrittenHtml.replace(
        '<script>UnityLoader.instantiate(',
        '<script>window.onload = function() { UnityLoader.instantiate('
      );
      rewrittenHtml = rewrittenHtml.replace(
        'onProgress: UnityProgress});</script>',
        'onProgress: UnityProgress}) };</script>'
      );

      event.source.postMessage({ type: 'GAME_CACHED_HTML', gameLink, htmlContent: rewrittenHtml });

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

          // Inject a <base> tag to handle relative paths correctly.
          const gameFolderPath = gameLink.substring(0, gameLink.lastIndexOf('/'));
          const baseHref = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${gameFolderPath}/`;

          let rewrittenHtml = htmlText;
          if (rewrittenHtml.includes('<head>')) {
            rewrittenHtml = rewrittenHtml.replace('<head>', `<head><base href="${baseHref}">`);
          } else {
            rewrittenHtml = `<head><base href="${baseHref}"></head>${rewrittenHtml}`;
          }

          // 2. Defer the UnityLoader instantiation script
      rewrittenHtml = rewrittenHtml.replace(
        '<script>UnityLoader.instantiate(',
        '<script>window.onload = function() { UnityLoader.instantiate('
      );
      rewrittenHtml = rewrittenHtml.replace(
        'onProgress: UnityProgress});</script>',
        'onProgress: UnityProgress}) };</script>'
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
          const headers = new Headers(cachedResponse.headers);
          const assetPathInRepo = requestUrl.pathname.replace(`/${GITHUB_REPO}/main/`, '');
          headers.set('Content-Type', getMimeType(assetPathInRepo));
          return new Response(cachedResponse.body, { headers });
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
