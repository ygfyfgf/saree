import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { type Server } from "http";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  try {
    const viteServer = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: { server }
      },
      appType: "custom",
      root: path.resolve(__dirname, "..", "client"),
      configFile: path.resolve(__dirname, "..", "vite.config.ts")
    });

    app.use(viteServer.middlewares);
    
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      
      try {
        const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");
        
        if (!fs.existsSync(clientTemplate)) {
          throw new Error(`Template file not found: ${clientTemplate}`);
        }
        
        let template = await fs.promises.readFile(clientTemplate, "utf-8");
        const page = await viteServer.transformIndexHtml(url, template);
        
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } catch (e) {
        if (viteServer.ssrFixStacktrace) {
          viteServer.ssrFixStacktrace(e as Error);
        }
        next(e);
      }
    });
  } catch (error) {
    console.error('Error setting up Vite:', error);
    throw error;
  }
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");
  
  if (!fs.existsSync(distPath)) {
    console.warn(`Build directory not found: ${distPath}`);
    console.warn("Make sure to build the client first with: npm run build");
    
    // Serve a simple fallback page
    app.use("*", (_req, res) => {
      res.status(503).send(`
        <html>
          <head><title>Service Unavailable</title></head>
          <body>
            <h1>Service Unavailable</h1>
            <p>The application is not built yet. Please run 'npm run build' first.</p>
          </body>
        </html>
      `);
    });
    return;
  }
  
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}