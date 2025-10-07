import fs from 'fs';
import path from 'path';
import yauzl from 'yauzl';
import mime from 'mime-types';

// Helper to buffer a stream
function bufferStream(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

// Promisified yauzl functions
function fromBuffer(buffer) {
    return new Promise((resolve, reject) => {
        yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipfile) => {
            if (err) reject(err);
            else resolve(zipfile);
        });
    });
}

function openReadStream(zipfile, entry) {
    return new Promise((resolve, reject) => {
        zipfile.openReadStream(entry, (err, stream) => {
            if (err) reject(err);
            else resolve(stream);
        });
    });
}

export default async function (req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { zipPath, htmlFile } = req.query;
  let { assetPath } = req.query;


  if (assetPath && assetPath.startsWith('./')) {
      assetPath = assetPath.substring(2);
  }

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

    const zipPartRegex = new RegExp(`^${zipBaseName}\.z(ip|[0-9]{2})$`);

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

    const zipfile = await fromBuffer(zipBuffer);
    const entries = await new Promise((resolve, reject) => {
        const collectedEntries = [];
        zipfile.on('entry', (entry) => {
            collectedEntries.push(entry);
            zipfile.readEntry();
        });
        zipfile.on('end', () => resolve(collectedEntries));
        zipfile.on('error', reject);
        zipfile.readEntry();
    });

    if (assetPath) {
      const entry = entries.find(e => e.fileName === assetPath);
      if (entry) {
        const readStream = await openReadStream(zipfile, entry);
        const contentType = getContentType(assetPath);
        res.setHeader('Content-Type', contentType);
        readStream.pipe(res);
      } else {
        res.status(404).send('Asset not found in zip');
      }
    } else {
      let htmlEntry;
      if (htmlFile) {
        htmlEntry = entries.find(e => e.fileName === htmlFile);
      }

      if (!htmlEntry) {
        htmlEntry = entries.find(e => e.fileName.endsWith('index.html'));
      }

      if (!htmlEntry) {
        htmlEntry = entries.find(e => e.fileName.endsWith('.html'));
      }

      if (htmlEntry) {
        const readStream = await openReadStream(zipfile, htmlEntry);
        const htmlContent = await bufferStream(readStream);
        const baseHref = `/api/zip-proxy?zipPath=${encodeURIComponent(zipPath)}&assetPath=${encodeURIComponent(path.dirname(htmlEntry.fileName))}/`;
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
