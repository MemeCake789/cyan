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
  const rawBaseUrl = 'https://cyan-assets.vercel.app/';

  try {
    // Fetch only the main HTML file
    const mainHtmlUrl = `${rawBaseUrl}${gameRepoPath}`;
    const fileResponse = await fetch(mainHtmlUrl);

    if (!fileResponse.ok) {
      console.error(`Failed to fetch main HTML ${mainHtmlUrl}: ${fileResponse.status}`);
      return res.status(fileResponse.status).json({ error: `Failed to fetch main HTML: ${fileResponse.statusText}` });
    }

    let htmlContent = await fileResponse.text();
    let rewrittenHtml = htmlContent;
    const assets = [];

    // Inject <base> tag
    const baseHref = `${rawBaseUrl}${gameFolderPath}/`;
    if (rewrittenHtml.includes('<head>')) {
      rewrittenHtml = rewrittenHtml.replace('<head>', `<head><base href="${baseHref}">`);
    } else {
      rewrittenHtml = `<head><base href="${baseHref}"></head>${rewrittenHtml}`;
    }

    // Rewrite relative src/href/data-src and url() in CSS
    rewrittenHtml = rewrittenHtml.replace(
      /(src|href|data-src)=(['"])(?!https?:\/\/|data:)(.*?)\2/gi,
      (match, attr, quote, url) => {
        let rewrittenUrl;
        if (url.startsWith('/')) {
          rewrittenUrl = `${rawBaseUrl}${url.substring(1)}`;
        } else {
          rewrittenUrl = `${rawBaseUrl}${gameFolderPath}/${url}`;
        }
        assets.push(rewrittenUrl);
        return `${attr}=${quote}${rewrittenUrl}${quote}`;
      },
    );

    rewrittenHtml = rewrittenHtml.replace(
      /url\((?!['"]?https?:\/\/|['"]?data:)(['"]?)(.*?)\1\)/gi,
      (match, quote, url) => {
        let rewrittenUrl;
        if (url.startsWith('/')) {
          rewrittenUrl = `${rawBaseUrl}${url.substring(1)}`;
        } else {
          rewrittenUrl = `${rawBaseUrl}${gameFolderPath}/${url}`;
        }
        assets.push(rewrittenUrl);
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
      assets.push(absoluteJson);

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

    return res.status(200).json({ htmlContent: rewrittenHtml, assets });
  } catch (error) {
    console.error('Error in cache-game API:', error);
    return res.status(500).json({ error: error.message });
  }
  }
