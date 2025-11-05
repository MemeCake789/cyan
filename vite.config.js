import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { URL } from 'url';
import javascriptObfuscator from 'vite-plugin-javascript-obfuscator';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  define: {
    'process.env': {}
  },
  plugins: [
    react(),
    command === 'build' && javascriptObfuscator({
        options: {
            compact: true,
            controlFlowFlattening: true,
            deadCodeInjection: true,
            debugProtection: false,
            disableConsoleOutput: false,
            numbersToExpressions: true,
            renameGlobals: false,
            selfDefending: false,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 0.75,
            unicodeEscapeSequence: false
        }
    }),
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
    }
  ].filter(Boolean),
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
