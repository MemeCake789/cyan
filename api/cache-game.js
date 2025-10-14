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

  const gameRepoPath = gameLink.startsWith('cyan-assets/') ? gameLink.substring('cyan-assets/'.length) : gameLink;
  const gameFolderPath = gameRepoPath.substring(0, gameRepoPath.lastIndexOf('/'));
  const rawBaseUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/`;

  try {
    // Fetch only the main HTML file
    const mainHtmlGithubUrl = `${rawBaseUrl}${gameRepoPath}`;
    const fileResponse = await fetch(mainHtmlGithubUrl);

    if (!fileResponse.ok) {
      console.error(`Failed to fetch main HTML ${mainHtmlGithubUrl}: ${fileResponse.status}`);
      return res.status(fileResponse.status).json({ error: `Failed to fetch main HTML: ${fileResponse.statusText}` });
    }

    let htmlContent = await fileResponse.text();
    let rewrittenHtml = htmlContent;

    // Inject <base> tag
    const baseHref = `${rawBaseUrl}${gameFolderPath}/`;
    if (rewrittenHtml.includes('<head>')) {
      rewrittenHtml = rewrittenHtml.replace('<head>', `<head><base href="${baseHref}">`);
    } else {
      rewrittenHtml = `<head><base href="${baseHref}"></head>${rewrittenHtml}`;
    }

    // Rewrite relative src/href/data-src and url() in CSS
    rewrittenHtml = rewrittenHtml.replace(
      /(src|href|data-src)=(['\"])(?!https?:\/\/|data:)(.*?)\2/gi,
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

    rewrittenHtml = rewrittenHtml.replace(
      /url\((?!['\"]?https?:\/\/|['\"]?data:)(['\"]?)(.*?)\1\)/gi,
      (match, quote, url) => {
        let rewrittenUrl;
        if (url.startsWith('/')) {
          rewrittenUrl = `${rawBaseUrl}${url.substring(1)}`;
        } else {
          rewrittenUrl = `${rawBaseUrl}${gameFolderPath}/${url}`;
        }
        return `url(${quote}${rewrittenUrl}${quote})`;
      },
    );

    // Special handling for UnityLoader.instantiate script execution timing and jsonUrl
    const unityScriptBlockRegex = /(<script>\s*var unityInstance = UnityLoader\.instantiate\(\s*"gameContainer"\s*,\s*"([^"]+)"\s*,\s*{onProgress: UnityProgress}\);\s*<\/script>)/i;
    const unityScriptMatch = rewrittenHtml.match(unityScriptBlockRegex);

    if (unityScriptMatch) {
      const fullScriptBlock = unityScriptMatch[1]; // The entire <script>...</script> block
      const jsonPath = unityScriptMatch[2]; // The JSON path from the instantiate call

      let absoluteJson = jsonPath.startsWith('/') ? `${rawBaseUrl}${jsonPath.substring(1)}` : `${rawBaseUrl}${gameFolderPath}/${jsonPath}`;

      // Replace the relative jsonPath with the absolute one within the script block
      let modifiedScriptContent = fullScriptBlock.replace(
        `"${jsonPath}"`,
        `"${absoluteJson}"`
      );

      // Wrap the content of the script block in window.onload
      const scriptContentInnerRegex = /<script>([\s\S]*?)<\/script>/i;
      const contentMatch = modifiedScriptContent.match(scriptContentInnerRegex);
      if (contentMatch && contentMatch[1]) {
        const originalContent = contentMatch[1];
        const wrappedContent = `window.onload = function() {\n${originalContent}\n};`;
        modifiedScriptContent = `<script>${wrappedContent}<\/script>`;
      }

      rewrittenHtml = rewrittenHtml.replace(fullScriptBlock, modifiedScriptContent);
      console.log(`Rewrote UnityLoader script block for jsonUrl: ${absoluteJson} and wrapped in window.onload`);
    }

    return res.status(200).json({ htmlContent: rewrittenHtml });
  } catch (error) {
    console.error('Error in cache-game API:', error);
    return res.status(500).json({ error: error.message });
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
      /(src|href|data-src)=(['\"])(?!https?:\/\/|data:)(.*?)\\2/gi,\n      (match, attr, quote, url) => {\n        let rewrittenUrl;\n        if (url.startsWith('/')) {\n          rewrittenUrl = `${rawBaseUrl}${url.substring(1)}`;\n        } else {\n          rewrittenUrl = `${rawBaseUrl}${gameFolderPath}/${url}`;\n        }\n        return `${attr}=${quote}${rewrittenUrl}${quote}`;\n      },\n    );\n\n    // Rewrite relative URLs in CSS url() functions\n    rewrittenHtml = rewrittenHtml.replace(\n      /url\\((?!['\"]?https?:\\/\\/|['\"]?data:)(['\"]?)(.*?)\\1\\)/gi,\n      (match, quote, url) => {\n        let rewrittenUrl;\n        if (url.startsWith('/')) {\n          rewrittenUrl = `${rawBaseUrl}${url.substring(1)}`;\n        } else {\n          rewrittenUrl = `${rawBaseUrl}${gameFolderPath}/${url}`;\n        }\n        return `url(${quote}${rewrittenUrl}${quote})`;\n      },
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

    // Special handling for UnityLoader.instantiate script execution timing and jsonUrl
    const unityScriptBlockRegex = /(<script>\s*var unityInstance = UnityLoader\.instantiate\(\s*"gameContainer"\s*,\s*"([^"]+)"\s*,\s*{onProgress: UnityProgress}\);\s*<\/script>)/i;
    const unityScriptMatch = rewrittenHtml.match(unityScriptBlockRegex);

    if (unityScriptMatch) {
      const fullScriptBlock = unityScriptMatch[1]; // The entire <script>...</script> block
      const jsonPath = unityScriptMatch[2]; // The JSON path from the instantiate call

      let absoluteJson = jsonPath.startsWith('/') ? `${rawBaseUrl}${jsonPath.substring(1)}` : `${rawBaseUrl}${gameFolderPath}/${jsonPath}`;

      // Replace the relative jsonPath with the absolute one within the script block
      let modifiedScriptContent = fullScriptBlock.replace(
        `"${jsonPath}"`,
        `"${absoluteJson}"`
      );

      // Wrap the content of the script block in window.onload
      const scriptContentInnerRegex = /<script>([\s\S]*?)<\/script>/i;
      const contentMatch = modifiedScriptContent.match(scriptContentInnerRegex);
      if (contentMatch && contentMatch[1]) {
        const originalContent = contentMatch[1];
        const wrappedContent = `window.onload = function() {\n${originalContent}\n};`;
        modifiedScriptContent = `<script>${wrappedContent}<\/script>`;
      }

      rewrittenHtml = rewrittenHtml.replace(fullScriptBlock, modifiedScriptContent);
      console.log(`Rewrote UnityLoader script block for jsonUrl: ${absoluteJson} and wrapped in window.onload`);
    }

    return res.status(200).json({ htmlContent: rewrittenHtml });
  } catch (error) {
    console.error('Error in cache-game API:', error);
    return res.status(500).json({ error: error.message });
  }
}
