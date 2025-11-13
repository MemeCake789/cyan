
import { createBareServer } from "@tomphttp/bare-server-node";
import express from "express";
import { createServer } from "node:http";
import { publicPath } from "ultraviolet-static";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use(express.static(publicPath));
app.use("/uv/", express.static(uvPath));

app.use("/discord", createProxyMiddleware({ 
    target: "https://e.widgetbot.io", 
    changeOrigin: true,
    pathRewrite: {
        '^/discord': ''
    }
}));

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
