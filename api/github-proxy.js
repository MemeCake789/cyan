import fetch from 'node-fetch';

export default async function(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { assetPath } = req.query;

  if (!assetPath) {
    return res.status(400).send('Missing assetPath query parameter.');
  }

  const githubRepoOwner = 'Cyanide-App';
  const githubRepoName = 'cyan-assets';
  const githubBranch = 'main';

  const rawGithubUrl = `https://raw.githubusercontent.com/${githubRepoOwner}/${githubRepoName}/${githubBranch}/${assetPath}`;

  try {
    const response = await fetch(rawGithubUrl);

    if (!response.ok) {
      console.error(`Failed to fetch from GitHub: ${response.status} ${response.statusText} for ${assetPath}`);
      return res.status(response.status).send(`Failed to fetch asset from GitHub: ${response.statusText}`);
    }

    // Determine and set Content-Type based on file extension
    if (assetPath.endsWith('.html') || assetPath.endsWith('.htm')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    } else if (assetPath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (assetPath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (assetPath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    } else if (assetPath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (assetPath.endsWith('.jpg') || assetPath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (assetPath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (assetPath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (assetPath.endsWith('.swf')) {
      res.setHeader('Content-Type', 'application/x-shockwave-flash');
    } else if (assetPath.endsWith('.love')) {
      res.setHeader('Content-Type', 'application/x-love-game'); // Or application/octet-stream
    }
    else {
      // Fallback to the content-type provided by GitHub or a generic binary type
      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      } else {
        res.setHeader('Content-Type', 'application/octet-stream'); // Generic binary fallback
      }
    }

    response.body.pipe(res);

  } catch (error) {
    console.error('Error in GitHub proxy:', error);
    res.status(500).send('Internal Server Error while proxying GitHub asset.');
  }
}
