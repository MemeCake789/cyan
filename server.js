import { createBareServer } from "@tomphttp/bare-server-node";
import express from "express";
import { createServer } from "node:http";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use(express.static("dist")); // Assuming 'dist' is the build output, or remove if handled by Vercel static build

app.use("/discord", createProxyMiddleware({
  target: "https://e.widgetbot.io",
  changeOrigin: true,
  pathRewrite: {
    '^/discord': ''
  }
}));

import { put } from '@vercel/blob';

app.post('/api/recommend', express.json(), async (req, res) => {
  try {
    const { gameName } = req.body;
    if (!gameName) {
      return res.status(400).json({ message: 'Game name is required' });
    }

    const filename = `recommendations/${Date.now()}-${gameName.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    await put(filename, `Game recommended: ${gameName}`, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    res.status(200).json({ message: 'Game recommended successfully!' });
  } catch (error) {
    console.error('Error recommending game:', error);
    res.status(500).json({ message: 'Failed to recommend game.' });
  }
});

app.post('/api/report', express.json(), async (req, res) => {
  try {
    const { bugDescription } = req.body;
    if (!bugDescription) {
      return res.status(400).json({ message: 'Bug description is required' });
    }

    const filename = `reports/${Date.now()}-bug.txt`;
    await put(filename, `Bug reported: ${bugDescription}`, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    res.status(200).json({ message: 'Bug reported successfully!' });
  } catch (error) {
    console.error('Error reporting bug:', error);
    res.status(500).json({ message: 'Failed to report bug.' });
  }
});

const bare = createBareServer("/bare/");

app.use((req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    res.status(404).send("Not found");
  }
});

const server = createServer(app);
const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default app;
