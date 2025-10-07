import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import mime from 'mime-types';
import stream from 'stream';

export default async function (req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { zipPath, assetPath, htmlFile } = req.query;

  if (!zipPath) {
    return res.status(400).json({ message: 'zipPath query parameter is required' });
  }

  try {
    const publicPath = path.join(process.cwd(), 'public');
    const fullZipPath = path.join(publicPath, zipPath);
    const zipDirectory = path.dirname(fullZipPath);
    const zipBaseName = path.basename(fullZipPath, path.extname(fullZipPath));

    let zipBuffer;
    const zipParts = [];
    const files = fs.readdirSync(zipDirectory);

    const zipPartRegex = new RegExp(`^${zipBaseName}\\.z(ip|[0-9]{2})$`);

    files.forEach(file => {
        if (zipPartRegex.test(file)) {
            zipParts.push(path.join(zipDirectory, file));
        }
    });

    if (zipParts.length > 0) {
        zipParts.sort();
        const buffers = zipParts.map(part => fs.readFileSync(part));
        zipBuffer = Buffer.concat(buffers);
    } else if (fs.existsSync(fullZipPath)) {
        zipBuffer = fs.readFileSync(fullZipPath);
    } else {
        return res.status(404).json({ message: 'Zip file not found' });
    }

    const zip = await unzipper.Open.buffer(zipBuffer);

    if (assetPath) {
      const entry = zip.files.find(e => e.path === assetPath);
      if (entry) {
        const contentType = getContentType(assetPath);
        res.setHeader('Content-Type', contentType);
        entry.stream().pipe(res);
      } else {
        res.status(404).send('Asset not found in zip');
      }
    } else {
      let htmlEntry;
      if (htmlFile) {
        htmlEntry = zip.files.find(e => e.path === htmlFile);
      }

      if (!htmlEntry) {
        htmlEntry = zip.files.find(e => e.path.endsWith('index.html'));
      }

      if (!htmlEntry) {
        htmlEntry = zip.files.find(e => e.path.endsWith('.html'));
      }

      if (htmlEntry) {
        const htmlContent = await htmlEntry.buffer();
        const baseHref = `/api/zip-proxy?zipPath=${encodeURIComponent(zipPath)}&assetPath=${encodeURIComponent(path.dirname(htmlEntry.path))}/`;
        let content = htmlContent.toString('utf8');
        content = content.replace('<head>', `<head><base href="${baseHref}">`);
        res.setHeader('Content-Type', 'text/html');
        res.send(content);
      } else {
        res.status(404).send('No HTML file found in zip');
      }
    }
  } catch (error) {
    console.error('Error in zip-proxy:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

function getContentType(filePath) {
  return mime.lookup(filePath) || 'application/octet-stream';
}