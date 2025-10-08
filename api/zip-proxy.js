import fs from 'fs';
import path from 'path';
import { Unzip } from 'fflate';
import mime from 'mime-types';

function getContentType(filePath) {
  return mime.lookup(filePath) || 'application/octet-stream';
}

export default async function (req, res) {
  // CORS headers
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

    if (assetPath) {
      const unzip = new Unzip();
      let assetFound = false;
      unzip.onfile = file => {
        if (assetFound) {
          file.terminate();
          return;
        }
        if (file.name === assetPath) {
          assetFound = true;
          res.setHeader('Content-Type', getContentType(assetPath));
          file.pipe(res);
        } else {
          file.terminate();
        }
      };
      unzip.on('finish', () => {
        if (!assetFound) {
          res.status(404).send('Asset not found in zip');
        }
      });
      unzip.push(zipBuffer, true);

    } else {
      const fileNames = await new Promise(resolve => {
        const names = [];
        const unzip = new Unzip(file => {
          names.push(file.name);
          file.terminate();
        });
        unzip.on('finish', () => resolve(names));
        unzip.push(zipBuffer, true);
      });

      let htmlFileName;
      if (htmlFile) {
        htmlFileName = fileNames.find(name => name === htmlFile);
      }
      if (!htmlFileName) {
        htmlFileName = fileNames.find(name => name.endsWith('index.html'));
      }
      if (!htmlFileName) {
        htmlFileName = fileNames.find(name => name.endsWith('.html'));
      }

      if (htmlFileName) {
        const htmlContent = await new Promise(resolve => {
          const unzip2 = new Unzip(file => {
            if (file.name === htmlFileName) {
              const chunks = [];
              file.on('data', c => chunks.push(c));
              file.on('end', () => resolve(Buffer.concat(chunks)));
            } else {
              file.terminate();
            }
          });
          unzip2.push(zipBuffer, true);
        });

        const baseHref = `/api/zip-proxy?zipPath=${encodeURIComponent(zipPath)}&assetPath=${encodeURIComponent(path.dirname(htmlFileName))}/`;
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