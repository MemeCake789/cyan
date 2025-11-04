import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { URL } from 'url';
import { viteObfuscateFile } from 'vite-plugin-obfuscator'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  define: {
    'process.env': {}
  },
  plugins: [
    react(),
    {
      name: 'handle-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/')) {
            const apiFilePath = path.join(process.cwd(), req.url.split('?')[0]);
            try {
              const module = await server.ssrLoadModule(apiFilePath);
              const handler = module.default;

              const url = new URL(req.url, `http://${req.headers.host}`);
              req.query = Object.fromEntries(url.searchParams);

              await handler(req, res);
            } catch (error) {
              console.error(error);
              res.statusCode = 500;
              res.end('Internal Server Error');
            }
          } else {
            next();
          }
        });
      }
    },
    command === 'build' && viteObfuscateFile({
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: false,
      debugProtectionInterval: 0,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      numbersToExpressions: true,
      renameGlobals: false,
      rotateStringArray: true,
      selfDefending: true,
      shuffleStringArray: true,
      splitStrings: true,
      splitStringsChunkLength: 10,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 0.75,
      target: 'browser',
      transformObjectKeys: true,
      unicodeEscapeSequence: false
    })
  ],
  server: {
    proxy: {
      '/g4f': {
        target: 'https://g4f.dev/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/g4f/, '')
      }
    }
  }
}))