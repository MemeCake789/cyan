// public/game-worker.js

const CACHE_NAME = "cyan-game-cache-v1";
const GITHUB_REPO = "MemeCake789/cyan-assets";

// Helper function to determine MIME type based on file extension
function getMimeType(filePath) {
  const ext = filePath.split(".").pop().toLowerCase();
  switch (ext) {
    case "js":
      return "application/javascript";
    case "css":
      return "text/css";
    case "html":
      return "text/html";
    case "json":
      return "application/json";
    case "png":
      return "image/png";
    case "jpg":
      return "image/jpeg";
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "wasm":
      return "application/wasm";
    case "unityweb":
      return "application/octet-stream"; // Unity specific binary
    case "zip":
      return "application/zip";
    // Add more as needed
    default:
      return "application/octet-stream";
  }
}

self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  self.skipWaiting(); // Activate new service worker immediately
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating.");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
          return null;
        }),
      );
    }),
  );
  self.clients.claim(); // Take control of all clients immediately
});

self.addEventListener("message", async (event) => {
  if (event.data && event.data.type === "CACHE_GAME") {
    const { gameLink, gameTitle } = event.data;
    console.log(
      `Service Worker received message to cache game: ${gameTitle} at ${gameLink}`,
    );

    // Adjust gameLink to be relative to the repo root (e.g., 'HTML/Bitlife/index.html')
    const gameRepoPath = gameLink.startsWith("cyan-assets/")
      ? gameLink.substring("cyan-assets/".length)
      : gameLink;
    const gameFolderPath = gameRepoPath.substring(
      0,
      gameRepoPath.lastIndexOf("/"),
    );

    try {
      const githubBranchApiUrl = `https://api.github.com/repos/${GITHUB_REPO}/branches/main`;
      console.log("DEBUG: Fetching GitHub Branch API:", githubBranchApiUrl);
      const branchResponse = await fetch(githubBranchApiUrl, { mode: "cors" });
      if (!branchResponse.ok) {
        throw new Error(
          `GitHub Branch API error: ${branchResponse.status} - ${branchResponse.statusText}`,
        );
      }
      const branchData = await branchResponse.json();
      const treeSha = branchData.commit.sha;

      const treeResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/git/trees/${treeSha}?recursive=1`,
        { mode: "cors" },
      );
      if (!treeResponse.ok) {
        throw new Error(
          `GitHub Tree API error: ${treeResponse.status} - ${treeResponse.statusText}`,
        );
      }
      const treeData = await treeResponse.json();

      const filesToCache = [];
      const rawBaseUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/`;

      // Filter files relevant to the game folder
      for (const item of treeData.tree) {
        if (item.type === "blob" && item.path.startsWith(gameFolderPath)) {
          filesToCache.push({
            path: item.path, // This is already relative to repo root
            download_url: `${rawBaseUrl}${item.path}`,
          });
        }
      }

      // Ensure the main HTML file is in the list
      const mainHtmlFileInTree = filesToCache.some(
        (file) => file.path === gameRepoPath,
      );
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
            headers.set("Content-Type", getMimeType(file.path));
            const newResponse = new Response(fileResponse.body, {
              headers,
            });
            await cache.put(githubFileUrl, newResponse);
            console.log(
              `Cached with MIME type ${getMimeType(file.path)}: ${file.path}`,
            );
          } else {
            console.error(
              `Failed to cache ${file.path}: ${fileResponse.status}`,
            );
          }
        } catch (error) {
          console.error(`Error fetching or caching ${file.path}:`, error);
        }
      });

      await Promise.all(cachePromises);
      console.log(`All files for ${gameTitle} cached.`);

      // After all files are cached, retrieve the main HTML and send it to the client
      const mainHtmlGithubUrl = `${rawBaseUrl}${gameRepoPath}`;
      const cachedHtmlResponse = await cache.match(mainHtmlGithubUrl);

      if (cachedHtmlResponse) {
        console.log(`Main HTML file for ${gameTitle} found in cache.`);
        event.source.postMessage({
          type: "GAME_CACHED",
          gameLink: gameLink,
        });
        console.log(`Sent GAME_CACHED for ${gameTitle} to client.`);
      } else {
        console.error(
          `Main HTML file not found in cache after caching all files: ${mainHtmlGithubUrl}`,
        );
        event.source.postMessage({
          type: "CACHE_ERROR",
          gameLink: gameLink,
          error: "Main HTML file not found in cache after caching all files.",
        });
      }
    } catch (error) {
      console.error("Error in CACHE_GAME message handler:", error);
      event.source.postMessage({
        type: "CACHE_ERROR",
        gameLink: gameLink,
        error: error.message,
      });
    }
  }
});

self.addEventListener("fetch", (event) => {
  console.log("DEBUG: Intercepting fetch request for:", event.request.url);
  const requestUrl = new URL(event.request.url);
  const origin = self.location.origin;

  // For all other requests (e.g., /games.json, external resources), go to network
  event.respondWith(fetch(event.request));
});
