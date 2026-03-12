import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy endpoint to avoid CORS issues
  app.post("/api/proxy-webhook", async (req, res) => {
    const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://igreen-n8n.rdgveg.easypanel.host/webhook/ouvidoria';
    
    console.log(`[Proxy] Recebida requisição para o webhook: ${WEBHOOK_URL}`);
    
    try {
      console.log(`[Proxy] Enviando POST para: ${WEBHOOK_URL}`);
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
        redirect: 'follow' // Garantir que seguimos redirecionamentos se houver
      });

      const data = await response.text();
      console.log(`[Proxy] Resposta final do n8n: Status ${response.status}`);
      console.log(`[Proxy] URL final da resposta: ${response.url}`);
      
      res.status(response.status).send(data);
    } catch (error) {
      console.error('[Proxy] Erro ao conectar no n8n:', error);
      res.status(502).json({ 
        error: 'Não foi possível alcançar o servidor n8n.',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
