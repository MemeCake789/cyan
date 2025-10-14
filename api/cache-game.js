// src/pages/api/cache-game.js (Next.js API route)

import { Octokit } from '@octokit/rest';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { gameLink, gameTitle } = req.body;

  if (!gameLink || !gameTitle) {
    return res.status(400).json({ error: 'Missing gameLink or gameTitle' });
  }

  const GITHUB_REPO = 'MemeCake789/cyan-assets';
  const CACHE_NAME = 'cyan-game-cache-v1'; // Not used server-side, but for consistency

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

  // Adjust gameLink to be relative to the repo root (e.g., 'HTML/Bitlife/index.html')
  const gameRepoPath = gameLink.startsWith('cyan-assets/') ? gameLink.substring('cyan-assets/'.length) : gameLink;
  const gameFolderPath = gameRepoPath.substring(0, gameRepoPath.lastIndexOf('/'));

  try {
    const octokit = new Octokit(); // Use authenticated if rate-limited

    // 1. Get the SHA of the main branch
    const branchResponse = await octokit.repos.getBranch({
      owner: GITHUB_REPO.split('/')[0],
      repo: GITHUB_REPO.split('/')[1],
      branch: 'main',
    });
    const treeSha = branchResponse.data.commit.sha;

    // 2. Get the recursive tree for the entire repository
    const treeResponse = await octokit.git.getTree({
      owner: GITHUB_REPO.split('/')[0],
      repo: GITHUB_REPO.split('/')[1],
      tree_sha: treeSha,
      recursive: true,
    });

    const filesToCache = [];
    const rawBaseUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/`;

    // 3. Filter files relevant to the game folder
    for (const item of treeResponse.data.tree) {
      if (item.type === 'blob' && item.path.startsWith(gameFolderPath)) {
        filesToCache.push({
          path: item.path,
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

    // Fetch and "cache" (but server-side, we just fetch all for now; real caching could use Vercel KV or similar)
    const fetchedFiles = {};
    for (const file of filesToCache) {
      const fileResponse = await fetch(file.download_url);
      if (fileResponse.ok) {
        fetchedFiles[file.download_url] = await fileResponse.text(); // Store text for HTML/JS, but for binary, use buffer if needed
      } else {
        console.error(`Failed to fetch ${file.path}: ${fileResponse.status}`);
      }
    }

    // Get main HTML and rewrite
    const mainHtmlGithubUrl = `${rawBaseUrl}${gameRepoPath}`;
    let htmlContent = fetchedFiles[mainHtmlGithubUrl];
    if (!htmlContent) {
      return res.status(500).json({ error: 'Main HTML not fetched' });
    }

    let rewrittenHtml = htmlContent;

    // Inject <base> tag
    const baseHref = `${rawBaseUrl}${gameFolderPath}/`;
    if (rewrittenHtml.includes('<head>')) {
      rewrittenHtml = rewrittenHtml.replace('<head>', `<head><base href="${baseHref}">`);
    } else {
      rewrittenHtml = `<head><base href="${baseHref}"></head>${rewrittenHtml}`;
    }

    // Rewrite relative src/href
    rewrittenHtml = rewrittenHtml.replace(
      /(src|href)=(['"])(?!https?:\/\/|data:)(.*?)\2/gi,
      (match, attr, quote, url) => {
        let rewrittenUrl;
        if (url.startsWith('/')) {
          rewrittenUrl = `${rawBaseUrl}${url.substring(1)}`;
        } else {
          rewrittenUrl = `${rawBaseUrl}${gameFolderPath}/${url}`;
        }
        return `${attr}=${quote}${rewrittenUrl}${quote}`;
      },
    );

    // Special for UnityLoader jsonUrl
    const instantiateMatch = rewrittenHtml.match(/UnityLoader\.instantiate\(\s*"gameContainer"\s*,\s*"([^"]+)"\s*,/);
    if (instantiateMatch) {
      const jsonPath = instantiateMatch[1];
      let absoluteJson = jsonPath.startsWith('/') ? `${rawBaseUrl}${jsonPath.substring(1)}` : `${rawBaseUrl}${gameFolderPath}/${jsonPath}`;
      rewrittenHtml = rewrittenHtml.replace(
        instantiateMatch[0],
        `UnityLoader.instantiate("gameContainer", "${absoluteJson}", `,
      );
    }

    return res.status(200).json({ htmlContent: rewrittenHtml });
  } catch (error) {
    console.error('Error in cache-game API:', error);
    return res.status(500).json({ error: error.message });
  }
}
