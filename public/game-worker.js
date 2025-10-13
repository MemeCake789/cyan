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
        let htmlContent = await cachedHtmlResponse.text();
        let rewrittenHtml = htmlContent; // Initialize with original HTML

        console.log("DEBUG: gameLink", gameLink);
        console.log("DEBUG: gameFolderPath", gameFolderPath);
        console.log("DEBUG: rawBaseUrl", rawBaseUrl);

        // 1. Inject a <base> tag to handle relative paths correctly.
        const baseHref = `${rawBaseUrl}${gameFolderPath}/`;
        console.log("DEBUG: baseHref", baseHref);
        if (rewrittenHtml.includes("<head>")) {
          rewrittenHtml = rewrittenHtml.replace(
            "<head>",
            `<head><base href="${baseHref}">`,
          );
        } else {
          rewrittenHtml = `<head><base href="${baseHref}"></head>${rewrittenHtml}`;
        }

        // Rewrite all relative src/href attributes to absolute URLs
        rewrittenHtml = rewrittenHtml.replace(
          /(src|href)=(['"])(?!https?:\/\/|data:)(.*?)\2/gi,
          (match, attr, quote, url) => {
            console.log("DEBUG: Rewriting URL:", url);
            const currentAbsoluteGameFolderPath = `${rawBaseUrl}${gameFolderPath}/`;
            console.log(
              "DEBUG: currentAbsoluteGameFolderPath",
              currentAbsoluteGameFolderPath,
            );

            let rewrittenUrl;
            if (url.startsWith("/")) {
              // Root-relative path, make it absolute to the rawBaseUrl
              rewrittenUrl = `${rawBaseUrl}${url.substring(1)}`;
            } else {
              // Truly relative path, make it absolute to the gameFolderPath
              rewrittenUrl = `${currentAbsoluteGameFolderPath}${url}`;
            }
            console.log("DEBUG: Rewritten URL:", rewrittenUrl);
            return `${attr}=${quote}${rewrittenUrl}${quote}`;
          },
        );

        // Special handling for UnityLoader.instantiate jsonUrl
        const instantiateMatch = rewrittenHtml.match(
          /UnityLoader\.instantiate\(\s*"gameContainer"\s*,\s*"([^"]+)"\s*,/,
        );
        if (instantiateMatch) {
          const jsonPath = instantiateMatch[1];
          let absoluteJson;
          if (jsonPath.startsWith("/")) {
            absoluteJson = `${rawBaseUrl}${jsonPath.substring(1)}`;
          } else {
            absoluteJson = `${rawBaseUrl}${gameFolderPath}/${jsonPath}`;
          }
          rewrittenHtml = rewrittenHtml.replace(
            instantiateMatch[0],
            `UnityLoader.instantiate("gameContainer", "${absoluteJson}", `,
          );
          console.log(`Rewrote UnityLoader jsonUrl to: ${absoluteJson}`);
        }

        console.log("Rewritten HTML (message):", rewrittenHtml); // Log rewritten HTML if needed

        event.source.postMessage({
          type: "GAME_CACHED_HTML",
          gameLink: gameLink,
          htmlContent: rewrittenHtml,
        });
        console.log(`Sent GAME_CACHED_HTML for ${gameTitle} to client.`);
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

  // 1. Intercept the initial /cached-game/ request for the main HTML file
  if (requestUrl.pathname.startsWith("/cached-game/")) {
    console.log("DEBUG: Matched /cached-game/ path.");
    const encodedGameLink = requestUrl.pathname.replace("/cached-game/", "");
    const gameLink = decodeURIComponent(encodedGameLink);
    const gameHtmlGithubUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${gameLink}`;

    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(gameHtmlGithubUrl).then(async (cachedResponse) => {
          if (cachedResponse) {
            console.log("Serving main HTML from cache:", gameHtmlGithubUrl);
            const htmlText = await cachedResponse.text();
            let rewrittenHtml = htmlText; // Initialize with original HTML

            console.log("DEBUG: gameLink", gameLink);
            const gameFolderPath = gameLink.substring(
              0,
              gameLink.lastIndexOf("/"),
            );
            console.log("DEBUG: gameFolderPath", gameFolderPath);
            const rawBaseUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/`;
            console.log("DEBUG: rawBaseUrl", rawBaseUrl);

            // 1. Inject a <base> tag to handle relative paths correctly.
            const baseHref = `${rawBaseUrl}${gameFolderPath}/`;
            console.log("DEBUG: baseHref", baseHref);
            if (rewrittenHtml.includes("<head>")) {
              rewrittenHtml = rewrittenHtml.replace(
                "<head>",
                `<head><base href="${baseHref}">`,
              );
            } else {
              rewrittenHtml = `<head><base href="${baseHref}"></head>${rewrittenHtml}`;
            }

            // Rewrite all relative src/href attributes to absolute URLs
            rewrittenHtml = rewrittenHtml.replace(
              /(src|href)=(['"])(?!https?:\/\/|data:)(.*?)\2/gi,
              (match, attr, quote, url) => {
                console.log("DEBUG: Rewriting URL:", url);
                const currentgameFolderPath = gameLink.substring(
                  0,
                  gameLink.lastIndexOf("/"),
                );
                const currentAbsoluteGameFolderPath = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${currentgameFolderPath}/`;
                console.log(
                  "DEBUG: currentAbsoluteGameFolderPath",
                  currentAbsoluteGameFolderPath,
                );

                let rewrittenUrl;
                if (url.startsWith("/")) {
                  // Root-relative path, make it absolute to the rawBaseUrl
                  rewrittenUrl = `${rawBaseUrl}${url.substring(1)}`;
                } else {
                  // Truly relative path, make it absolute to the gameFolderPath (handled by base tag, but explicit rewrite for robustness)
                  rewrittenUrl = `${currentAbsoluteGameFolderPath}${url}`;
                }
                console.log("DEBUG: Rewritten URL:", rewrittenUrl);
                return `${attr}=${quote}${rewrittenUrl}${quote}`;
              },
            );

            console.log("Rewritten HTML (fetch):", rewrittenHtml); // Log rewritten HTML

            return new Response(rewrittenHtml, {
              headers: { "Content-Type": "text/html" },
            });
          }
          // If main HTML not in cache, try network (shouldn't happen if CACHE_GAME worked)
          console.warn(
            "Main HTML not found in cache, fetching from network:",
            gameHtmlGithubUrl,
          );
          return fetch(gameHtmlGithubUrl);
        });
      }),
    );
    return;
  }

  // 2. Intercept requests for assets (images, scripts, css) that are now absolute GitHub raw URLs
  //    These requests will come from the iframe after the HTML has been rewritten.
  if (
    requestUrl.origin === "https://raw.githubusercontent.com" &&
    requestUrl.pathname.startsWith(`/${GITHUB_REPO}/main/`)
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return new Promise(async (resolve) => {
          if (cachedResponse) {
            console.log("Serving asset from cache:", event.request.url);
            const headers = new Headers(cachedResponse.headers);
            const assetPathInRepo = requestUrl.pathname.replace(
              `/${GITHUB_REPO}/main/`,
              "",
            );
            headers.set("Content-Type", getMimeType(assetPathInRepo));
            resolve(new Response(cachedResponse.body, { headers }));
          } else {
            // If asset not in cache (e.g., new asset or cache miss), try network
            console.log("Fetching asset from network:", event.request.url);
            const networkResponse = await fetch(event.request);
            const newHeaders = new Headers(networkResponse.headers);
            newHeaders.set("Access-Control-Allow-Origin", "*"); // Add CORS header
            resolve(
              new Response(networkResponse.body, { headers: newHeaders }),
            );
          }
        });
      }),
    );
    return;
  }

  // For all other requests (e.g., /games.json, external resources), go to network
  event.respondWith(fetch(event.request));
});
